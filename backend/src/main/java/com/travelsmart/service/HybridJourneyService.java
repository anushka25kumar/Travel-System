package com.travelsmart.service;

import com.travelsmart.dto.CustomHybridRequest;
import com.travelsmart.dto.CustomHybridValidationResultDTO;
import com.travelsmart.dto.CustomLegInputDTO;
import com.travelsmart.dto.JourneyLegDTO;
import com.travelsmart.entity.*;
import com.travelsmart.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class HybridJourneyService {

    private final CityRepository cityRepository;
    private final ScheduleRepository scheduleRepository;
    private final HybridJourneyRepository hybridJourneyRepository;
    private final UserRepository userRepository;

    public HybridJourneyService(CityRepository cityRepository,
                                ScheduleRepository scheduleRepository,
                                HybridJourneyRepository hybridJourneyRepository,
                                UserRepository userRepository) {
        this.cityRepository = cityRepository;
        this.scheduleRepository = scheduleRepository;
        this.hybridJourneyRepository = hybridJourneyRepository;
        this.userRepository = userRepository;
    }

    public CustomHybridValidationResultDTO validateAndCalculate(CustomHybridRequest request) {
        CustomHybridValidationResultDTO result = new CustomHybridValidationResultDTO();

        if (request.getLegs() == null || request.getLegs().isEmpty()) {
            result.setValid(false);
            result.setStatusMessage("Please add at least one journey leg.");
            result.setRiskLevel("IMPOSSIBLE");
            return result;
        }

        if (request.getLegs().size() > 5) {
            result.setValid(false);
            result.setStatusMessage("A maximum of 5 transfer legs is supported for journey safety.");
            result.setRiskLevel("IMPOSSIBLE");
            return result;
        }

        int passengers = (request.getPassengers() != null && request.getPassengers() > 0) ? request.getPassengers() : 1;
        List<JourneyLegDTO> resolvedLegs = new ArrayList<>();
        List<String> alerts = new ArrayList<>();
        List<Schedule> selectedSchedules = new ArrayList<>();

        BigDecimal totalPrice = BigDecimal.ZERO;
        int totalTravelTime = 0;
        int totalLayoverTime = 0;
        LocalDateTime lastArrivalTime = null;
        String prevDestCity = null;
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm:ss");

        for (int i = 0; i < request.getLegs().size(); i++) {
            CustomLegInputDTO legInput = request.getLegs().get(i);
            String fromCityName = cleanCityName(legInput.getFromCity());
            String toCityName = cleanCityName(legInput.getToCity());

            // 1. Validate leg continuity
            if (i > 0 && prevDestCity != null && !prevDestCity.equalsIgnoreCase(fromCityName)) {
                result.setValid(false);
                result.setStatusMessage("Broken journey continuity: Leg " + (i + 1) + " departs from '" +
                        fromCityName + "' but previous leg arrived at '" + prevDestCity + "'.");
                result.setRiskLevel("IMPOSSIBLE");
                return result;
            }
            prevDestCity = toCityName;

            // 2. Find Schedule in MySQL
            Schedule matchedSchedule = null;
            if (legInput.getScheduleId() != null) {
                matchedSchedule = scheduleRepository.findById(legInput.getScheduleId()).orElse(null);
            }

            if (matchedSchedule == null) {
                City cFrom = findCity(fromCityName);
                City cTo = findCity(toCityName);
                if (cFrom == null || cTo == null) {
                    result.setValid(false);
                    result.setStatusMessage("Unable to resolve cities: '" + fromCityName + "' to '" + toCityName + "'.");
                    result.setRiskLevel("IMPOSSIBLE");
                    return result;
                }

                String prefMode = legInput.getPreferredMode();
                List<Schedule> candidates;
                if (prefMode != null && !"ANY".equalsIgnoreCase(prefMode)) {
                    candidates = scheduleRepository.findBySourceAndDestinationAndType(cFrom.getCityId(), cTo.getCityId(), prefMode.toUpperCase());
                } else {
                    candidates = scheduleRepository.findBySourceAndDestination(cFrom.getCityId(), cTo.getCityId());
                }

                if (candidates.isEmpty()) {
                    result.setValid(false);
                    result.setStatusMessage("No scheduled services available between " + fromCityName + " and " + toCityName +
                            (prefMode != null && !"ANY".equalsIgnoreCase(prefMode) ? " via " + prefMode : "") + ".");
                    result.setRiskLevel("IMPOSSIBLE");
                    return result;
                }
                matchedSchedule = candidates.get(0);
            }

            // 3. Check seat availability
            if (matchedSchedule.getAvailableSeats() < passengers) {
                result.setValid(false);
                result.setStatusMessage("Insufficient seats on Leg " + (i + 1) + " (" +
                        matchedSchedule.getTransport().getOperatorName() + "): only " +
                        matchedSchedule.getAvailableSeats() + " seats available, " + passengers + " requested.");
                result.setRiskLevel("IMPOSSIBLE");
                return result;
            }

            selectedSchedules.add(matchedSchedule);

            // 4. Validate timing & layover between legs
            LocalDateTime depTime = matchedSchedule.getDepartureDatetime();
            LocalDateTime arrTime = matchedSchedule.getArrivalDatetime();

            if (lastArrivalTime != null) {
                long layoverMinutes = Duration.between(lastArrivalTime.toLocalTime(), depTime.toLocalTime()).toMinutes();
                if (layoverMinutes < 0) {
                    layoverMinutes += 1440; // Next day connection
                }
                totalLayoverTime += (int) layoverMinutes;

                boolean isAirLeg = "FLIGHT".equalsIgnoreCase(matchedSchedule.getTransport().getTransportType()) ||
                        (i > 0 && "FLIGHT".equalsIgnoreCase(selectedSchedules.get(i - 1).getTransport().getTransportType()));
                int minBuffer = isAirLeg ? 60 : 30;

                if (layoverMinutes < minBuffer) {
                    alerts.add("Warning: Tight transfer of " + layoverMinutes + " mins at " + fromCityName +
                            " (Recommended minimum: " + minBuffer + " mins).");
                } else {
                    alerts.add("Optimal connection: " + layoverMinutes + " mins layover at " + fromCityName + ".");
                }
            }
            lastArrivalTime = arrTime;

            long legDuration = Duration.between(depTime, arrTime).toMinutes();
            if (legDuration <= 0) legDuration = 120;
            totalTravelTime += (int) legDuration;

            BigDecimal legFare = matchedSchedule.getBasePrice().multiply(BigDecimal.valueOf(passengers));
            totalPrice = totalPrice.add(legFare);

            // Build Leg DTO
            JourneyLegDTO legDTO = new JourneyLegDTO();
            legDTO.setLegOrder(i + 1);
            legDTO.setMode(matchedSchedule.getTransport().getTransportType());
            legDTO.setCarrierName(matchedSchedule.getTransport().getOperatorName());
            legDTO.setCarrierCode(matchedSchedule.getTransport().getServiceNumber());
            legDTO.setSourceCity(fromCityName);
            legDTO.setSourceStationName(fromCityName + " Terminal");
            legDTO.setDestCity(toCityName);
            legDTO.setDestStationName(toCityName + " Terminal");
            legDTO.setDepartureTime(depTime.toLocalTime());
            legDTO.setArrivalTime(arrTime.toLocalTime());
            legDTO.setDurationMinutes((int) legDuration);
            legDTO.setPrice(legFare);
            legDTO.setCo2Kg(BigDecimal.valueOf(15.0));
            resolvedLegs.add(legDTO);
        }

        // Carbon Footprint & Savings Calculation
        double totalCo2 = 0;
        for (Schedule s : selectedSchedules) {
            String t = s.getTransport().getTransportType();
            double factor = "FLIGHT".equalsIgnoreCase(t) ? 0.12 : "TRAIN".equalsIgnoreCase(t) ? 0.025 : 0.045;
            double dist = s.getRoute().getDistanceKm() != null ? s.getRoute().getDistanceKm().doubleValue() : 400;
            totalCo2 += factor * dist;
        }
        BigDecimal co2Kg = BigDecimal.valueOf(totalCo2).setScale(1, RoundingMode.HALF_UP);
        double directFlightCo2 = totalTravelTime * 0.25;
        double savedPct = directFlightCo2 > totalCo2 ? ((directFlightCo2 - totalCo2) / directFlightCo2) * 100 : 25.0;

        result.setValid(true);
        result.setStatusMessage("Custom multimodal route validated successfully!");
        result.setRiskLevel(alerts.stream().anyMatch(a -> a.contains("Tight transfer")) ? "MEDIUM" : "LOW");
        result.setTotalTravelTimeMinutes(totalTravelTime);
        result.setTotalLayoverMinutes(totalLayoverTime);
        result.setTotalDurationMinutes(totalTravelTime + totalLayoverTime);
        result.setTotalPrice(totalPrice);
        result.setTotalCo2Kg(co2Kg);
        result.setCo2SavedPercent(BigDecimal.valueOf(Math.min(95.0, Math.max(10.0, savedPct))).setScale(1, RoundingMode.HALF_UP));
        result.setTransferAlerts(alerts);
        result.setResolvedLegs(resolvedLegs);

        return result;
    }

    @Transactional
    public HybridJourney saveHybridJourney(CustomHybridRequest request, Long userId) {
        CustomHybridValidationResultDTO validation = validateAndCalculate(request);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("Cannot save invalid journey: " + validation.getStatusMessage());
        }

        User user = userRepository.findById(userId != null ? userId : 2L)
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

        String fromCityStr = cleanCityName(request.getLegs().get(0).getFromCity());
        String toCityStr = cleanCityName(request.getLegs().get(request.getLegs().size() - 1).getToCity());

        City sourceCity = findCity(fromCityStr);
        City destCity = findCity(toCityStr);

        HybridJourney journey = new HybridJourney();
        journey.setUser(user);
        journey.setSourceCity(sourceCity);
        journey.setDestinationCity(destCity);
        journey.setTotalPrice(validation.getTotalPrice());
        journey.setTotalDurationMinutes(validation.getTotalDurationMinutes());
        journey.setTransferRisk(validation.getRiskLevel());
        journey.setCreatedAt(LocalDateTime.now());

        HybridJourney saved = hybridJourneyRepository.save(journey);

        // Save Legs
        for (int i = 0; i < request.getLegs().size(); i++) {
            CustomLegInputDTO legInput = request.getLegs().get(i);
            Schedule sched;
            if (legInput.getScheduleId() != null) {
                sched = scheduleRepository.findById(legInput.getScheduleId()).orElse(null);
            } else {
                City cF = findCity(cleanCityName(legInput.getFromCity()));
                City cT = findCity(cleanCityName(legInput.getToCity()));
                List<Schedule> list = scheduleRepository.findBySourceAndDestination(cF.getCityId(), cT.getCityId());
                sched = list.isEmpty() ? null : list.get(0);
            }
            if (sched != null) {
                HybridJourneyLeg leg = new HybridJourneyLeg(saved, sched, i + 1);
                saved.getLegs().add(leg);
            }
        }

        return hybridJourneyRepository.save(saved);
    }

    public List<HybridJourney> getUserSavedJourneys(Long userId) {
        return hybridJourneyRepository.findByUser_UserIdOrderByCreatedAtDesc(userId != null ? userId : 2L);
    }

    @Transactional
    public void deleteSavedJourney(Long journeyId, Long userId) {
        hybridJourneyRepository.deleteById(journeyId);
    }

    private City findCity(String name) {
        return cityRepository.findByCityNameIgnoreCase(name)
                .orElseGet(() -> {
                    List<City> list = cityRepository.findByCityNameContainingIgnoreCaseOrderByCityNameAsc(name);
                    return list.isEmpty() ? null : list.get(0);
                });
    }

    private String cleanCityName(String raw) {
        if (raw == null) return "";
        return raw.split(",")[0].trim();
    }
}

package com.travelsmart.service;

import com.travelsmart.dto.*;
import com.travelsmart.entity.City;
import com.travelsmart.entity.HybridJourney;
import com.travelsmart.entity.HybridJourneyLeg;
import com.travelsmart.entity.Schedule;
import com.travelsmart.repository.CityRepository;
import com.travelsmart.repository.HybridJourneyRepository;
import com.travelsmart.repository.ScheduleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SearchService {

    private final ScheduleRepository scheduleRepository;
    private final CityRepository cityRepository;
    private final HybridJourneyRepository hybridJourneyRepository;
    private final RecommendationService recommendationService;

    public SearchService(ScheduleRepository scheduleRepository,
                         CityRepository cityRepository,
                         HybridJourneyRepository hybridJourneyRepository,
                         RecommendationService recommendationService) {
        this.scheduleRepository = scheduleRepository;
        this.cityRepository = cityRepository;
        this.hybridJourneyRepository = hybridJourneyRepository;
        this.recommendationService = recommendationService;
    }

    public LiveSearchResponseDTO searchLive(Long sourceCityId, Long destCityId, String source, String dest,
                                           String mode, String dateStr, Integer passengers, String sortBy) {
        // 1. Resolve Cities
        City sourceCity = resolveCity(sourceCityId, source, "Pune");
        City destCity = resolveCity(destCityId, dest, "Delhi");

        int passengerCount = (passengers != null && passengers > 0) ? passengers : 1;
        String modeFilter = (mode != null && !mode.isEmpty()) ? mode.toUpperCase() : "ALL";

        List<JourneyOptionDTO> journeyOptions = new ArrayList<>();

        // 2. Query Direct MySQL Schedules with 4-Table JOINs & Seat Capacity Check
        List<Schedule> schedules;
        if ("FLIGHT".equals(modeFilter) || "TRAIN".equals(modeFilter) || "BUS".equals(modeFilter)) {
            schedules = scheduleRepository.findAvailableSchedulesByType(sourceCity.getCityId(), destCity.getCityId(), modeFilter, passengerCount);
        } else {
            schedules = scheduleRepository.findAvailableSchedules(sourceCity.getCityId(), destCity.getCityId(), passengerCount);
        }

        DateTimeFormatter dtFormatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        for (Schedule s : schedules) {
            String type = s.getTransport().getTransportType();
            if (!"ALL".equals(modeFilter) && !modeFilter.equals(type) && !"HYBRID".equals(modeFilter)) {
                continue;
            }

            JourneyOptionDTO dto = new JourneyOptionDTO();
            dto.setId("SCH-" + s.getScheduleId());
            dto.setJourneyId("SCH-" + s.getScheduleId());
            dto.setScheduleId(s.getScheduleId());
            dto.setBasePrice(s.getBasePrice());
            dto.setTitle(s.getTransport().getOperatorName() + " (" + s.getTransport().getServiceNumber() + ")");
            dto.setJourneyType(type);
            dto.setTransportMode(type);
            dto.setOperatorName(s.getTransport().getOperatorName());
            dto.setPrimaryCarrier(s.getTransport().getOperatorName());
            dto.setServiceNumber(s.getTransport().getServiceNumber());
            dto.setCarrierCode(s.getTransport().getServiceNumber());

            dto.setSourceCity(sourceCity.getCityName());
            dto.setSourceTerminal(sourceCity.getCityName() + " Terminal");
            dto.setDestCity(destCity.getCityName());
            dto.setDestTerminal(destCity.getCityName() + " Terminal");

            LocalTime depTime = s.getDepartureDatetime().toLocalTime();
            LocalTime arrTime = s.getArrivalDatetime().toLocalTime();
            dto.setDepartureTime(depTime);
            dto.setArrivalTime(arrTime);
            dto.setDepartureDateTime(s.getDepartureDatetime().format(dtFormatter));
            dto.setArrivalDateTime(s.getArrivalDatetime().format(dtFormatter));

            long durMinutes = Duration.between(s.getDepartureDatetime(), s.getArrivalDatetime()).toMinutes();
            if (durMinutes <= 0) durMinutes = 120;
            dto.setTotalDurationMinutes((int) durMinutes);

            BigDecimal fare = s.getBasePrice().multiply(BigDecimal.valueOf(passengerCount));
            dto.setTotalPrice(fare);
            dto.setCurrency("INR");
            dto.setAvailableSeats(s.getAvailableSeats());
            dto.setAvailabilityStatus(s.getAvailableSeats() > 0 ? "AVAILABLE" : "SOLD_OUT");
            dto.setDataSource(DataSourceType.LIVE);
            dto.setTransfersCount(0);
            dto.setRiskLevel("LOW");
            dto.setTransferRisk("LOW");
            dto.setAmenities(s.getTransport().getTransportDetails());

            // Assign standard CO2 estimate
            double co2 = ("FLIGHT".equals(type) ? 0.12 : "TRAIN".equals(type) ? 0.025 : 0.045)
                    * (s.getRoute().getDistanceKm() != null ? s.getRoute().getDistanceKm().doubleValue() : 500);
            dto.setTotalCo2Kg(BigDecimal.valueOf(co2).setScale(1, RoundingMode.HALF_UP));

            // Single Leg
            JourneyLegDTO leg = new JourneyLegDTO();
            leg.setLegOrder(1);
            leg.setMode(type);
            leg.setCarrierName(s.getTransport().getOperatorName());
            leg.setCarrierCode(s.getTransport().getServiceNumber());
            leg.setSourceCity(sourceCity.getCityName());
            leg.setSourceStationName(sourceCity.getCityName() + " Terminal");
            leg.setDestCity(destCity.getCityName());
            leg.setDestStationName(destCity.getCityName() + " Terminal");
            leg.setDepartureTime(depTime);
            leg.setArrivalTime(arrTime);
            leg.setDurationMinutes((int) durMinutes);
            leg.setPrice(fare);
            leg.setCo2Kg(dto.getTotalCo2Kg());
            dto.getLegs().add(leg);

            journeyOptions.add(dto);
        }

        // 3. Include Hybrid Journeys from MySQL if mode is ALL or HYBRID
        if ("ALL".equals(modeFilter) || "HYBRID".equals(modeFilter)) {
            List<HybridJourney> hybridList = hybridJourneyRepository.findBySourceCity_CityIdAndDestinationCity_CityId(
                    sourceCity.getCityId(), destCity.getCityId());
            for (HybridJourney hj : hybridList) {
                JourneyOptionDTO dto = new JourneyOptionDTO();
                dto.setId("HYB-" + hj.getHybridJourneyId());
                dto.setJourneyId("HYB-" + hj.getHybridJourneyId());
                dto.setTitle("Smart Hybrid: " + sourceCity.getCityName() + " to " + destCity.getCityName());
                dto.setJourneyType("HYBRID");
                dto.setTransportMode("HYBRID");
                dto.setOperatorName("Multi-Provider Hybrid");
                dto.setPrimaryCarrier("Multimodal Network");
                dto.setSourceCity(sourceCity.getCityName());
                dto.setSourceTerminal(sourceCity.getCityName() + " Transit Hub");
                dto.setDestCity(destCity.getCityName());
                dto.setDestTerminal(destCity.getCityName() + " Transit Hub");

                dto.setTotalDurationMinutes(hj.getTotalDurationMinutes());
                dto.setTotalPrice(hj.getTotalPrice().multiply(BigDecimal.valueOf(passengerCount)));
                dto.setCurrency("INR");
                dto.setAvailableSeats(25);
                dto.setAvailabilityStatus("AVAILABLE");
                dto.setDataSource(DataSourceType.DEMO);
                dto.setRiskLevel(hj.getTransferRisk());
                dto.setTransferRisk(hj.getTransferRisk());
                dto.setTransfersCount(hj.getLegs().size() > 1 ? hj.getLegs().size() - 1 : 1);
                dto.setAmenities("Coordinated multimodal connection with transfer buffers");
                dto.setTotalCo2Kg(BigDecimal.valueOf(45.0));

                int legOrder = 1;
                for (HybridJourneyLeg hjl : hj.getLegs()) {
                    Schedule ls = hjl.getSchedule();
                    JourneyLegDTO leg = new JourneyLegDTO();
                    leg.setLegOrder(legOrder++);
                    leg.setMode(ls.getTransport().getTransportType());
                    leg.setCarrierName(ls.getTransport().getOperatorName());
                    leg.setCarrierCode(ls.getTransport().getServiceNumber());
                    leg.setSourceCity(ls.getRoute().getSourceCity().getCityName());
                    leg.setSourceStationName(ls.getRoute().getSourceCity().getCityName() + " Terminal");
                    leg.setDestCity(ls.getRoute().getDestinationCity().getCityName());
                    leg.setDestStationName(ls.getRoute().getDestinationCity().getCityName() + " Terminal");
                    leg.setDepartureTime(ls.getDepartureDatetime().toLocalTime());
                    leg.setArrivalTime(ls.getArrivalDatetime().toLocalTime());
                    long legDur = Duration.between(ls.getDepartureDatetime(), ls.getArrivalDatetime()).toMinutes();
                    leg.setDurationMinutes((int) (legDur > 0 ? legDur : 120));
                    leg.setPrice(ls.getBasePrice());
                    leg.setCo2Kg(BigDecimal.valueOf(15.0));
                    dto.getLegs().add(leg);
                }

                if (!dto.getLegs().isEmpty()) {
                    dto.setDepartureTime(dto.getLegs().get(0).getDepartureTime());
                    dto.setArrivalTime(dto.getLegs().get(dto.getLegs().size() - 1).getArrivalTime());
                }

                journeyOptions.add(dto);
            }
        }

        // 4. Tag Recommendations
        recommendationService.tagRecommendations(journeyOptions);

        // 5. Apply Sorting
        if ("CHEAPEST".equalsIgnoreCase(sortBy) || "PRICE_ASC".equalsIgnoreCase(sortBy)) {
            journeyOptions.sort(Comparator.comparing(JourneyOptionDTO::getTotalPrice));
        } else if ("FASTEST".equalsIgnoreCase(sortBy) || "DURATION_ASC".equalsIgnoreCase(sortBy)) {
            journeyOptions.sort(Comparator.comparingInt(JourneyOptionDTO::getTotalDurationMinutes));
        }

        // 6. Assemble Status Response
        SearchStatusDTO status = new SearchStatusDTO();
        status.setStatusCode(journeyOptions.isEmpty() ? SearchStatusDTO.Code.NO_SERVICES_AVAILABLE : SearchStatusDTO.Code.SHOWING_DEMO_RESULTS);
        status.setStatusMessage(journeyOptions.isEmpty()
                ? "No services available for this route in demo database."
                : "Retrieved " + journeyOptions.size() + " options directly from MySQL database.");
        status.setTotalResultsCount(journeyOptions.size());
        status.setProvidersConsulted(Arrays.asList("MySQL 8+ Database (travelsmart_db)", "Indian Multimodal Timetable Engine"));

        return new LiveSearchResponseDTO(status, journeyOptions);
    }

    private City resolveCity(Long cityId, String name, String defaultName) {
        if (cityId != null) {
            Optional<City> opt = cityRepository.findById(cityId);
            if (opt.isPresent()) return opt.get();
        }
        if (name != null && !name.trim().isEmpty()) {
            String clean = name.split(",")[0].trim();
            Optional<City> opt = cityRepository.findByCityNameIgnoreCase(clean);
            if (opt.isPresent()) return opt.get();
            List<City> list = cityRepository.findByCityNameContainingIgnoreCaseOrderByCityNameAsc(clean);
            if (!list.isEmpty()) return list.get(0);
        }
        return cityRepository.findByCityNameIgnoreCase(defaultName)
                .orElseGet(() -> cityRepository.findAll().stream().findFirst().orElse(null));
    }
}

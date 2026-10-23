package com.travelsmart.service;

import com.travelsmart.dto.BookingRequest;
import com.travelsmart.dto.BookingResponseDTO;
import com.travelsmart.dto.JourneyLegDTO;
import com.travelsmart.entity.*;
import com.travelsmart.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final HybridJourneyRepository hybridJourneyRepository;
    private final PasswordEncoder passwordEncoder;

    public BookingService(BookingRepository bookingRepository,
                          ScheduleRepository scheduleRepository,
                          UserRepository userRepository,
                          PaymentRepository paymentRepository,
                          HybridJourneyRepository hybridJourneyRepository,
                          PasswordEncoder passwordEncoder) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.hybridJourneyRepository = hybridJourneyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Atomically reserves seats with pessimistic row-level locking.
     * If any leg has insufficient capacity, rolls back entire transaction.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponseDTO createBooking(BookingRequest request, Long authenticatedUserId) {
        if (request == null) {
            throw new IllegalArgumentException("Booking request cannot be null");
        }

        int passengerCount = (request.getPassengers() != null && request.getPassengers() > 0) ? request.getPassengers() :
                (request.getPassengersCount() != null && request.getPassengersCount() > 0 ? request.getPassengersCount() : 1);

        // 1. Resolve User
        User user = null;
        if (authenticatedUserId != null && authenticatedUserId > 0) {
            user = userRepository.findById(authenticatedUserId).orElse(null);
        }

        String contactEmail = request.getContactEmail() != null ? request.getContactEmail().trim().toLowerCase() :
                (request.getPassengerEmail() != null ? request.getPassengerEmail().trim().toLowerCase() : null);

        if (user == null && contactEmail != null && !contactEmail.isEmpty()) {
            user = userRepository.findByEmail(contactEmail).orElse(null);
            if (user == null) {
                String name = request.getContactName() != null ? request.getContactName().trim() :
                        (request.getPassengerName() != null ? request.getPassengerName().trim() : "Traveler");
                String phone = request.getContactPhone() != null ? request.getContactPhone().trim() :
                        (request.getPassengerPhone() != null ? request.getPassengerPhone().trim() : "+919876543210");
                user = new User(name, contactEmail, phone, passwordEncoder.encode("User@123"), "ROLE_USER");
                user.setCreatedAt(LocalDateTime.now());
                user = userRepository.save(user);
            }
        }

        if (user == null) {
            user = userRepository.findById(2L).orElseGet(() -> userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalStateException("No valid user found to attach booking")));
        }

        // 2. Gather all schedule IDs to reserve
        List<Long> scheduleIdsToReserve = new ArrayList<>();
        if (request.getScheduleId() != null) {
            scheduleIdsToReserve.add(request.getScheduleId());
        } else if (request.getJourneyOptionId() != null) {
            String jId = request.getJourneyOptionId().trim();
            if (jId.startsWith("SCH-")) {
                try {
                    scheduleIdsToReserve.add(Long.parseLong(jId.replace("SCH-", "").trim()));
                } catch (Exception ignored) {}
            } else if (jId.startsWith("HYB-")) {
                try {
                    Long hydId = Long.parseLong(jId.replace("HYB-", "").trim());
                    HybridJourney hj = hybridJourneyRepository.findById(hydId).orElse(null);
                    if (hj != null && hj.getLegs() != null) {
                        for (HybridJourneyLeg hjl : hj.getLegs()) {
                            if (hjl.getSchedule() != null) {
                                scheduleIdsToReserve.add(hjl.getSchedule().getScheduleId());
                            }
                        }
                    }
                } catch (Exception ignored) {}
            } else {
                try {
                    scheduleIdsToReserve.add(Long.parseLong(jId));
                } catch (Exception ignored) {}
            }
        }

        if (request.getSelectedLegScheduleIds() != null && !request.getSelectedLegScheduleIds().isEmpty()) {
            scheduleIdsToReserve.addAll(request.getSelectedLegScheduleIds());
        }

        // If custom legs array was provided
        if (scheduleIdsToReserve.isEmpty() && request.getLegs() != null && !request.getLegs().isEmpty()) {
            for (JourneyLegDTO l : request.getLegs()) {
                String lSrc = l.getSourceCity() != null ? l.getSourceCity() : l.getOriginCity();
                String lDst = l.getDestCity() != null ? l.getDestCity() : l.getDestinationCity();
                if (lSrc != null && lDst != null) {
                    List<Schedule> legMatches = scheduleRepository.findAll().stream()
                            .filter(s -> s.getRoute().getSourceCity().getCityName().equalsIgnoreCase(lSrc) &&
                                    s.getRoute().getDestinationCity().getCityName().equalsIgnoreCase(lDst))
                            .toList();
                    if (!legMatches.isEmpty()) {
                        scheduleIdsToReserve.add(legMatches.get(0).getScheduleId());
                    }
                }
            }
        }

        // Fallback: match by source & destination
        if (scheduleIdsToReserve.isEmpty() && request.getSourceCity() != null && request.getDestCity() != null) {
            String src = request.getSourceCity().trim();
            String dst = request.getDestCity().trim();
            String mode = request.getJourneyType();
            List<Schedule> matches = scheduleRepository.findAll().stream()
                    .filter(s -> s.getRoute().getSourceCity().getCityName().equalsIgnoreCase(src) &&
                            s.getRoute().getDestinationCity().getCityName().equalsIgnoreCase(dst) &&
                            (mode == null || mode.equalsIgnoreCase("HYBRID") || s.getTransport().getTransportType().equalsIgnoreCase(mode)))
                    .toList();
            if (!matches.isEmpty()) {
                scheduleIdsToReserve.add(matches.get(0).getScheduleId());
            } else {
                List<Schedule> anyMatches = scheduleRepository.findAll().stream()
                        .filter(s -> s.getRoute().getSourceCity().getCityName().equalsIgnoreCase(src) &&
                                s.getRoute().getDestinationCity().getCityName().equalsIgnoreCase(dst))
                        .toList();
                if (!anyMatches.isEmpty()) {
                    scheduleIdsToReserve.add(anyMatches.get(0).getScheduleId());
                }
            }
        }

        if (scheduleIdsToReserve.isEmpty()) {
            throw new IllegalArgumentException("No valid schedules identified to reserve for this booking.");
        }

        // 2. Lock each schedule row and check seat capacity atomically
        List<Schedule> lockedSchedules = new ArrayList<>();
        BigDecimal computedTotal = BigDecimal.ZERO;

        for (Long schedId : scheduleIdsToReserve) {
            Schedule sched = scheduleRepository.findByIdForUpdate(schedId)
                    .orElseThrow(() -> new IllegalArgumentException("Schedule ID " + schedId + " not found."));

            if (sched.getAvailableSeats() < passengerCount) {
                throw new IllegalStateException("Insufficient seats on " + sched.getTransport().getOperatorName() +
                        " (" + sched.getTransport().getServiceNumber() + "): only " + sched.getAvailableSeats() +
                        " available, but " + passengerCount + " requested.");
            }

            // Decrement available seats atomically in database
            sched.setAvailableSeats(sched.getAvailableSeats() - passengerCount);
            scheduleRepository.save(sched);
            lockedSchedules.add(sched);

            BigDecimal legPrice = sched.getBasePrice().multiply(BigDecimal.valueOf(passengerCount));
            computedTotal = computedTotal.add(legPrice);
        }

        BigDecimal finalTotal = (request.getTotalPrice() != null && request.getTotalPrice().compareTo(BigDecimal.ZERO) > 0)
                ? request.getTotalPrice() : computedTotal;

        // 3. Create Booking record
        Booking booking = new Booking(user, finalTotal, "CONFIRMED", passengerCount);
        booking = bookingRepository.save(booking);

        // 4. Create BookingLeg records
        int legOrder = 1;
        for (Schedule s : lockedSchedules) {
            BigDecimal legFare = s.getBasePrice().multiply(BigDecimal.valueOf(passengerCount));
            BookingLeg leg = new BookingLeg(booking, s, legOrder++, legFare);
            booking.getLegs().add(leg);
        }
        booking = bookingRepository.save(booking);

        // 5. Create Payment Record
        String txnRef = "TXN-TS-" + System.currentTimeMillis();
        Payment payment = new Payment(booking, finalTotal, "Card / UPI (Demo)", "COMPLETED", txnRef);
        paymentRepository.save(payment);

        return toBookingResponseDTO(booking);
    }

    /**
     * Cancels booking and restores reserved seats idempotently.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public BookingResponseDTO cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found with ID: " + bookingId));

        if (userId != null && booking.getUser() != null && !booking.getUser().getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized: You do not own this booking.");
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getBookingStatus())) {
            return toBookingResponseDTO(booking); // Idempotent return
        }

        // Restore reserved seats for all legs atomically
        int passengerCount = booking.getPassengerCount() != null ? booking.getPassengerCount() : 1;
        for (BookingLeg leg : booking.getLegs()) {
            Schedule sched = scheduleRepository.findByIdForUpdate(leg.getSchedule().getScheduleId()).orElse(null);
            if (sched != null) {
                int restoredSeats = Math.min(sched.getTotalSeats(), sched.getAvailableSeats() + passengerCount);
                sched.setAvailableSeats(restoredSeats);
                scheduleRepository.save(sched);
            }
        }

        booking.setBookingStatus("CANCELLED");
        Booking updated = bookingRepository.save(booking);
        return toBookingResponseDTO(updated);
    }

    public List<BookingResponseDTO> getUserBookings(Long userId) {
        Long uid = userId != null ? userId : 2L;
        List<Booking> list = bookingRepository.findByUser_UserIdOrderByBookingDateDesc(uid);
        List<BookingResponseDTO> dtos = new ArrayList<>();
        for (Booking b : list) {
            dtos.add(toBookingResponseDTO(b));
        }
        return dtos;
    }

    public Optional<BookingResponseDTO> getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId).map(this::toBookingResponseDTO);
    }

    private BookingResponseDTO toBookingResponseDTO(Booking b) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(b.getBookingId());
        dto.setRawId(b.getBookingId());
        dto.setBookingId("TS-IN-" + b.getBookingId());
        dto.setBookingReference("TS-IN-" + b.getBookingId());
        dto.setStatus(b.getBookingStatus());
        dto.setBookingStatus(b.getBookingStatus());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setTotalPrice(b.getTotalAmount());
        dto.setCurrency("INR");
        dto.setBookingDate(b.getBookingDate());
        dto.setCreatedAt(b.getBookingDate());
        dto.setPassengerCount(b.getPassengerCount());
        dto.setPassengersCount(b.getPassengerCount());

        if (b.getUser() != null) {
            dto.setPassengerName(b.getUser().getFullName());
            dto.setContactName(b.getUser().getFullName());
            dto.setPassengerEmail(b.getUser().getEmail());
            dto.setContactEmail(b.getUser().getEmail());
            dto.setPassengerPhone(b.getUser().getPhone());
            dto.setContactPhone(b.getUser().getPhone());
        }

        if (b.getLegs() != null && !b.getLegs().isEmpty()) {
            BookingLeg firstLeg = b.getLegs().get(0);
            BookingLeg lastLeg = b.getLegs().get(b.getLegs().size() - 1);
            Schedule sFirst = firstLeg.getSchedule();
            Schedule sLast = lastLeg.getSchedule();

            String src = sFirst.getRoute().getSourceCity().getCityName();
            String dst = sLast.getRoute().getDestinationCity().getCityName();
            dto.setSourceCity(src);
            dto.setOriginCity(src);
            dto.setDestCity(dst);
            dto.setDestinationCity(dst);
            dto.setJourneyTitle(src + " → " + dst);

            dto.setDepartureDateTime(sFirst.getDepartureDatetime());
            dto.setArrivalDateTime(sLast.getArrivalDatetime());
            dto.setDepartureDate(sFirst.getDepartureDatetime().toLocalDate());
            dto.setArrivalDate(sLast.getArrivalDatetime().toLocalDate());
            dto.setTravelDate(sFirst.getDepartureDatetime().toLocalDate());
            dto.setDepartureTime(sFirst.getDepartureDatetime().toLocalTime());
            dto.setArrivalTime(sLast.getArrivalDatetime().toLocalTime());

            if (b.getLegs().size() == 1) {
                dto.setTransportMode(sFirst.getTransport().getTransportType());
                dto.setJourneyType(sFirst.getTransport().getTransportType());
                dto.setOperatorName(sFirst.getTransport().getOperatorName());
                dto.setServiceNumber(sFirst.getTransport().getServiceNumber());
            } else {
                dto.setTransportMode("HYBRID");
                dto.setJourneyType("HYBRID");
                dto.setOperatorName("Multi-Provider Hybrid");
                dto.setServiceNumber(b.getLegs().size() + " Segments");
            }

            List<JourneyLegDTO> legDTOs = new ArrayList<>();
            for (BookingLeg leg : b.getLegs()) {
                Schedule s = leg.getSchedule();
                JourneyLegDTO lDto = new JourneyLegDTO();
                lDto.setLegOrder(leg.getLegOrder());
                lDto.setMode(s.getTransport().getTransportType());
                lDto.setTransportType(s.getTransport().getTransportType());
                lDto.setCarrierName(s.getTransport().getOperatorName());
                lDto.setOperatorName(s.getTransport().getOperatorName());
                lDto.setCarrierCode(s.getTransport().getServiceNumber());
                lDto.setServiceNumber(s.getTransport().getServiceNumber());
                lDto.setSourceCity(s.getRoute().getSourceCity().getCityName());
                lDto.setOriginCity(s.getRoute().getSourceCity().getCityName());
                lDto.setDestCity(s.getRoute().getDestinationCity().getCityName());
                lDto.setDestinationCity(s.getRoute().getDestinationCity().getCityName());
                lDto.setDepartureTime(s.getDepartureDatetime().toLocalTime());
                lDto.setArrivalTime(s.getArrivalDatetime().toLocalTime());
                lDto.setPrice(leg.getPriceAtBooking());
                lDto.setFareAmount(leg.getPriceAtBooking());
                legDTOs.add(lDto);
            }
            dto.setLegs(legDTOs);
        } else {
            dto.setJourneyTitle("Multimodal Journey");
            dto.setTransportMode("MULTIMODAL");
            dto.setJourneyType("MULTIMODAL");
            dto.setOperatorName("TravelSmart Core");
            dto.setServiceNumber("TS-DIR");
        }

        return dto;
    }
}

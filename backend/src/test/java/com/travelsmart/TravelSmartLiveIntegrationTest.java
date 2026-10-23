package com.travelsmart;

import com.travelsmart.dto.*;
import com.travelsmart.entity.Schedule;
import com.travelsmart.service.BookingService;
import com.travelsmart.service.HybridJourneyService;
import com.travelsmart.service.SearchService;
import com.travelsmart.service.TransportService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
public class TravelSmartLiveIntegrationTest {

    @Autowired
    private SearchService searchService;

    @Autowired
    private TransportService transportService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private HybridJourneyService hybridJourneyService;

    @Test
    @DisplayName("Test 1: Search - Pune to Delhi returns matching database schedules")
    public void testSearchPuneToDelhi() {
        LiveSearchResponseDTO res = searchService.searchLive(
                null, null, "Pune", "Delhi", "ALL", "2026-10-25", 1, "RECOMMENDED");

        assertNotNull(res);
        assertNotNull(res.getJourneys());
        assertFalse(res.getJourneys().isEmpty(), "Should return seeded transport options for Pune to Delhi");

        boolean hasFlight = res.getJourneys().stream().anyMatch(j -> "FLIGHT".equalsIgnoreCase(j.getTransportMode()));
        boolean hasTrain = res.getJourneys().stream().anyMatch(j -> "TRAIN".equalsIgnoreCase(j.getTransportMode()));
        boolean hasBus = res.getJourneys().stream().anyMatch(j -> "BUS".equalsIgnoreCase(j.getTransportMode()));

        assertTrue(hasFlight, "Results should contain flight options");
        assertTrue(hasTrain, "Results should contain train options");
        assertTrue(hasBus, "Results should contain bus options");
    }

    @Test
    @DisplayName("Test 2: Admin Price Update - Update ticket price and verify in search results")
    public void testAdminPriceUpdate() {
        // Find a schedule to update
        List<Schedule> schedules = transportService.getAllSchedules();
        assertFalse(schedules.isEmpty());
        Schedule target = schedules.get(0);
        Long targetId = target.getScheduleId();

        BigDecimal newPrice = new BigDecimal("1450.00");
        Schedule updated = transportService.updateSchedulePriceAndSeats(targetId, newPrice, null);
        assertEquals(0, newPrice.compareTo(updated.getBasePrice()), "Schedule base price must be updated in database");

        Schedule reloaded = transportService.getScheduleById(targetId).orElseThrow();
        assertEquals(0, newPrice.compareTo(reloaded.getBasePrice()));
    }

    @Test
    @DisplayName("Test 3: Booking - Decrement available seats atomically in database")
    public void testBookingSeatDecrement() {
        List<Schedule> schedules = transportService.getAllSchedules();
        Schedule busSched = schedules.stream()
                .filter(s -> "BUS".equalsIgnoreCase(s.getTransport().getTransportType()) && s.getAvailableSeats() > 5)
                .findFirst().orElseThrow();

        Long schedId = busSched.getScheduleId();
        int initialSeats = busSched.getAvailableSeats();

        BookingRequest req = new BookingRequest();
        req.setScheduleId(schedId);
        req.setPassengers(1);
        req.setContactName("Test Traveler");
        req.setContactEmail("traveler@test.com");

        BookingResponseDTO bookingRes = bookingService.createBooking(req, 2L);
        assertNotNull(bookingRes);
        assertNotNull(bookingRes.getBookingId());

        Schedule updatedSched = transportService.getScheduleById(schedId).orElseThrow();
        assertEquals(initialSeats - 1, updatedSched.getAvailableSeats(), "Available seats must decrease by 1");
    }

    @Test
    @DisplayName("Test 4: Cancellation - Cancel booking and restore reserved seats idempotently")
    public void testBookingCancellationAndSeatRestoration() {
        List<Schedule> schedules = transportService.getAllSchedules();
        Schedule sched = schedules.stream()
                .filter(s -> s.getAvailableSeats() > 5)
                .findFirst().orElseThrow();

        Long schedId = sched.getScheduleId();
        int seatsBeforeBooking = sched.getAvailableSeats();

        BookingRequest req = new BookingRequest();
        req.setScheduleId(schedId);
        req.setPassengers(1);

        BookingResponseDTO bookingRes = bookingService.createBooking(req, 2L);
        Schedule afterBooking = transportService.getScheduleById(schedId).orElseThrow();
        assertEquals(seatsBeforeBooking - 1, afterBooking.getAvailableSeats());

        // Cancel
        BookingResponseDTO cancelRes = bookingService.cancelBooking(bookingRes.getRawId(), 2L);
        assertEquals("CANCELLED", cancelRes.getStatus());

        Schedule afterCancellation = transportService.getScheduleById(schedId).orElseThrow();
        assertEquals(seatsBeforeBooking, afterCancellation.getAvailableSeats(), "Available seats must be fully restored upon cancellation");

        // Idempotent cancel test (cancelling again should not double restore)
        bookingService.cancelBooking(bookingRes.getRawId(), 2L);
        Schedule afterSecondCancel = transportService.getScheduleById(schedId).orElseThrow();
        assertEquals(seatsBeforeBooking, afterSecondCancel.getAvailableSeats(), "Repeated cancellation must be idempotent");
    }

    @Test
    @DisplayName("Test 5: Hybrid Journey - Validate, calculate totals, and save to MySQL")
    public void testHybridJourneyCreationAndPersistence() {
        CustomHybridRequest req = new CustomHybridRequest();
        req.setJourneyName("Pune to Delhi Multi-Stop Odyssey");
        req.setOriginCity("Pune");
        req.setDestinationCity("Delhi");
        req.setPassengers(1);

        CustomLegInputDTO leg1 = new CustomLegInputDTO(1, "Pune", "Mumbai", "BUS");
        CustomLegInputDTO leg2 = new CustomLegInputDTO(2, "Mumbai", "Jaipur", "FLIGHT");
        CustomLegInputDTO leg3 = new CustomLegInputDTO(3, "Jaipur", "Delhi", "TRAIN");
        req.setLegs(Arrays.asList(leg1, leg2, leg3));

        CustomHybridValidationResultDTO val = hybridJourneyService.validateAndCalculate(req);
        assertTrue(val.isValid(), "Flagship Pune -> Mumbai -> Jaipur -> Delhi route must validate cleanly");
        assertTrue(val.getTotalPrice().compareTo(BigDecimal.ZERO) > 0, "Total price must be positive");
        assertTrue(val.getTotalDurationMinutes() > 0, "Total duration must be positive");
        assertEquals(3, val.getResolvedLegs().size());

        // Save to Database
        var saved = hybridJourneyService.saveHybridJourney(req, 2L);
        assertNotNull(saved);
        assertNotNull(saved.getHybridJourneyId());
        assertEquals("Pune", saved.getSourceCity().getCityName());
        assertEquals("Delhi", saved.getDestinationCity().getCityName());
        assertEquals(3, saved.getLegs().size());
    }

    @Test
    @DisplayName("Test 6: Chandigarh to Delhi Search - Resolves and returns rail & bus options")
    public void testChandigarhToDelhiSearch() {
        LiveSearchResponseDTO res = searchService.searchLive(
                null, null, "Chandigarh", "Delhi", "ALL", "2026-10-25", 1, "RECOMMENDED");

        assertNotNull(res);
        assertFalse(res.getJourneys().isEmpty(), "Chandigarh to Delhi must return verified transport options");
        assertTrue(res.getJourneys().stream().anyMatch(j -> "TRAIN".equalsIgnoreCase(j.getTransportMode())), "Must include train options");
    }

    @Test
    @DisplayName("Test 7: Admin Reports - Computes metrics and active services")
    public void testAdminReports() {
        var report = transportService.getAdminReport();
        assertNotNull(report);
        assertTrue((Long) report.get("totalUsers") > 0);
        assertTrue((Long) report.get("totalTransports") > 0);
        assertTrue((Long) report.get("totalSchedules") > 0);
        assertEquals("INR", report.get("currency"));
    }

    @Test
    @DisplayName("Test 8: Schedule Deactivation - Deactivated schedule immediately disappears from search")
    public void testScheduleDeactivationExcludesFromSearch() {
        // Initial search for Pune -> Delhi
        LiveSearchResponseDTO initial = searchService.searchLive(
                null, null, "Pune", "Delhi", "ALL", "2026-10-25", 1, "RECOMMENDED");
        assertFalse(initial.getJourneys().isEmpty());
        int countBefore = initial.getJourneys().size();

        // Find a schedule to deactivate
        Schedule target = transportService.getAllSchedules().stream()
                .filter(s -> "Pune".equalsIgnoreCase(s.getRoute().getSourceCity().getCityName()) &&
                             "Delhi".equalsIgnoreCase(s.getRoute().getDestinationCity().getCityName()))
                .findFirst().orElseThrow();

        // Deactivate it (as someone would in MySQL Workbench: UPDATE schedules SET schedule_status = 'CANCELLED' ...)
        target.setScheduleStatus("CANCELLED");
        transportService.saveSchedule(target);

        // Search again immediately
        LiveSearchResponseDTO afterDeactivation = searchService.searchLive(
                null, null, "Pune", "Delhi", "ALL", "2026-10-25", 1, "RECOMMENDED");

        assertEquals(countBefore - 1, afterDeactivation.getJourneys().size(),
                "Deactivated schedule must immediately disappear from search results");
        boolean stillPresent = afterDeactivation.getJourneys().stream()
                .anyMatch(j -> j.getId().equals("SCH-" + target.getScheduleId()));
        assertFalse(stillPresent, "Cancelled schedule SCH-" + target.getScheduleId() + " must not appear in search");

        // Reactivate for cleanliness
        target.setScheduleStatus("SCHEDULED");
        transportService.saveSchedule(target);
    }

    @Test
    @DisplayName("Test 9: Database Fields - JourneyOptionDTO exposes all 10 required database fields")
    public void testDatabaseFieldsExposed() {
        LiveSearchResponseDTO res = searchService.searchLive(
                null, null, "Pune", "Delhi", "ALL", "2026-10-25", 1, "RECOMMENDED");
        assertFalse(res.getJourneys().isEmpty());
        JourneyOptionDTO opt = res.getJourneys().get(0);

        assertNotNull(opt.getSchedule_id(), "schedule_id must be populated");
        assertNotNull(opt.getTransport_type(), "transport_type must be populated");
        assertNotNull(opt.getOperator_name(), "operator_name must be populated");
        assertNotNull(opt.getService_number(), "service_number must be populated");
        assertNotNull(opt.getSource(), "source must be populated");
        assertNotNull(opt.getDestination(), "destination must be populated");
        assertNotNull(opt.getDeparture_datetime(), "departure_datetime must be populated");
        assertNotNull(opt.getArrival_datetime(), "arrival_datetime must be populated");
        assertNotNull(opt.getBase_price(), "base_price must be populated");
        assertNotNull(opt.getAvailable_seats(), "available_seats must be populated");
    }

    @Test
    @DisplayName("Test 10: Passenger Threshold - Disallow search if passenger count exceeds seat capacity")
    public void testPassengerCapacityThreshold() {
        // Find a schedule and reduce available seats to 2
        Schedule target = transportService.getAllSchedules().get(0);
        int originalSeats = target.getAvailableSeats();
        target.setAvailableSeats(2);
        transportService.saveSchedule(target);

        // Search with 5 passengers: target should NOT appear
        LiveSearchResponseDTO res = searchService.searchLive(
                target.getRoute().getSourceCity().getCityId(),
                target.getRoute().getDestinationCity().getCityId(),
                null, null, "ALL", "2026-10-25", 5, "RECOMMENDED");

        boolean present = res.getJourneys().stream()
                .anyMatch(j -> j.getId().equals("SCH-" + target.getScheduleId()));
        assertFalse(present, "Schedule with 2 seats should not be returned when searching for 5 passengers");

        // Restore original seats
        target.setAvailableSeats(originalSeats);
        transportService.saveSchedule(target);
    }
}

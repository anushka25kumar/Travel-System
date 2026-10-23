package com.travelsmart.service;

import com.travelsmart.entity.City;
import com.travelsmart.entity.Route;
import com.travelsmart.entity.Schedule;
import com.travelsmart.entity.Transport;
import com.travelsmart.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TransportService {

    private final CityRepository cityRepository;
    private final TransportRepository transportRepository;
    private final RouteRepository routeRepository;
    private final ScheduleRepository scheduleRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public TransportService(CityRepository cityRepository,
                            TransportRepository transportRepository,
                            RouteRepository routeRepository,
                            ScheduleRepository scheduleRepository,
                            BookingRepository bookingRepository,
                            UserRepository userRepository) {
        this.cityRepository = cityRepository;
        this.transportRepository = transportRepository;
        this.routeRepository = routeRepository;
        this.scheduleRepository = scheduleRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public List<City> getAllCities() {
        return cityRepository.findAllByOrderByCityNameAsc();
    }

    public List<City> searchCities(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCities();
        }
        return cityRepository.findByCityNameContainingIgnoreCaseOrderByCityNameAsc(query.trim());
    }

    public List<Transport> getAllTransports() {
        return transportRepository.findAll();
    }

    public List<Transport> getTransportsByType(String type) {
        return transportRepository.findByTransportType(type);
    }

    public Optional<Transport> getTransportById(Long id) {
        return transportRepository.findById(id);
    }

    @Transactional
    public Transport saveTransport(Transport transport) {
        return transportRepository.save(transport);
    }

    @Transactional
    public void deleteTransport(Long id) {
        transportRepository.deleteById(id);
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    @Transactional
    public Route saveRoute(Route route) {
        return routeRepository.save(route);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }

    @Transactional
    public Schedule saveSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public Schedule updateSchedulePriceAndSeats(Long scheduleId, BigDecimal newPrice, Integer newAvailableSeats) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("Schedule not found with ID: " + scheduleId));
        if (newPrice != null) {
            schedule.setBasePrice(newPrice);
        }
        if (newAvailableSeats != null) {
            if (newAvailableSeats < 0 || newAvailableSeats > schedule.getTotalSeats()) {
                throw new IllegalArgumentException("Available seats must be between 0 and " + schedule.getTotalSeats());
            }
            schedule.setAvailableSeats(newAvailableSeats);
        }
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }

    public Map<String, Object> getAdminReport() {
        Map<String, Object> report = new HashMap<>();
        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long totalTransports = transportRepository.count();
        long totalSchedules = scheduleRepository.count();

        BigDecimal totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> !"CANCELLED".equalsIgnoreCase(b.getBookingStatus()))
                .map(b -> b.getTotalAmount() != null ? b.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        report.put("totalUsers", totalUsers);
        report.put("totalBookings", totalBookings);
        report.put("totalTransports", totalTransports);
        report.put("totalSchedules", totalSchedules);
        report.put("totalRevenue", totalRevenue);
        report.put("currency", "INR");
        return report;
    }
}

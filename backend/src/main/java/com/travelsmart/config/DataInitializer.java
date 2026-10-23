package com.travelsmart.config;

import com.travelsmart.repository.CityRepository;
import com.travelsmart.repository.ScheduleRepository;
import com.travelsmart.repository.TransportRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CityRepository cityRepository;
    private final TransportRepository transportRepository;
    private final ScheduleRepository scheduleRepository;

    public DataInitializer(CityRepository cityRepository,
                           TransportRepository transportRepository,
                           ScheduleRepository scheduleRepository) {
        this.cityRepository = cityRepository;
        this.transportRepository = transportRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long cities = cityRepository.count();
        long transports = transportRepository.count();
        long schedules = scheduleRepository.count();

        System.out.println("===================================================================");
        System.out.println(" TravelSmart – Integrated Transportation Management System (India)");
        System.out.println(" Database: MySQL 8+ (Flyway Migrations Managed)");
        System.out.println(" Loaded Cities: " + cities);
        System.out.println(" Loaded Transports: " + transports);
        System.out.println(" Loaded Schedules: " + schedules);
        System.out.println(" Web Portal: http://localhost:8080");
        System.out.println("===================================================================");
    }
}

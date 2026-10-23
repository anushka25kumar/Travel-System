package com.travelsmart.controller;

import com.travelsmart.entity.City;
import com.travelsmart.entity.Route;
import com.travelsmart.entity.Schedule;
import com.travelsmart.entity.Transport;
import com.travelsmart.service.TransportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TransportController {

    private final TransportService transportService;

    public TransportController(TransportService transportService) {
        this.transportService = transportService;
    }

    @GetMapping("/cities")
    public ResponseEntity<List<City>> getCities() {
        return ResponseEntity.ok(transportService.getAllCities());
    }

    @GetMapping("/cities/search")
    public ResponseEntity<List<City>> searchCities(@RequestParam(value = "query", required = false) String query) {
        return ResponseEntity.ok(transportService.searchCities(query));
    }

    @GetMapping("/transports")
    public ResponseEntity<List<Transport>> getTransports(@RequestParam(value = "type", required = false) String type) {
        if (type != null && !type.trim().isEmpty()) {
            return ResponseEntity.ok(transportService.getTransportsByType(type.toUpperCase()));
        }
        return ResponseEntity.ok(transportService.getAllTransports());
    }

    @GetMapping("/routes")
    public ResponseEntity<List<Route>> getRoutes() {
        return ResponseEntity.ok(transportService.getAllRoutes());
    }

    @GetMapping("/schedules")
    public ResponseEntity<List<Schedule>> getSchedules() {
        return ResponseEntity.ok(transportService.getAllSchedules());
    }
}

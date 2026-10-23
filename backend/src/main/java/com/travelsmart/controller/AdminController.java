package com.travelsmart.controller;

import com.travelsmart.entity.Schedule;
import com.travelsmart.entity.Transport;
import com.travelsmart.service.TransportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final TransportService transportService;

    public AdminController(TransportService transportService) {
        this.transportService = transportService;
    }

    @PostMapping("/transport")
    public ResponseEntity<?> addTransport(@RequestBody Transport transport) {
        try {
            Transport saved = transportService.saveTransport(transport);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/transport/{id}")
    public ResponseEntity<?> updateTransport(@PathVariable("id") Long id, @RequestBody Transport transport) {
        try {
            transport.setTransportId(id);
            Transport saved = transportService.saveTransport(transport);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/transport/{id}")
    public ResponseEntity<?> deleteTransport(@PathVariable("id") Long id) {
        try {
            transportService.deleteTransport(id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Transport service deleted successfully.");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/schedules")
    public ResponseEntity<?> addSchedule(@RequestBody Schedule schedule) {
        try {
            Schedule saved = transportService.saveSchedule(schedule);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<?> updateSchedulePriceAndSeats(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            BigDecimal price = null;
            if (payload.containsKey("basePrice") && payload.get("basePrice") != null) {
                price = new BigDecimal(payload.get("basePrice").toString());
            } else if (payload.containsKey("price") && payload.get("price") != null) {
                price = new BigDecimal(payload.get("price").toString());
            }

            Integer seats = null;
            if (payload.containsKey("availableSeats") && payload.get("availableSeats") != null) {
                seats = Integer.parseInt(payload.get("availableSeats").toString());
            } else if (payload.containsKey("seats") && payload.get("seats") != null) {
                seats = Integer.parseInt(payload.get("seats").toString());
            }

            Schedule updated = transportService.updateSchedulePriceAndSeats(id, price, seats);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable("id") Long id) {
        try {
            transportService.deleteSchedule(id);
            Map<String, String> res = new HashMap<>();
            res.put("message", "Schedule deleted successfully.");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        return ResponseEntity.ok(transportService.getAdminReport());
    }
}

package com.travelsmart.controller;

import com.travelsmart.dto.CustomHybridRequest;
import com.travelsmart.dto.CustomHybridValidationResultDTO;
import com.travelsmart.entity.HybridJourney;
import com.travelsmart.service.HybridJourneyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hybrid")
public class HybridJourneyController {

    private final HybridJourneyService hybridJourneyService;

    public HybridJourneyController(HybridJourneyService hybridJourneyService) {
        this.hybridJourneyService = hybridJourneyService;
    }

    @PostMapping({"/search", "/custom/search"})
    public ResponseEntity<CustomHybridValidationResultDTO> validateCustomHybrid(@RequestBody CustomHybridRequest request) {
        CustomHybridValidationResultDTO result = hybridJourneyService.validateAndCalculate(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveHybridJourney(
            @RequestBody CustomHybridRequest request,
            @RequestParam(value = "userId", required = false) Long userId) {
        try {
            HybridJourney saved = hybridJourneyService.saveHybridJourney(request, userId != null ? userId : 2L);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("hybridJourneyId", saved.getHybridJourneyId());
            resp.put("message", "Hybrid journey saved successfully to MySQL database.");
            resp.put("totalPrice", saved.getTotalPrice());
            resp.put("totalDurationMinutes", saved.getTotalDurationMinutes());
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/my-journeys")
    public ResponseEntity<List<HybridJourney>> getMyJourneys(@RequestParam(value = "userId", required = false) Long userId) {
        return ResponseEntity.ok(hybridJourneyService.getUserSavedJourneys(userId != null ? userId : 2L));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJourney(
            @PathVariable("id") Long id,
            @RequestParam(value = "userId", required = false) Long userId) {
        hybridJourneyService.deleteSavedJourney(id, userId != null ? userId : 2L);
        Map<String, String> resp = new HashMap<>();
        resp.put("message", "Saved hybrid journey deleted successfully.");
        return ResponseEntity.ok(resp);
    }
}

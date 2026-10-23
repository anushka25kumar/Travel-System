package com.travelsmart.service;

import com.travelsmart.dto.JourneyOptionDTO;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class RecommendationService {

    public void tagRecommendations(List<JourneyOptionDTO> options) {
        if (options == null || options.isEmpty()) return;

        JourneyOptionDTO cheapest = options.stream()
                .filter(o -> o.getTotalPrice() != null)
                .min(Comparator.comparing(JourneyOptionDTO::getTotalPrice))
                .orElse(null);

        JourneyOptionDTO fastest = options.stream()
                .filter(o -> o.getTotalDurationMinutes() != null)
                .min(Comparator.comparingInt(JourneyOptionDTO::getTotalDurationMinutes))
                .orElse(null);

        JourneyOptionDTO greenest = options.stream()
                .filter(o -> o.getTotalCo2Kg() != null)
                .min(Comparator.comparing(JourneyOptionDTO::getTotalCo2Kg))
                .orElse(null);

        for (JourneyOptionDTO opt : options) {
            if (opt.getRecommendationTag() != null && !opt.getRecommendationTag().isEmpty()) {
                continue;
            }
            if (opt == fastest) {
                opt.setRecommendationTag("FASTEST");
            } else if (opt == cheapest) {
                opt.setRecommendationTag("CHEAPEST");
            } else if (opt == greenest) {
                opt.setRecommendationTag("ECO_FRIENDLY");
            } else {
                opt.setRecommendationTag("RECOMMENDED");
            }
        }
    }
}

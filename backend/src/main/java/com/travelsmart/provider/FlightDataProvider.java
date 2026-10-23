package com.travelsmart.provider;

import com.travelsmart.dto.JourneyOptionDTO;
import com.travelsmart.dto.OfferRevalidationResultDTO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface FlightDataProvider {
    String getProviderName();
    boolean isConfigured();
    CompletableFuture<List<JourneyOptionDTO>> searchFlights(String sourceIata, String destIata, String sourceCity, String destCity, LocalDate date, int passengers);
    CompletableFuture<OfferRevalidationResultDTO> revalidateOffer(String offerId, BigDecimal currentPrice);
}

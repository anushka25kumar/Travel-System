package com.travelsmart.provider;

import com.travelsmart.dto.JourneyOptionDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface BusDataProvider {
    String getProviderName();
    boolean isConfigured();
    CompletableFuture<List<JourneyOptionDTO>> searchBuses(String sourceBusCode, String destBusCode, String sourceCity, String destCity, LocalDate date, int passengers);
}

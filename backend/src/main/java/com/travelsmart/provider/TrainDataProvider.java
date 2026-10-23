package com.travelsmart.provider;

import com.travelsmart.dto.JourneyOptionDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface TrainDataProvider {
    String getProviderName();
    boolean isConfigured();
    CompletableFuture<List<JourneyOptionDTO>> searchTrains(String sourceStationCode, String destStationCode, String sourceCity, String destCity, LocalDate date, int passengers);
}

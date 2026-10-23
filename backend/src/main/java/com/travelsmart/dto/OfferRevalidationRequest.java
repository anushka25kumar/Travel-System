package com.travelsmart.dto;

import java.math.BigDecimal;

public class OfferRevalidationRequest {
    private String journeyId;
    private String providerOfferId;
    private String transportMode;
    private BigDecimal currentPrice;
    private Integer passengersCount = 1;

    public OfferRevalidationRequest() {}

    public String getJourneyId() { return journeyId; }
    public void setJourneyId(String journeyId) { this.journeyId = journeyId; }

    public String getProviderOfferId() { return providerOfferId; }
    public void setProviderOfferId(String providerOfferId) { this.providerOfferId = providerOfferId; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

    public Integer getPassengersCount() { return passengersCount; }
    public void setPassengersCount(Integer passengersCount) { this.passengersCount = passengersCount; }
}

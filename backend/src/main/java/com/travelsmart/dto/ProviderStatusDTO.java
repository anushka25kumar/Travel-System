package com.travelsmart.dto;

import java.time.Instant;

public class ProviderStatusDTO {
    private String providerId;
    private String providerName;
    private String transportMode; // FLIGHT, TRAIN, BUS, ALL
    private String status; // CONNECTED, NOT_CONFIGURED, SANDBOX, ERROR, TIMETABLE_FALLBACK
    private String environment; // test, production, offline
    private Instant lastSyncTime;
    private String errorMessage;
    private boolean active = true;

    public ProviderStatusDTO() {}

    public ProviderStatusDTO(String providerId, String providerName, String transportMode, String status, String environment, Instant lastSyncTime, String errorMessage, boolean active) {
        this.providerId = providerId;
        this.providerName = providerName;
        this.transportMode = transportMode;
        this.status = status;
        this.environment = environment;
        this.lastSyncTime = lastSyncTime;
        this.errorMessage = errorMessage;
        this.active = active;
    }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }

    public Instant getLastSyncTime() { return lastSyncTime; }
    public void setLastSyncTime(Instant lastSyncTime) { this.lastSyncTime = lastSyncTime; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

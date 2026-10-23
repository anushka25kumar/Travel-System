package com.travelsmart.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class SearchStatusDTO {
    public enum Code {
        SUCCESS,
        NO_SERVICES_AVAILABLE,
        UNABLE_TO_FETCH_LIVE_DATA,
        PROVIDER_NOT_CONNECTED,
        SHOWING_DEMO_RESULTS
    }

    private Code statusCode = Code.SUCCESS;
    private String statusMessage;
    private int totalResultsCount = 0;
    private List<String> providersConsulted = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private Instant searchTimestamp = Instant.now();

    public SearchStatusDTO() {}

    public SearchStatusDTO(Code statusCode, String statusMessage) {
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }

    public Code getStatusCode() { return statusCode; }
    public void setStatusCode(Code statusCode) { this.statusCode = statusCode; }

    public void setStatusCode(String codeStr) {
        if (codeStr == null) return;
        try {
            this.statusCode = Code.valueOf(codeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            this.statusCode = Code.SHOWING_DEMO_RESULTS;
        }
    }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public int getTotalResultsCount() { return totalResultsCount; }
    public void setTotalResultsCount(int totalResultsCount) { this.totalResultsCount = totalResultsCount; }

    public List<String> getProvidersConsulted() { return providersConsulted; }
    public void setProvidersConsulted(List<String> providersConsulted) { this.providersConsulted = providersConsulted; }

    public List<String> getWarnings() { return warnings; }
    public void setWarnings(List<String> warnings) { this.warnings = warnings; }

    public Instant getSearchTimestamp() { return searchTimestamp; }
    public void setSearchTimestamp(Instant searchTimestamp) { this.searchTimestamp = searchTimestamp; }
}

package com.travelsmart.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CustomHybridValidationResultDTO {
    private boolean valid;
    private String statusMessage;
    private String riskLevel = "LOW"; // LOW, MODERATE, HIGH, IMPOSSIBLE
    private Integer totalDurationMinutes = 0;
    private Integer totalTravelTimeMinutes = 0;
    private Integer totalLayoverMinutes = 0;
    private BigDecimal totalPrice = BigDecimal.ZERO;
    private BigDecimal totalCo2Kg = BigDecimal.ZERO;
    private BigDecimal co2SavedPercent = BigDecimal.ZERO;
    private List<String> transferAlerts = new ArrayList<>();
    private List<JourneyLegDTO> resolvedLegs = new ArrayList<>();

    public CustomHybridValidationResultDTO() {}

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Integer getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(Integer totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }

    public Integer getTotalTravelTimeMinutes() { return totalTravelTimeMinutes; }
    public void setTotalTravelTimeMinutes(Integer totalTravelTimeMinutes) { this.totalTravelTimeMinutes = totalTravelTimeMinutes; }

    public Integer getTotalLayoverMinutes() { return totalLayoverMinutes; }
    public void setTotalLayoverMinutes(Integer totalLayoverMinutes) { this.totalLayoverMinutes = totalLayoverMinutes; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public BigDecimal getTotalCo2Kg() { return totalCo2Kg; }
    public void setTotalCo2Kg(BigDecimal totalCo2Kg) { this.totalCo2Kg = totalCo2Kg; }

    public BigDecimal getCo2SavedPercent() { return co2SavedPercent; }
    public void setCo2SavedPercent(BigDecimal co2SavedPercent) { this.co2SavedPercent = co2SavedPercent; }

    public List<String> getTransferAlerts() { return transferAlerts; }
    public void setTransferAlerts(List<String> transferAlerts) { this.transferAlerts = transferAlerts; }

    public List<JourneyLegDTO> getResolvedLegs() { return resolvedLegs; }
    public void setResolvedLegs(List<JourneyLegDTO> resolvedLegs) { this.resolvedLegs = resolvedLegs; }
}

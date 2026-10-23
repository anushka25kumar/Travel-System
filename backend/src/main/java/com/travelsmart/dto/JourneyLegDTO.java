package com.travelsmart.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class JourneyLegDTO {
    private Integer legOrder;
    private String mode; // FLIGHT, TRAIN, BUS
    private String carrierName;
    private String carrierCode;
    private String sourceCity;
    private String sourceStationName;
    private String sourceCode;
    private Double sourceLat;
    private Double sourceLng;
    private String destCity;
    private String destStationName;
    private String destCode;
    private Double destLat;
    private Double destLng;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private Integer durationMinutes;
    private Integer layoverMinutesToNext = 0;
    private BigDecimal price;
    private BigDecimal co2Kg;

    public JourneyLegDTO() {}

    public Integer getLegOrder() { return legOrder; }
    public void setLegOrder(Integer legOrder) { this.legOrder = legOrder; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getCarrierName() { return carrierName; }
    public void setCarrierName(String carrierName) { this.carrierName = carrierName; }

    public String getCarrierCode() { return carrierCode; }
    public void setCarrierCode(String carrierCode) { this.carrierCode = carrierCode; }

    public String getSourceCity() { return sourceCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; }

    public String getSourceStationName() { return sourceStationName; }
    public void setSourceStationName(String sourceStationName) { this.sourceStationName = sourceStationName; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public Double getSourceLat() { return sourceLat; }
    public void setSourceLat(Double sourceLat) { this.sourceLat = sourceLat; }

    public Double getSourceLng() { return sourceLng; }
    public void setSourceLng(Double sourceLng) { this.sourceLng = sourceLng; }

    public String getDestCity() { return destCity; }
    public void setDestCity(String destCity) { this.destCity = destCity; }

    public String getDestStationName() { return destStationName; }
    public void setDestStationName(String destStationName) { this.destStationName = destStationName; }

    public String getDestCode() { return destCode; }
    public void setDestCode(String destCode) { this.destCode = destCode; }

    public Double getDestLat() { return destLat; }
    public void setDestLat(Double destLat) { this.destLat = destLat; }

    public Double getDestLng() { return destLng; }
    public void setDestLng(Double destLng) { this.destLng = destLng; }

    public LocalTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalTime departureTime) { this.departureTime = departureTime; }
    public void setDepartureTime(String timeStr) {
        if (timeStr != null) {
            try {
                this.departureTime = LocalTime.parse(timeStr);
            } catch (Exception e) {
                // If contains date or seconds
                String[] parts = timeStr.split("T");
                String t = parts[parts.length - 1];
                if (t.length() == 5) t = t + ":00";
                this.departureTime = LocalTime.parse(t.substring(0, 8));
            }
        }
    }

    public LocalTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }
    public void setArrivalTime(String timeStr) {
        if (timeStr != null) {
            try {
                this.arrivalTime = LocalTime.parse(timeStr);
            } catch (Exception e) {
                String[] parts = timeStr.split("T");
                String t = parts[parts.length - 1];
                if (t.length() == 5) t = t + ":00";
                this.arrivalTime = LocalTime.parse(t.substring(0, 8));
            }
        }
    }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getLayoverMinutesToNext() { return layoverMinutesToNext; }
    public void setLayoverMinutesToNext(Integer layoverMinutesToNext) { this.layoverMinutesToNext = layoverMinutesToNext; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getCo2Kg() { return co2Kg; }
    public void setCo2Kg(BigDecimal co2Kg) { this.co2Kg = co2Kg; }

    // Convenience aliases for frontend mapping
    public String getOriginCity() { return getSourceCity(); }
    public void setOriginCity(String originCity) { setSourceCity(originCity); }

    public String getDestinationCity() { return getDestCity(); }
    public void setDestinationCity(String destinationCity) { setDestCity(destinationCity); }

    public String getTransportType() { return getMode(); }
    public void setTransportType(String transportType) { setMode(transportType); }

    public String getOperatorName() { return getCarrierName(); }
    public void setOperatorName(String operatorName) { setCarrierName(operatorName); }

    public String getServiceNumber() { return getCarrierCode(); }
    public void setServiceNumber(String serviceNumber) { setCarrierCode(serviceNumber); }

    public BigDecimal getFareAmount() { return getPrice(); }
    public void setFareAmount(BigDecimal fareAmount) { setPrice(fareAmount); }
}

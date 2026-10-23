package com.travelsmart.dto;

public class CustomLegInputDTO {
    private Integer legOrder;
    private String fromCity;
    private String toCity;
    private String preferredMode; // FLIGHT, TRAIN, BUS, ANY
    private String departureTimePreference; // MORNING, AFTERNOON, EVENING, ANY
    private Long scheduleId;

    public CustomLegInputDTO() {}

    public CustomLegInputDTO(Integer legOrder, String fromCity, String toCity, String preferredMode) {
        this.legOrder = legOrder;
        this.fromCity = fromCity;
        this.toCity = toCity;
        this.preferredMode = preferredMode;
    }

    public Integer getLegOrder() { return legOrder; }
    public void setLegOrder(Integer legOrder) { this.legOrder = legOrder; }

    public String getFromCity() { return fromCity; }
    public void setFromCity(String fromCity) { this.fromCity = fromCity; }

    public String getToCity() { return toCity; }
    public void setToCity(String toCity) { this.toCity = toCity; }

    public String getPreferredMode() { return preferredMode; }
    public void setPreferredMode(String preferredMode) { this.preferredMode = preferredMode; }

    public String getDepartureTimePreference() { return departureTimePreference; }
    public void setDepartureTimePreference(String departureTimePreference) { this.departureTimePreference = departureTimePreference; }

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }
}

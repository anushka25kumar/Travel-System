package com.travelsmart.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CustomHybridRequest {
    private String journeyName = "Custom Hybrid Route";
    private String originCity;
    private String destinationCity;
    private LocalDate travelDate;
    private Integer passengers = 1;
    private List<CustomLegInputDTO> legs = new ArrayList<>();

    public CustomHybridRequest() {}

    public String getJourneyName() { return journeyName; }
    public void setJourneyName(String journeyName) { this.journeyName = journeyName; }

    public String getOriginCity() { return originCity; }
    public void setOriginCity(String originCity) { this.originCity = originCity; }

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public LocalDate getTravelDate() { return travelDate; }
    public void setTravelDate(LocalDate travelDate) { this.travelDate = travelDate; }

    public Integer getPassengers() { return passengers; }
    public void setPassengers(Integer passengers) { this.passengers = passengers; }

    public List<CustomLegInputDTO> getLegs() { return legs; }
    public void setLegs(List<CustomLegInputDTO> legs) { this.legs = legs; }
}

package com.travelsmart.dto;

import java.time.LocalDate;

public class SearchRequest {
    private String source;
    private String destination;
    private LocalDate travelDate;
    private Integer passengers = 1;
    private String mode = "ALL"; // ALL, FLIGHT, TRAIN, BUS, HYBRID
    private String sortBy = "RECOMMENDED"; // RECOMMENDED, FASTEST, CHEAPEST, ECO

    public SearchRequest() {}

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public LocalDate getTravelDate() { return travelDate; }
    public void setTravelDate(LocalDate travelDate) { this.travelDate = travelDate; }

    public Integer getPassengers() { return passengers; }
    public void setPassengers(Integer passengers) { this.passengers = passengers; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
}

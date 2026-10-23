package com.travelsmart.dto;

import java.util.ArrayList;
import java.util.List;

public class LiveSearchResponseDTO {
    private String sourceCity;
    private String destinationCity;
    private String travelDate;
    private int passengers = 1;
    private SearchStatusDTO status = new SearchStatusDTO();
    private List<JourneyOptionDTO> journeys = new ArrayList<>();

    public LiveSearchResponseDTO() {}

    public LiveSearchResponseDTO(SearchStatusDTO status, List<JourneyOptionDTO> journeys) {
        this.status = status;
        this.journeys = journeys != null ? journeys : new ArrayList<>();
    }

    public LiveSearchResponseDTO(String sourceCity, String destinationCity, String travelDate, int passengers, SearchStatusDTO status, List<JourneyOptionDTO> journeys) {
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.travelDate = travelDate;
        this.passengers = passengers;
        this.status = status;
        this.journeys = journeys != null ? journeys : new ArrayList<>();
    }

    public String getSourceCity() { return sourceCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; }

    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }

    public String getTravelDate() { return travelDate; }
    public void setTravelDate(String travelDate) { this.travelDate = travelDate; }

    public int getPassengers() { return passengers; }
    public void setPassengers(int passengers) { this.passengers = passengers; }

    public SearchStatusDTO getStatus() { return status; }
    public void setStatus(SearchStatusDTO status) { this.status = status; }

    public List<JourneyOptionDTO> getJourneys() { return journeys; }
    public void setJourneys(List<JourneyOptionDTO> journeys) { this.journeys = journeys; }
}

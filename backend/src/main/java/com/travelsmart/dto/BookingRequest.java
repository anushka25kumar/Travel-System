package com.travelsmart.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BookingRequest {
    private Long scheduleId;
    private String journeyOptionId;
    private List<Long> selectedLegScheduleIds = new ArrayList<>();
    private String journeyType = "HYBRID";
    private String originCity;
    private String destinationCity;
    private String sourceCity;
    private String destCity;
    private LocalDate travelDate;
    private Integer passengersCount = 1;
    private Integer passengers = 1;
    private BigDecimal totalPrice;
    private Integer totalDurationMinutes;
    private BigDecimal totalCo2Kg;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String passengerNames;
    private String seatSelections;
    private Boolean hasLuggageInsurance = false;
    private Boolean hasCarbonOffset = false;
    private String paymentMethod = "CREDIT_CARD";
    private List<JourneyLegDTO> legs = new ArrayList<>();

    public BookingRequest() {}

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }

    public String getJourneyOptionId() { return journeyOptionId; }
    public void setJourneyOptionId(String journeyOptionId) { this.journeyOptionId = journeyOptionId; }

    public List<Long> getSelectedLegScheduleIds() { return selectedLegScheduleIds; }
    public void setSelectedLegScheduleIds(List<Long> selectedLegScheduleIds) { this.selectedLegScheduleIds = selectedLegScheduleIds; }

    public String getJourneyType() { return journeyType; }
    public void setJourneyType(String journeyType) { this.journeyType = journeyType; }

    public String getOriginCity() { return originCity != null ? originCity : sourceCity; }
    public void setOriginCity(String originCity) { this.originCity = originCity; this.sourceCity = originCity; }

    public String getDestinationCity() { return destinationCity != null ? destinationCity : destCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; this.destCity = destinationCity; }

    public String getSourceCity() { return sourceCity != null ? sourceCity : originCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; this.originCity = sourceCity; }

    public String getDestCity() { return destCity != null ? destCity : destinationCity; }
    public void setDestCity(String destCity) { this.destCity = destCity; this.destinationCity = destCity; }

    public LocalDate getTravelDate() { return travelDate; }
    public void setTravelDate(LocalDate travelDate) { this.travelDate = travelDate; }

    public Integer getPassengersCount() { return passengersCount != null ? passengersCount : passengers; }
    public void setPassengersCount(Integer passengersCount) { this.passengersCount = passengersCount; this.passengers = passengersCount; }

    public Integer getPassengers() { return passengers != null ? passengers : passengersCount; }
    public void setPassengers(Integer passengers) { this.passengers = passengers; this.passengersCount = passengers; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public Integer getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(Integer totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }

    public BigDecimal getTotalCo2Kg() { return totalCo2Kg; }
    public void setTotalCo2Kg(BigDecimal totalCo2Kg) { this.totalCo2Kg = totalCo2Kg; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getPassengerName() { return contactName; }
    public void setPassengerName(String passengerName) { this.contactName = passengerName; }

    public String getPassengerEmail() { return contactEmail; }
    public void setPassengerEmail(String passengerEmail) { this.contactEmail = passengerEmail; }

    public String getPassengerPhone() { return contactPhone; }
    public void setPassengerPhone(String passengerPhone) { this.contactPhone = passengerPhone; }

    public String getPassengerNames() { return passengerNames; }
    public void setPassengerNames(String passengerNames) { this.passengerNames = passengerNames; }

    public String getSeatSelections() { return seatSelections; }
    public void setSeatSelections(String seatSelections) { this.seatSelections = seatSelections; }

    public Boolean getHasLuggageInsurance() { return hasLuggageInsurance; }
    public void setHasLuggageInsurance(Boolean hasLuggageInsurance) { this.hasLuggageInsurance = hasLuggageInsurance; }

    public Boolean getHasCarbonOffset() { return hasCarbonOffset; }
    public void setHasCarbonOffset(Boolean hasCarbonOffset) { this.hasCarbonOffset = hasCarbonOffset; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<JourneyLegDTO> getLegs() { return legs; }
    public void setLegs(List<JourneyLegDTO> legs) { this.legs = legs; }
}

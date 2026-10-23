package com.travelsmart.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class BookingResponseDTO {
    private Long id;
    private Long rawId;
    private String bookingId;
    private String bookingReference;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String passengerName;
    private String passengerEmail;
    private String passengerPhone;
    private LocalDate travelDate;
    private Integer passengersCount = 1;
    private Integer passengerCount = 1;
    private String originCity;
    private String destinationCity;
    private String sourceCity;
    private String destCity;
    private String journeyTitle;
    private String transportMode;
    private String operatorName;
    private String serviceNumber;
    private LocalDateTime departureDateTime;
    private LocalDateTime arrivalDateTime;
    private LocalDate departureDate;
    private LocalDate arrivalDate;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private BigDecimal totalPrice;
    private BigDecimal totalAmount;
    private String currency = "INR";
    private Integer totalDurationMinutes;
    private BigDecimal totalCo2Kg;
    private String journeyType;
    private String status = "CONFIRMED";
    private String bookingStatus = "CONFIRMED";
    private String paymentStatus = "COMPLETED";
    private String passengerNames;
    private String seatSelections;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime bookingDate = LocalDateTime.now();
    private String qrCodeData;
    private List<JourneyLegDTO> legs = new ArrayList<>();

    public BookingResponseDTO() {}

    public Long getId() { return id != null ? id : rawId; }
    public void setId(Long id) { this.id = id; this.rawId = id; }

    public Long getRawId() { return rawId != null ? rawId : id; }
    public void setRawId(Long rawId) { this.rawId = rawId; this.id = rawId; }

    public String getBookingId() { return bookingId != null ? bookingId : bookingReference; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; this.bookingReference = bookingId; }

    public String getBookingReference() { return bookingReference != null ? bookingReference : bookingId; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; this.bookingId = bookingReference; }

    public String getContactName() { return contactName != null ? contactName : passengerName; }
    public void setContactName(String contactName) { this.contactName = contactName; this.passengerName = contactName; }

    public String getContactEmail() { return contactEmail != null ? contactEmail : passengerEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; this.passengerEmail = contactEmail; }

    public String getContactPhone() { return contactPhone != null ? contactPhone : passengerPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; this.passengerPhone = contactPhone; }

    public String getPassengerName() { return passengerName != null ? passengerName : contactName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; this.contactName = passengerName; }

    public String getPassengerEmail() { return passengerEmail != null ? passengerEmail : contactEmail; }
    public void setPassengerEmail(String passengerEmail) { this.passengerEmail = passengerEmail; this.contactEmail = passengerEmail; }

    public String getPassengerPhone() { return passengerPhone != null ? passengerPhone : contactPhone; }
    public void setPassengerPhone(String passengerPhone) { this.passengerPhone = passengerPhone; this.contactPhone = passengerPhone; }

    public LocalDate getTravelDate() { return travelDate; }
    public void setTravelDate(LocalDate travelDate) { this.travelDate = travelDate; }

    public Integer getPassengersCount() { return passengersCount != null ? passengersCount : passengerCount; }
    public void setPassengersCount(Integer passengersCount) { this.passengersCount = passengersCount; this.passengerCount = passengersCount; }

    public Integer getPassengerCount() { return passengerCount != null ? passengerCount : passengersCount; }
    public void setPassengerCount(Integer passengerCount) { this.passengerCount = passengerCount; this.passengersCount = passengerCount; }

    public String getOriginCity() { return originCity != null ? originCity : sourceCity; }
    public void setOriginCity(String originCity) { this.originCity = originCity; this.sourceCity = originCity; }

    public String getDestinationCity() { return destinationCity != null ? destinationCity : destCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; this.destCity = destinationCity; }

    public String getSourceCity() { return sourceCity != null ? sourceCity : originCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; this.originCity = sourceCity; }

    public String getDestCity() { return destCity != null ? destCity : destinationCity; }
    public void setDestCity(String destCity) { this.destCity = destCity; this.destinationCity = destCity; }

    public String getJourneyTitle() { return journeyTitle; }
    public void setJourneyTitle(String journeyTitle) { this.journeyTitle = journeyTitle; }

    public String getTransportMode() { return transportMode; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }

    public BigDecimal getTotalPrice() { return totalPrice != null ? totalPrice : totalAmount; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; this.totalAmount = totalPrice; }

    public BigDecimal getTotalAmount() { return totalAmount != null ? totalAmount : totalPrice; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; this.totalPrice = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Integer getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(Integer totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }

    public BigDecimal getTotalCo2Kg() { return totalCo2Kg; }
    public void setTotalCo2Kg(BigDecimal totalCo2Kg) { this.totalCo2Kg = totalCo2Kg; }

    public String getJourneyType() { return journeyType; }
    public void setJourneyType(String journeyType) { this.journeyType = journeyType; }

    public String getStatus() { return status != null ? status : bookingStatus; }
    public void setStatus(String status) { this.status = status; this.bookingStatus = status; }

    public String getBookingStatus() { return bookingStatus != null ? bookingStatus : status; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; this.status = bookingStatus; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPassengerNames() { return passengerNames; }
    public void setPassengerNames(String passengerNames) { this.passengerNames = passengerNames; }

    public String getSeatSelections() { return seatSelections; }
    public void setSeatSelections(String seatSelections) { this.seatSelections = seatSelections; }

    public LocalDateTime getCreatedAt() { return createdAt != null ? createdAt : bookingDate; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; this.bookingDate = createdAt; }

    public LocalDateTime getBookingDate() { return bookingDate != null ? bookingDate : createdAt; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; this.createdAt = bookingDate; }

    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getServiceNumber() { return serviceNumber; }
    public void setServiceNumber(String serviceNumber) { this.serviceNumber = serviceNumber; }

    public LocalDateTime getDepartureDateTime() { return departureDateTime; }
    public void setDepartureDateTime(LocalDateTime departureDateTime) { this.departureDateTime = departureDateTime; }

    public LocalDateTime getArrivalDateTime() { return arrivalDateTime; }
    public void setArrivalDateTime(LocalDateTime arrivalDateTime) { this.arrivalDateTime = arrivalDateTime; }

    public LocalTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalTime departureTime) { this.departureTime = departureTime; }

    public LocalTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public LocalDate getDepartureDate() {
        return departureDate != null ? departureDate : (departureDateTime != null ? departureDateTime.toLocalDate() : travelDate);
    }
    public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }

    public LocalDate getArrivalDate() {
        return arrivalDate != null ? arrivalDate : (arrivalDateTime != null ? arrivalDateTime.toLocalDate() : null);
    }
    public void setArrivalDate(LocalDate arrivalDate) { this.arrivalDate = arrivalDate; }

    public List<JourneyLegDTO> getLegs() { return legs; }
    public void setLegs(List<JourneyLegDTO> legs) { this.legs = legs; }
}

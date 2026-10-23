package com.travelsmart.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class JourneyOptionDTO {
    // Primary Identifiers
    private String id;
    private String journeyId;
    private String title;
    private String journeyType; // FLIGHT, TRAIN, BUS, HYBRID, CUSTOM_HYBRID
    private String transportMode;

    // Provider & Operator Details
    private String providerName = "TravelSmart Core";
    private String providerOfferId;
    private String primaryCarrier;
    private String operatorName;
    private String carrierCode;
    private String serviceNumber;

    // Terminals & Stations
    private String sourceCity;
    private String sourceStationName;
    private String sourceTerminal;
    private String sourceCode;

    private String destCity;
    private String destStationName;
    private String destTerminal;
    private String destCode;

    // Timings
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private String departureDateTime;
    private String arrivalDateTime;
    private Integer totalDurationMinutes;

    // Pricing & Currency
    private BigDecimal totalPrice;
    private String currency = "INR";
    private BigDecimal totalCo2Kg;

    // Availability & Data Source
    private Integer availableSeats = 42;
    private String availabilityStatus = "AVAILABLE"; // AVAILABLE, WAITLIST, TIMETABLE_ONLY, UNAVAILABLE
    private DataSourceType dataSource = DataSourceType.DEMO; // LIVE, CACHED, DEMO, UNAVAILABLE
    private Instant fetchedAt = Instant.now();
    private Instant expiresAt = Instant.now().plusSeconds(3600);

    // Multimodal & Recommendation Metadata
    private Integer transfersCount = 0;
    private String recommendationTag; // FASTEST, CHEAPEST, ECO_FRIENDLY, BEST_VALUE
    private String riskLevel = "LOW"; // LOW, MODERATE, HIGH
    private String transferRisk = "LOW";
    private String amenities = "Wi-Fi, AC, Power Outlets";

    // Booking & Cancellation Policies
    private Boolean bookingSupported = true;
    private String bookingUrl;
    private String cancellationPolicy = "Full refund if cancelled up to 4 hours before departure.";

    // Transit Legs
    private List<JourneyLegDTO> legs = new ArrayList<>();

    public JourneyOptionDTO() {}

    // Getters and Setters with normalization aliases
    public String getId() { return id != null ? id : journeyId; }
    public void setId(String id) {
        this.id = id;
        if (this.journeyId == null) this.journeyId = id;
    }

    public String getJourneyId() { return journeyId != null ? journeyId : id; }
    public void setJourneyId(String journeyId) {
        this.journeyId = journeyId;
        if (this.id == null) this.id = journeyId;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getJourneyType() { return journeyType != null ? journeyType : transportMode; }
    public void setJourneyType(String journeyType) {
        this.journeyType = journeyType;
        if (this.transportMode == null) this.transportMode = journeyType;
    }

    public String getTransportMode() { return transportMode != null ? transportMode : journeyType; }
    public void setTransportMode(String transportMode) {
        this.transportMode = transportMode;
        if (this.journeyType == null) this.journeyType = transportMode;
    }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderOfferId() { return providerOfferId; }
    public void setProviderOfferId(String providerOfferId) { this.providerOfferId = providerOfferId; }

    public String getPrimaryCarrier() { return primaryCarrier != null ? primaryCarrier : operatorName; }
    public void setPrimaryCarrier(String primaryCarrier) {
        this.primaryCarrier = primaryCarrier;
        if (this.operatorName == null) this.operatorName = primaryCarrier;
    }

    public String getOperatorName() { return operatorName != null ? operatorName : primaryCarrier; }
    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
        if (this.primaryCarrier == null) this.primaryCarrier = operatorName;
    }

    public String getCarrierCode() { return carrierCode != null ? carrierCode : serviceNumber; }
    public void setCarrierCode(String carrierCode) {
        this.carrierCode = carrierCode;
        if (this.serviceNumber == null) this.serviceNumber = carrierCode;
    }

    public String getServiceNumber() { return serviceNumber != null ? serviceNumber : carrierCode; }
    public void setServiceNumber(String serviceNumber) {
        this.serviceNumber = serviceNumber;
        if (this.carrierCode == null) this.carrierCode = serviceNumber;
    }

    public String getSourceCity() { return sourceCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; }

    public String getSourceStationName() { return sourceStationName != null ? sourceStationName : sourceTerminal; }
    public void setSourceStationName(String sourceStationName) {
        this.sourceStationName = sourceStationName;
        if (this.sourceTerminal == null) this.sourceTerminal = sourceStationName;
    }

    public String getSourceTerminal() { return sourceTerminal != null ? sourceTerminal : sourceStationName; }
    public void setSourceTerminal(String sourceTerminal) {
        this.sourceTerminal = sourceTerminal;
        if (this.sourceStationName == null) this.sourceStationName = sourceTerminal;
    }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) { this.sourceCode = sourceCode; }

    public String getDestCity() { return destCity; }
    public void setDestCity(String destCity) { this.destCity = destCity; }

    public String getDestStationName() { return destStationName != null ? destStationName : destTerminal; }
    public void setDestStationName(String destStationName) {
        this.destStationName = destStationName;
        if (this.destTerminal == null) this.destTerminal = destStationName;
    }

    public String getDestTerminal() { return destTerminal != null ? destTerminal : destStationName; }
    public void setDestTerminal(String destTerminal) {
        this.destTerminal = destTerminal;
        if (this.destStationName == null) this.destStationName = destTerminal;
    }

    public String getDestCode() { return destCode; }
    public void setDestCode(String destCode) { this.destCode = destCode; }

    public LocalTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalTime departureTime) { this.departureTime = departureTime; }

    public LocalTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getDepartureDateTime() { return departureDateTime; }
    public void setDepartureDateTime(String departureDateTime) { this.departureDateTime = departureDateTime; }

    public String getArrivalDateTime() { return arrivalDateTime; }
    public void setArrivalDateTime(String arrivalDateTime) { this.arrivalDateTime = arrivalDateTime; }

    public Integer getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(Integer totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getTotalCo2Kg() { return totalCo2Kg; }
    public void setTotalCo2Kg(BigDecimal totalCo2Kg) { this.totalCo2Kg = totalCo2Kg; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public DataSourceType getDataSource() { return dataSource; }
    public void setDataSource(DataSourceType dataSource) { this.dataSource = dataSource; }

    public Instant getFetchedAt() { return fetchedAt; }
    public void setFetchedAt(Instant fetchedAt) { this.fetchedAt = fetchedAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Integer getTransfersCount() { return transfersCount; }
    public void setTransfersCount(Integer transfersCount) { this.transfersCount = transfersCount; }

    public String getRecommendationTag() { return recommendationTag; }
    public void setRecommendationTag(String recommendationTag) { this.recommendationTag = recommendationTag; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
        this.transferRisk = riskLevel;
    }

    public String getTransferRisk() { return transferRisk; }
    public void setTransferRisk(String transferRisk) {
        this.transferRisk = transferRisk;
        this.riskLevel = transferRisk;
    }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public Boolean getBookingSupported() { return bookingSupported; }
    public void setBookingSupported(Boolean bookingSupported) { this.bookingSupported = bookingSupported; }

    public String getBookingUrl() { return bookingUrl; }
    public void setBookingUrl(String bookingUrl) { this.bookingUrl = bookingUrl; }

    public String getCancellationPolicy() { return cancellationPolicy; }
    public void setCancellationPolicy(String cancellationPolicy) { this.cancellationPolicy = cancellationPolicy; }

    public List<JourneyLegDTO> getLegs() { return legs; }
    public void setLegs(List<JourneyLegDTO> legs) { this.legs = legs; }

    // Database Column & Phase 3 Compatibility Accessors
    private Long scheduleId;
    private BigDecimal basePrice;

    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }

    public Long getSchedule_id() { return scheduleId; }
    public String getTransport_type() { return getTransportMode(); }
    public String getOperator_name() { return getOperatorName(); }
    public String getService_number() { return getServiceNumber(); }
    public String getSource() { return getSourceCity(); }
    public String getDestination() { return getDestCity(); }
    public String getDeparture_datetime() { return getDepartureDateTime(); }
    public String getArrival_datetime() { return getArrivalDateTime(); }
    public BigDecimal getBase_price() { return basePrice != null ? basePrice : totalPrice; }
    public BigDecimal getBasePrice() { return basePrice != null ? basePrice : totalPrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public Integer getAvailable_seats() { return getAvailableSeats(); }
}

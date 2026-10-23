package com.travelsmart.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "transport")
public class Transport {

    public enum Mode {
        FLIGHT, TRAIN, BUS
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transport_id")
    private Long transportId;

    @Column(name = "transport_type", nullable = false, length = 20)
    private String transportType; // FLIGHT, TRAIN, BUS

    @Column(name = "operator_name", nullable = false, length = 150)
    private String operatorName;

    @Column(name = "service_number", nullable = false, length = 50)
    private String serviceNumber;

    @Column(name = "transport_details", columnDefinition = "TEXT")
    private String transportDetails;

    public Transport() {}

    public Transport(String transportType, String operatorName, String serviceNumber, String transportDetails) {
        this.transportType = transportType;
        this.operatorName = operatorName;
        this.serviceNumber = serviceNumber;
        this.transportDetails = transportDetails;
    }

    public Long getTransportId() { return transportId; }
    public void setTransportId(Long transportId) { this.transportId = transportId; }

    public String getTransportType() { return transportType; }
    public void setTransportType(String transportType) { this.transportType = transportType; }

    public Mode getType() {
        if (transportType == null) return Mode.FLIGHT;
        try {
            return Mode.valueOf(transportType.toUpperCase());
        } catch (Exception e) {
            return Mode.FLIGHT;
        }
    }

    public void setType(Mode mode) {
        this.transportType = mode != null ? mode.name() : "FLIGHT";
    }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getCarrierName() { return operatorName; }
    public void setCarrierName(String carrierName) { this.operatorName = carrierName; }

    public String getServiceNumber() { return serviceNumber; }
    public void setServiceNumber(String serviceNumber) { this.serviceNumber = serviceNumber; }

    public String getCarrierCode() { return serviceNumber; }
    public void setCarrierCode(String carrierCode) { this.serviceNumber = carrierCode; }

    public String getTransportDetails() { return transportDetails; }
    public void setTransportDetails(String transportDetails) { this.transportDetails = transportDetails; }
}

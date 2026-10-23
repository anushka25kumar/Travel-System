package com.travelsmart.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hybrid_journeys")
public class HybridJourney {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hybrid_journey_id")
    private Long hybridJourneyId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_city_id", nullable = false)
    private City sourceCity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_city_id", nullable = false)
    private City destinationCity;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "total_duration_minutes", nullable = false)
    private Integer totalDurationMinutes;

    @Column(name = "transfer_risk", nullable = false, length = 20)
    private String transferRisk = "LOW";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "hybridJourney", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<HybridJourneyLeg> legs = new ArrayList<>();

    public HybridJourney() {}

    public HybridJourney(User user, City sourceCity, City destinationCity, BigDecimal totalPrice,
                         Integer totalDurationMinutes, String transferRisk) {
        this.user = user;
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.totalPrice = totalPrice;
        this.totalDurationMinutes = totalDurationMinutes;
        this.transferRisk = transferRisk != null ? transferRisk : "LOW";
        this.createdAt = LocalDateTime.now();
    }

    public Long getHybridJourneyId() { return hybridJourneyId; }
    public void setHybridJourneyId(Long hybridJourneyId) { this.hybridJourneyId = hybridJourneyId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public City getSourceCity() { return sourceCity; }
    public void setSourceCity(City sourceCity) { this.sourceCity = sourceCity; }

    public City getDestinationCity() { return destinationCity; }
    public void setDestinationCity(City destinationCity) { this.destinationCity = destinationCity; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public Integer getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(Integer totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }

    public String getTransferRisk() { return transferRisk; }
    public void setTransferRisk(String transferRisk) { this.transferRisk = transferRisk; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<HybridJourneyLeg> getLegs() { return legs; }
    public void setLegs(List<HybridJourneyLeg> legs) { this.legs = legs; }
}

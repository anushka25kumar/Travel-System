package com.travelsmart.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "hybrid_journey_legs")
public class HybridJourneyLeg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hybrid_leg_id")
    private Long hybridLegId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hybrid_journey_id", nullable = false)
    @JsonBackReference
    private HybridJourney hybridJourney;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @Column(name = "leg_order", nullable = false)
    private Integer legOrder;

    public HybridJourneyLeg() {}

    public HybridJourneyLeg(HybridJourney hybridJourney, Schedule schedule, Integer legOrder) {
        this.hybridJourney = hybridJourney;
        this.schedule = schedule;
        this.legOrder = legOrder;
    }

    public Long getHybridLegId() { return hybridLegId; }
    public void setHybridLegId(Long hybridLegId) { this.hybridLegId = hybridLegId; }

    public HybridJourney getHybridJourney() { return hybridJourney; }
    public void setHybridJourney(HybridJourney hybridJourney) { this.hybridJourney = hybridJourney; }

    public Schedule getSchedule() { return schedule; }
    public void setSchedule(Schedule schedule) { this.schedule = schedule; }

    public Integer getLegOrder() { return legOrder; }
    public void setLegOrder(Integer legOrder) { this.legOrder = legOrder; }
}

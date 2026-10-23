package com.travelsmart.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "booking_legs")
public class BookingLeg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_leg_id")
    private Long bookingLegId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonBackReference
    private Booking booking;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @Column(name = "leg_order", nullable = false)
    private Integer legOrder;

    @Column(name = "price_at_booking", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAtBooking;

    public BookingLeg() {}

    public BookingLeg(Booking booking, Schedule schedule, Integer legOrder, BigDecimal priceAtBooking) {
        this.booking = booking;
        this.schedule = schedule;
        this.legOrder = legOrder;
        this.priceAtBooking = priceAtBooking;
    }

    public Long getBookingLegId() { return bookingLegId; }
    public void setBookingLegId(Long bookingLegId) { this.bookingLegId = bookingLegId; }

    public Booking getBooking() { return booking; }
    public void setBooking(Booking booking) { this.booking = booking; }

    public Schedule getSchedule() { return schedule; }
    public void setSchedule(Schedule schedule) { this.schedule = schedule; }

    public Integer getLegOrder() { return legOrder; }
    public void setLegOrder(Integer legOrder) { this.legOrder = legOrder; }

    public BigDecimal getPriceAtBooking() { return priceAtBooking; }
    public void setPriceAtBooking(BigDecimal priceAtBooking) { this.priceAtBooking = priceAtBooking; }
}

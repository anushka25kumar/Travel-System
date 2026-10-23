package com.travelsmart.dto;

import java.math.BigDecimal;
import java.time.Instant;

public class OfferRevalidationResultDTO {
    private boolean valid;
    private boolean priceChanged;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private boolean seatsAvailable;
    private Integer remainingSeats;
    private String statusMessage;
    private Instant revalidatedAt = Instant.now();

    public OfferRevalidationResultDTO() {}

    public static OfferRevalidationResultDTO success(BigDecimal price, Integer seats) {
        OfferRevalidationResultDTO res = new OfferRevalidationResultDTO();
        res.setValid(true);
        res.setPriceChanged(false);
        res.setOldPrice(price);
        res.setNewPrice(price);
        res.setSeatsAvailable(true);
        res.setRemainingSeats(seats != null ? seats : 24);
        res.setStatusMessage("Fare and seat availability revalidated successfully.");
        return res;
    }

    public static OfferRevalidationResultDTO priceChanged(BigDecimal oldPrice, BigDecimal newPrice, Integer seats) {
        OfferRevalidationResultDTO res = new OfferRevalidationResultDTO();
        res.setValid(true);
        res.setPriceChanged(true);
        res.setOldPrice(oldPrice);
        res.setNewPrice(newPrice);
        res.setSeatsAvailable(true);
        res.setRemainingSeats(seats);
        res.setStatusMessage("Fare updated by provider from ₹" + oldPrice + " to ₹" + newPrice + ".");
        return res;
    }

    public static OfferRevalidationResultDTO unavailable(String message) {
        OfferRevalidationResultDTO res = new OfferRevalidationResultDTO();
        res.setValid(false);
        res.setPriceChanged(false);
        res.setSeatsAvailable(false);
        res.setStatusMessage(message);
        return res;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public boolean isPriceChanged() { return priceChanged; }
    public void setPriceChanged(boolean priceChanged) { this.priceChanged = priceChanged; }

    public BigDecimal getOldPrice() { return oldPrice; }
    public void setOldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; }

    public BigDecimal getNewPrice() { return newPrice; }
    public void setNewPrice(BigDecimal newPrice) { this.newPrice = newPrice; }

    public boolean isSeatsAvailable() { return seatsAvailable; }
    public void setSeatsAvailable(boolean seatsAvailable) { this.seatsAvailable = seatsAvailable; }

    public Integer getRemainingSeats() { return remainingSeats; }
    public void setRemainingSeats(Integer remainingSeats) { this.remainingSeats = remainingSeats; }

    public String getStatusMessage() { return statusMessage; }
    public void setStatusMessage(String statusMessage) { this.statusMessage = statusMessage; }

    public Instant getRevalidatedAt() { return revalidatedAt; }
    public void setRevalidatedAt(Instant revalidatedAt) { this.revalidatedAt = revalidatedAt; }
}

package com.travelsmart.controller;

import com.travelsmart.dto.BookingRequest;
import com.travelsmart.dto.BookingResponseDTO;
import com.travelsmart.entity.Booking;
import com.travelsmart.repository.BookingRepository;
import com.travelsmart.repository.UserRepository;
import com.travelsmart.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    private Long resolveUserId(Object paramUserId, String authHeader) {
        // 1. Prioritize authenticated session/token header (Bearer TS-SESSION-{id})
        if (authHeader != null && !authHeader.trim().isEmpty()) {
            String token = authHeader.trim();
            if (token.startsWith("Bearer ")) {
                token = token.substring(7).trim();
            }
            if (token.startsWith("TS-SESSION-")) {
                try {
                    Long uid = Long.parseLong(token.substring("TS-SESSION-".length()).trim());
                    if (userRepository.existsById(uid)) {
                        return uid;
                    }
                } catch (Exception ignored) {}
            }
        }

        // 2. Safely parse userId parameter if valid numeric value (ignore 'undefined', 'null', empty, NaN)
        if (paramUserId != null) {
            String str = String.valueOf(paramUserId).trim();
            if (!str.isEmpty() && !"undefined".equalsIgnoreCase(str) && !"null".equalsIgnoreCase(str) && !"nan".equalsIgnoreCase(str)) {
                try {
                    String digitsOnly = str.replaceAll("[^0-9]", "");
                    if (!digitsOnly.isEmpty()) {
                        Long uid = Long.parseLong(digitsOnly);
                        if (userRepository.existsById(uid)) {
                            return uid;
                        }
                    }
                } catch (Exception ignored) {}
            }
        }

        return null;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody BookingRequest request,
            @RequestParam(value = "userId", required = false) Object userIdParam,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long effectiveUserId = resolveUserId(userIdParam, authHeader);
            if (effectiveUserId == null) {
                // If contact email provided, check if user exists in database
                String email = request.getContactEmail() != null ? request.getContactEmail().trim().toLowerCase() :
                        (request.getPassengerEmail() != null ? request.getPassengerEmail().trim().toLowerCase() : null);
                if (email != null && !email.isEmpty()) {
                    var uOpt = userRepository.findByEmail(email);
                    if (uOpt.isPresent()) {
                        effectiveUserId = uOpt.get().getUserId();
                    }
                }
            }

            if (effectiveUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "error", "Unauthorized: Please sign in or provide contact credentials to book your journey."
                ));
            }

            BookingResponseDTO response = bookingService.createBooking(request, effectiveUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getBookings(
            @RequestParam(value = "userId", required = false) Object userIdParam,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return getMyBookings(userIdParam, authHeader);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(
            @RequestParam(value = "userId", required = false) Object userIdParam,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long effectiveUserId = resolveUserId(userIdParam, authHeader);
        if (effectiveUserId == null) {
            // Task 8: Do not return HTTP 400 for an ordinary empty booking list
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(bookingService.getUserBookings(effectiveUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(
            @PathVariable("id") String idParam,
            @RequestParam(value = "userId", required = false) Object userIdParam,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            String cleanId = idParam.replaceAll("[^0-9]", "");
            if (cleanId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid booking ID"));
            }
            Long id = Long.parseLong(cleanId);
            Long effectiveUserId = resolveUserId(userIdParam, authHeader);

            Optional<BookingResponseDTO> opt = bookingService.getBookingById(id);
            if (opt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Booking not found with ID: " + id));
            }

            BookingResponseDTO dto = opt.get();
            // Ownership check
            if (effectiveUserId != null) {
                Optional<Booking> rawBooking = bookingRepository.findById(id);
                if (rawBooking.isPresent() && !rawBooking.get().getUser().getUserId().equals(effectiveUserId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: You do not own this booking."));
                }
            }

            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBookingPatch(
            @PathVariable("id") String idParam,
            @RequestParam(value = "userId", required = false) Object userIdParam,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long effectiveUserId = resolveUserId(userIdParam, authHeader);
            if (effectiveUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentication required to cancel a booking."));
            }

            String cleanId = idParam.replaceAll("[^0-9]", "");
            if (cleanId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid booking ID"));
            }
            Long id = Long.parseLong(cleanId);

            BookingResponseDTO response = bookingService.cancelBooking(id, effectiveUserId);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBookingPost(
            @PathVariable("id") String idParam,
            @RequestParam(value = "userId", required = false) Object userIdParam,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        return cancelBookingPatch(idParam, userIdParam, authHeader);
    }
}

-- ===================================================================
-- TravelSmart Relational Schema Migration (V1)
-- Compliant with MySQL 8+ and Spring Data JPA
-- ===================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cities Table
CREATE TABLE IF NOT EXISTS cities (
    city_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL
);

-- 3. Transport Table
CREATE TABLE IF NOT EXISTS transport (
    transport_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transport_type ENUM('FLIGHT', 'TRAIN', 'BUS') NOT NULL,
    operator_name VARCHAR(150) NOT NULL,
    service_number VARCHAR(50) NOT NULL,
    transport_details TEXT
);

-- 4. Routes Table
CREATE TABLE IF NOT EXISTS routes (
    route_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_city_id BIGINT NOT NULL,
    destination_city_id BIGINT NOT NULL,
    distance_km DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_route_source_city FOREIGN KEY (source_city_id) REFERENCES cities(city_id) ON DELETE CASCADE,
    CONSTRAINT fk_route_dest_city FOREIGN KEY (destination_city_id) REFERENCES cities(city_id) ON DELETE CASCADE
);

-- 5. Schedules Table
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transport_id BIGINT NOT NULL,
    route_id BIGINT NOT NULL,
    departure_datetime DATETIME NOT NULL,
    arrival_datetime DATETIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    schedule_status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    CONSTRAINT fk_schedule_transport FOREIGN KEY (transport_id) REFERENCES transport(transport_id) ON DELETE CASCADE,
    CONSTRAINT fk_schedule_route FOREIGN KEY (route_id) REFERENCES routes(route_id) ON DELETE CASCADE,
    CONSTRAINT chk_available_seats CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12, 2) NOT NULL,
    booking_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    passenger_count INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. Booking Legs Table
CREATE TABLE IF NOT EXISTS booking_legs (
    booking_leg_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    schedule_id BIGINT NOT NULL,
    leg_order INT NOT NULL,
    price_at_booking DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_booking_leg_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_leg_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE
);

-- 8. Hybrid Journeys Table
CREATE TABLE IF NOT EXISTS hybrid_journeys (
    hybrid_journey_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    source_city_id BIGINT NOT NULL,
    destination_city_id BIGINT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    total_duration_minutes INT NOT NULL,
    transfer_risk VARCHAR(20) NOT NULL DEFAULT 'LOW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hybrid_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_hybrid_source_city FOREIGN KEY (source_city_id) REFERENCES cities(city_id) ON DELETE CASCADE,
    CONSTRAINT fk_hybrid_dest_city FOREIGN KEY (destination_city_id) REFERENCES cities(city_id) ON DELETE CASCADE
);

-- 9. Hybrid Journey Legs Table
CREATE TABLE IF NOT EXISTS hybrid_journey_legs (
    hybrid_leg_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hybrid_journey_id BIGINT NOT NULL,
    schedule_id BIGINT NOT NULL,
    leg_order INT NOT NULL,
    CONSTRAINT fk_hybrid_leg_journey FOREIGN KEY (hybrid_journey_id) REFERENCES hybrid_journeys(hybrid_journey_id) ON DELETE CASCADE,
    CONSTRAINT fk_hybrid_leg_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE
);

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- Indexes for high-speed searches
CREATE INDEX idx_schedules_route ON schedules(route_id);
CREATE INDEX idx_schedules_departure ON schedules(departure_datetime);
CREATE INDEX idx_routes_source_dest ON routes(source_city_id, destination_city_id);
CREATE INDEX idx_transport_type ON transport(transport_type);
CREATE INDEX idx_bookings_user ON bookings(user_id);

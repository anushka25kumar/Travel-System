-- TravelSmart MySQL Setup 

CREATE DATABASE IF NOT EXISTS travelsmart_demo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travelsmart_demo_db;

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

-- Indexes for high-speed searches (created safely if not present)
SELECT COUNT(*) INTO @cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'schedules' AND index_name = 'idx_schedules_route';
SET @sql = IF(@cnt = 0, 'CREATE INDEX idx_schedules_route ON schedules(route_id);', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'schedules' AND index_name = 'idx_schedules_departure';
SET @sql = IF(@cnt = 0, 'CREATE INDEX idx_schedules_departure ON schedules(departure_datetime);', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'routes' AND index_name = 'idx_routes_source_dest';
SET @sql = IF(@cnt = 0, 'CREATE INDEX idx_routes_source_dest ON routes(source_city_id, destination_city_id);', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'transport' AND index_name = 'idx_transport_type';
SET @sql = IF(@cnt = 0, 'CREATE INDEX idx_transport_type ON transport(transport_type);', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @cnt FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'bookings' AND index_name = 'idx_bookings_user';
SET @sql = IF(@cnt = 0, 'CREATE INDEX idx_bookings_user ON bookings(user_id);', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ===================================================================
-- TravelSmart Relational Seed Data Migration (V2)
-- India Multimodal Transportation Network (DEMO Data)
-- ===================================================================

-- 1. Seed Users (passwords BCrypt-hashed: admin123, user123)
INSERT INTO users (user_id, full_name, email, phone, password_hash, role, created_at) VALUES
(1, 'TravelSmart Administrator', 'admin@travelsmart.in', '+919876543210', '$2a$10$wN7K0ZvxK2X7G5qN5pQGqe1F4dZgq0q00qHq3zK8g7j1d2s3t4u5v', 'ROLE_ADMIN', CURRENT_TIMESTAMP),
(2, 'Anushka Kumar', 'user@travelsmart.in', '+919876543211', '$2a$10$wN7K0ZvxK2X7G5qN5pQGqe1F4dZgq0q00qHq3zK8g7j1d2s3t4u5v', 'ROLE_USER', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. Seed 20 Indian Cities
INSERT INTO cities (city_id, city_name, state, country, latitude, longitude) VALUES
(1, 'Pune', 'Maharashtra', 'India', 18.520400, 73.856700),
(2, 'Mumbai', 'Maharashtra', 'India', 19.076000, 72.877700),
(3, 'Delhi', 'Delhi', 'India', 28.613900, 77.209000),
(4, 'Bengaluru', 'Karnataka', 'India', 12.971600, 77.594600),
(5, 'Hyderabad', 'Telangana', 'India', 17.385000, 78.486700),
(6, 'Chennai', 'Tamil Nadu', 'India', 13.082700, 80.270700),
(7, 'Jaipur', 'Rajasthan', 'India', 26.912400, 75.787300),
(8, 'Ahmedabad', 'Gujarat', 'India', 23.022500, 72.571400),
(9, 'Chandigarh', 'Chandigarh', 'India', 30.733300, 76.779400),
(10, 'Lucknow', 'Uttar Pradesh', 'India', 26.846700, 80.946200),
(11, 'Bhopal', 'Madhya Pradesh', 'India', 23.259900, 77.412600),
(12, 'Nagpur', 'Maharashtra', 'India', 21.145800, 79.088200),
(13, 'Goa', 'Goa', 'India', 15.299300, 74.124000),
(14, 'Kolkata', 'West Bengal', 'India', 22.572600, 88.363900),
(15, 'Indore', 'Madhya Pradesh', 'India', 22.719600, 75.857700),
(16, 'Surat', 'Gujarat', 'India', 21.170200, 72.831100),
(17, 'Varanasi', 'Uttar Pradesh', 'India', 25.317600, 82.973900),
(18, 'Kochi', 'Kerala', 'India', 9.931200, 76.267300),
(19, 'Patna', 'Bihar', 'India', 25.594100, 85.137600),
(20, 'Amritsar', 'Punjab', 'India', 31.634000, 74.872300)
ON DUPLICATE KEY UPDATE city_name=VALUES(city_name);

-- 3. Seed 30+ Transports (Flights 1-32, Trains 33-64, Buses 65-96)
-- Flights
INSERT IGNORE INTO transport (transport_id, transport_type, operator_name, service_number, transport_details) VALUES
(1, 'FLIGHT', 'Air India', 'AI-852', 'Airbus A320neo, In-flight meal, 15kg baggage included'),
(2, 'FLIGHT', 'IndiGo', '6E-532', 'Airbus A321neo, Express boarding, USB power at seats'),
(3, 'FLIGHT', 'Akasa Air', 'QP-1120', 'Boeing 737 MAX, High headroom, Café Akasa gourmet snacks'),
(4, 'FLIGHT', 'SpiceJet', 'SG-8194', 'Boeing 737-800, SpiceMax extra legroom seats'),
(5, 'FLIGHT', 'Air India Express', 'IX-142', 'Boeing 737, Hot meals pre-booked, Standard pitch'),
(6, 'FLIGHT', 'IndiGo', '6E-204', 'Airbus A320, On-time performance guarantee'),
(7, 'FLIGHT', 'Air India', 'AI-442', 'Airbus A321neo, Complimentary beverages, In-seat screen'),
(8, 'FLIGHT', 'Akasa Air', 'QP-1351', 'Boeing 737 MAX, Eco-friendly ultra-quiet engines'),
(9, 'FLIGHT', 'IndiGo', '6E-671', 'Airbus A320neo, Direct non-stop service'),
(10, 'FLIGHT', 'Air India', 'AI-512', 'Boeing 787 Dreamliner, Full reclining seats'),
(11, 'FLIGHT', 'SpiceJet', 'SG-261', 'Boeing 737, Regional connectivity priority'),
(12, 'FLIGHT', 'IndiGo', '6E-884', 'Airbus A321neo, Fast check-in priority'),
(13, 'FLIGHT', 'Air India', 'AI-664', 'Airbus A320, Wide-body connection at hub'),
(14, 'FLIGHT', 'Akasa Air', 'QP-1402', 'Boeing 737 MAX, Pet friendly travel available'),
(15, 'FLIGHT', 'IndiGo', '6E-902', 'Airbus A320neo, Express baggage drop'),
(16, 'FLIGHT', 'Air India Express', 'IX-782', 'Boeing 737, Value fares with complimentary water'),
(17, 'FLIGHT', 'SpiceJet', 'SG-105', 'Boeing 737, Morning departure priority'),
(18, 'FLIGHT', 'IndiGo', '6E-315', 'Airbus A320, Popular business corridor'),
(19, 'FLIGHT', 'Air India', 'AI-801', 'Airbus A321neo, Business and economy class'),
(20, 'FLIGHT', 'Akasa Air', 'QP-1721', 'Boeing 737 MAX, Warm hospitality and snacks'),
(21, 'FLIGHT', 'IndiGo', '6E-448', 'Airbus A321neo, Prime evening departure slot'),
(22, 'FLIGHT', 'Air India', 'AI-211', 'Boeing 777-300ER, Flagship wide-body domestic leg'),
(23, 'FLIGHT', 'SpiceJet', 'SG-492', 'Boeing 737, Budget-friendly student allowance'),
(24, 'FLIGHT', 'IndiGo', '6E-755', 'Airbus A320neo, Early bird morning frequency'),
(25, 'FLIGHT', 'Akasa Air', 'QP-1833', 'Boeing 737 MAX, Modern cabin atmosphere'),
(26, 'FLIGHT', 'Air India', 'AI-922', 'Airbus A320neo, Inter-state trunk corridor'),
(27, 'FLIGHT', 'IndiGo', '6E-1011', 'Airbus A321neo, High frequency schedule'),
(28, 'FLIGHT', 'SpiceJet', 'SG-704', 'Boeing 737, Seasonal vacation special'),
(29, 'FLIGHT', 'Air India Express', 'IX-992', 'Boeing 737, Coast-to-capital express'),
(30, 'FLIGHT', 'IndiGo', '6E-1205', 'Airbus A320neo, Night owl discount service');

-- Trains (31-60)
INSERT IGNORE INTO transport (transport_id, transport_type, operator_name, service_number, transport_details) VALUES
(31, 'TRAIN', 'Indian Railways (IRCTC)', 'VB-22226', 'Vande Bharat Express, 160 km/h semi-high speed, GPS info, Executive & Chair Car'),
(32, 'TRAIN', 'Indian Railways (IRCTC)', '12006', 'Kalka New Delhi Shatabdi Express, All AC Chair Car, Meals served at seat'),
(33, 'TRAIN', 'Indian Railways (IRCTC)', '12951', 'Mumbai Tejas Rajdhani Express, Premium sleeper AC, Wi-Fi infotainment, Bedding'),
(34, 'TRAIN', 'Indian Railways (IRCTC)', '22448', 'Amb Andaura New Delhi Vande Bharat, Automated plug doors, Bio-vacuum toilets'),
(35, 'TRAIN', 'Indian Railways (IRCTC)', '12009', 'Mumbai Ahmedabad Shatabdi Express, High-speed corridor priority'),
(36, 'TRAIN', 'Indian Railways (IRCTC)', '20607', 'MGR Chennai Central Mysuru Vande Bharat, Southern rail speed benchmark'),
(37, 'TRAIN', 'Indian Railways (IRCTC)', '12626', 'Kerala Superfast Express, Daily long-haul connecting southern ports'),
(38, 'TRAIN', 'Indian Railways (IRCTC)', '12015', 'New Delhi Daurai (Ajmer) Shatabdi, Heritage state transit via Jaipur'),
(39, 'TRAIN', 'Indian Railways (IRCTC)', '22691', 'KSR Bengaluru Rajdhani Express, Superfast connectivity via Secunderabad'),
(40, 'TRAIN', 'Indian Railways (IRCTC)', '12137', 'Punjab Mail, Historical prestige train via central junction'),
(41, 'TRAIN', 'Indian Railways (IRCTC)', '20901', 'Mumbai Central Gandhinagar Capital Vande Bharat, World-class comfort'),
(42, 'TRAIN', 'Indian Railways (IRCTC)', '12002', 'New Delhi Rani Kamlapati (Bhopal) Shatabdi, India top speed corridor'),
(43, 'TRAIN', 'Indian Railways (IRCTC)', '12224', 'Ernakulam Mumbai LTT AC Duronto Express, Non-stop point-to-point speed'),
(44, 'TRAIN', 'Indian Railways (IRCTC)', '20833', 'Visakhapatnam Secunderabad Vande Bharat, Coastal to Deccan speedway'),
(45, 'TRAIN', 'Indian Railways (IRCTC)', '12301', 'Howrah New Delhi Rajdhani Express, Eastern gateway premier express'),
(46, 'TRAIN', 'Indian Railways (IRCTC)', '12046', 'Chandigarh New Delhi Shatabdi Express, Business executive choice'),
(47, 'TRAIN', 'Indian Railways (IRCTC)', '22436', 'Varanasi New Delhi Vande Bharat Express, India first Vande Bharat rake'),
(48, 'TRAIN', 'Indian Railways (IRCTC)', '12953', 'August Kranti Tejas Rajdhani, Fast overnight corporate transit'),
(49, 'TRAIN', 'Indian Railways (IRCTC)', '12123', 'Deccan Queen Superfast, Pune-Mumbai historical icon with dining car'),
(50, 'TRAIN', 'Indian Railways (IRCTC)', '12985', 'Jaipur Delhi Sarai Rohilla Double Decker Express, High capacity AC seating'),
(51, 'TRAIN', 'Indian Railways (IRCTC)', '12675', 'Kovai Superfast Express, Tamil Nadu commercial lifeline'),
(52, 'TRAIN', 'Indian Railways (IRCTC)', '22221', 'CSMT Mumbai Hazrat Nizamuddin Rajdhani, Via Bhopal and Agra'),
(53, 'TRAIN', 'Indian Railways (IRCTC)', '12011', 'Kalka Shatabdi, Early morning express to national capital'),
(54, 'TRAIN', 'Indian Railways (IRCTC)', '20631', 'Kasaragod Thiruvananthapuram Vande Bharat, Kerala coastal express'),
(55, 'TRAIN', 'Indian Railways (IRCTC)', '12417', 'Prayagraj Express, Punctual superfast link to capital'),
(56, 'TRAIN', 'Indian Railways (IRCTC)', '12028', 'KSR Bengaluru MGR Chennai Central Shatabdi, IT corridor priority'),
(57, 'TRAIN', 'Indian Railways (IRCTC)', '22470', 'Hazrat Nizamuddin Khajuraho Vande Bharat, Heritage and culture tourism line'),
(58, 'TRAIN', 'Indian Railways (IRCTC)', '12111', 'Amravati Mumbai CSMT Superfast, Vidarbha overnight link'),
(59, 'TRAIN', 'Indian Railways (IRCTC)', '12004', 'New Delhi Lucknow Jn Shatabdi Express, Clean express corridor'),
(60, 'TRAIN', 'Indian Railways (IRCTC)', '12267', 'Mumbai Central Hapa Duronto Express, Gujarat industrial corridor');

-- Buses (61-90)
INSERT IGNORE INTO transport (transport_id, transport_type, operator_name, service_number, transport_details) VALUES
(61, 'BUS', 'IntrCity SmartBus', 'IC-701', 'Volvo 9600 Multi-Axle AC Sleeper, Smart lounge access, Clean washroom on board'),
(62, 'BUS', 'Zingbus Electric Coach', 'ZB-202', 'Zero-emission Luxury Electric Coach, Reclining leather seats, Fast charging stops'),
(63, 'BUS', 'MSRTC Shivneri', 'MH-SHIV-01', 'Scania AC Seater, Pune-Mumbai Expressway hourly express, Punctual state service'),
(64, 'BUS', 'VRL Travels', 'VRL-992', 'I-Shift Multi-Axle AC Sleeper, Reading lamp, Personal LED screen, Mineral water'),
(65, 'BUS', 'Neeta Travels', 'NT-450', 'Mercedes-Benz Multi-Axle AC Sleeper, Luxury suspension, Clean blankets'),
(66, 'BUS', 'KSRTC FlyBus', 'KA-FLY-10', 'Direct airport to city center executive coach, Flight schedule sync'),
(67, 'BUS', 'IntrCity SmartBus', 'IC-808', 'Volvo Multi-Axle Sleeper, Live tracking, In-bus washroom, CCTV safety'),
(68, 'BUS', 'Zingbus Electric Coach', 'ZB-404', 'Intercity EV Coach, Quiet ride, Zero noise vibration, Type-C charging ports'),
(69, 'BUS', 'SRS Travels', 'SRS-551', 'Scania Metrolink Multi-Axle AC Sleeper, Professional double drivers'),
(70, 'BUS', 'Kallada Travels', 'KT-210', 'Volvo B11R Multi-Axle, Southern express night transit with blankets'),
(71, 'BUS', 'MSRTC Shivshahi', 'MH-SHIV-44', 'Air-conditioned express coach, Budget inter-district connectivity'),
(72, 'BUS', 'IntrCity SmartBus', 'IC-912', 'Volvo 9600 AC Sleeper, Captain onboard, Clean bed linen, Free Wi-Fi'),
(73, 'BUS', 'Zingbus Electric Coach', 'ZB-610', 'Electric Premium Seater, 100% green travel, Emergency SOS buttons'),
(74, 'BUS', 'Orange Tours and Travels', 'OR-330', 'BharatBenz AC Sleeper, Air suspension, High ground clearance comfort'),
(75, 'BUS', 'Hans Travels', 'HT-770', 'Volvo Multi-Axle AC Sleeper, Central India express network'),
(76, 'BUS', 'IntrCity SmartBus', 'IC-420', 'Multi-Axle Premium Sleeper, Pre-boarding thermal check, Mineral water bottle'),
(77, 'BUS', 'Zingbus Electric Coach', 'ZB-818', 'Green Fleet Express Coach, Reclining 140 degree comfort seats'),
(78, 'BUS', 'KSRTC Airavat Club Class', 'KA-AIR-05', 'Volvo Multi-Axle Luxury Seater, State transport gold standard'),
(79, 'BUS', 'VRL Travels', 'VRL-114', 'I-Shift AC Sleeper, Spacious berths, Punctual overnight arrival guarantee'),
(80, 'BUS', 'Neeta Travels', 'NT-880', 'Volvo AC Seater, Expressway special shuttle every 30 minutes'),
(81, 'BUS', 'IntrCity SmartBus', 'IC-305', 'Volvo 9600 Multi-Axle AC Sleeper, Onboard refreshment kiosk'),
(82, 'BUS', 'Zingbus Electric Coach', 'ZB-999', 'High Speed Electric Coach, Panoramic window view, UV air sanitized'),
(83, 'BUS', 'Prasanna Purple', 'PP-501', 'Multi-Axle Scania AC Seater, Pune city center to airport and express terminals'),
(84, 'BUS', 'Jabbar Travels', 'JT-220', 'Volvo AC Sleeper, Southern trunk link with smooth highway speed'),
(85, 'BUS', 'IntrCity SmartBus', 'IC-615', 'Volvo Multi-Axle Sleeper, Safe solo traveler female priority berths'),
(86, 'BUS', 'Zingbus Electric Coach', 'ZB-112', 'Express Electric Shuttle Coach, Ergonomic headrest support'),
(87, 'BUS', 'KSRTC Ambaari Dream Class', 'KA-AMB-01', 'Volvo 9600 Sleeper, Hotel on wheels luxury experience'),
(88, 'BUS', 'SRS Travels', 'SRS-890', 'Scania AC Sleeper, Direct interstate highway runner'),
(89, 'BUS', 'MSRTC Shivneri', 'MH-SHIV-88', 'Scania AC Seater, Swargate Pune to Dadar Mumbai non-stop'),
(90, 'BUS', 'Zingbus Electric Coach', 'ZB-333', 'Intercity EV sleeper, Silent cabin technology');

-- 4. Seed Routes (Connecting Major Hubs)
INSERT IGNORE INTO routes (route_id, source_city_id, destination_city_id, distance_km) VALUES
-- Direct Routes
(1, 1, 3, 1420.00),  -- Pune -> Delhi
(2, 3, 1, 1420.00),  -- Delhi -> Pune
(3, 1, 2, 150.00),   -- Pune -> Mumbai
(4, 2, 1, 150.00),   -- Mumbai -> Pune
(5, 2, 3, 1400.00),  -- Mumbai -> Delhi
(6, 3, 2, 1400.00),  -- Delhi -> Mumbai
(7, 2, 4, 980.00),   -- Mumbai -> Bengaluru
(8, 4, 2, 980.00),   -- Bengaluru -> Mumbai
(9, 3, 7, 280.00),   -- Delhi -> Jaipur
(10, 7, 3, 280.00),  -- Jaipur -> Delhi
(11, 9, 3, 250.00),  -- Chandigarh -> Delhi
(12, 3, 9, 250.00),  -- Delhi -> Chandigarh
(13, 2, 13, 580.00), -- Mumbai -> Goa
(14, 13, 2, 580.00), -- Goa -> Mumbai
(15, 2, 7, 1150.00), -- Mumbai -> Jaipur
(16, 7, 2, 1150.00), -- Jaipur -> Mumbai
(17, 4, 5, 570.00),  -- Bengaluru -> Hyderabad
(18, 5, 4, 570.00),  -- Hyderabad -> Bengaluru
(19, 6, 4, 350.00),  -- Chennai -> Bengaluru
(20, 4, 6, 350.00),  -- Bengaluru -> Chennai
(21, 8, 2, 520.00),  -- Ahmedabad -> Mumbai
(22, 2, 8, 520.00),  -- Mumbai -> Ahmedabad
(23, 3, 10, 550.00), -- Delhi -> Lucknow
(24, 10, 3, 550.00), -- Lucknow -> Delhi
(25, 3, 20, 450.00), -- Delhi -> Amritsar
(26, 20, 3, 450.00), -- Amritsar -> Delhi
(27, 14, 17, 680.00),-- Kolkata -> Varanasi
(28, 17, 14, 680.00),-- Varanasi -> Kolkata
(29, 18, 4, 540.00), -- Kochi -> Bengaluru
(30, 4, 18, 540.00); -- Bengaluru -> Kochi

-- 5. Seed Schedules (Direct Flights, Trains, Buses across India)
-- Notice: Schedules span current and rolling dates, with standard recurring slots:
-- Pune -> Delhi (Route 1)
INSERT INTO schedules (schedule_id, transport_id, route_id, departure_datetime, arrival_datetime, total_seats, available_seats, base_price, schedule_status) VALUES
(1, 1, 1, '2026-10-25 06:15:00', '2026-10-25 08:30:00', 180, 42, 5980.00, 'SCHEDULED'),  -- Flight Air India
(2, 2, 1, '2026-10-25 14:20:00', '2026-10-25 16:35:00', 186, 28, 6420.00, 'SCHEDULED'),  -- Flight IndiGo
(3, 3, 1, '2026-10-25 19:40:00', '2026-10-25 21:55:00', 189, 56, 4890.00, 'SCHEDULED'),  -- Flight Akasa Air
(4, 31, 1, '2026-10-25 05:45:00', '2026-10-25 21:30:00', 500, 85, 2850.00, 'SCHEDULED'), -- Train Vande Bharat
(5, 52, 1, '2026-10-25 17:15:00', '2026-10-26 10:20:00', 450, 60, 2450.00, 'SCHEDULED'), -- Train Rajdhani Superfast
(6, 61, 1, '2026-10-25 16:00:00', '2026-10-26 18:30:00', 36, 14, 1850.00, 'SCHEDULED'),  -- Bus IntrCity SmartBus

-- Pune -> Mumbai (Route 3)
(7, 31, 3, '2026-10-25 05:45:00', '2026-10-25 08:50:00', 500, 120, 560.00, 'SCHEDULED'), -- Train Vande Bharat
(8, 49, 3, '2026-10-25 07:15:00', '2026-10-25 10:30:00', 600, 150, 380.00, 'SCHEDULED'), -- Train Deccan Queen
(9, 63, 3, '2026-10-25 06:00:00', '2026-10-25 09:30:00', 45, 20, 510.00, 'SCHEDULED'),   -- Bus MSRTC Shivneri
(10, 65, 3, '2026-10-25 08:30:00', '2026-10-25 12:00:00', 40, 18, 480.00, 'SCHEDULED'),  -- Bus Neeta Travels

-- Mumbai -> Jaipur (Route 15 - connecting leg for flagship hybrid journey!)
(11, 3, 15, '2026-10-25 10:30:00', '2026-10-25 12:15:00', 189, 45, 3200.00, 'SCHEDULED'), -- Flight Akasa Air
(12, 1, 15, '2026-10-25 13:45:00', '2026-10-25 15:35:00', 180, 32, 3850.00, 'SCHEDULED'), -- Flight Air India
(13, 33, 15, '2026-10-25 17:00:00', '2026-10-26 09:15:00', 400, 75, 1680.00, 'SCHEDULED'),-- Train Tejas Express

-- Jaipur -> Delhi (Route 10 - connecting leg for flagship hybrid journey!)
(14, 38, 10, '2026-10-25 14:00:00', '2026-10-25 18:20:00', 450, 95, 800.00, 'SCHEDULED'), -- Train Shatabdi Express
(15, 50, 10, '2026-10-25 15:30:00', '2026-10-25 20:00:00', 550, 110, 550.00, 'SCHEDULED'),-- Train Double Decker
(16, 62, 10, '2026-10-25 14:30:00', '2026-10-25 19:30:00', 40, 22, 550.00, 'SCHEDULED'),  -- Bus Zingbus Electric Coach

-- Chandigarh -> Delhi (Route 11 - fixes "No Journeys Found" bug!)
(17, 2, 11, '2026-10-25 06:15:00', '2026-10-25 08:30:00', 186, 32, 5450.00, 'SCHEDULED'), -- Flight IndiGo
(18, 1, 11, '2026-10-25 11:30:00', '2026-10-25 13:45:00', 180, 25, 5980.00, 'SCHEDULED'), -- Flight Air India
(19, 3, 11, '2026-10-25 17:15:00', '2026-10-25 19:30:00', 189, 40, 4890.00, 'SCHEDULED'), -- Flight Akasa Air
(20, 34, 11, '2026-10-25 07:45:00', '2026-10-25 11:00:00', 500, 90, 1145.00, 'SCHEDULED'),-- Train Vande Bharat (22448)
(21, 32, 11, '2026-10-25 06:50:00', '2026-10-25 10:15:00', 450, 70, 980.00, 'SCHEDULED'), -- Train Shatabdi (12006)
(22, 61, 11, '2026-10-25 07:30:00', '2026-10-25 12:30:00', 36, 16, 620.00, 'SCHEDULED'),  -- Bus IntrCity SmartBus
(23, 62, 11, '2026-10-25 08:00:00', '2026-10-25 13:00:00', 40, 24, 550.00, 'SCHEDULED'),  -- Bus Zingbus Electric

-- Mumbai -> Delhi (Route 5)
(24, 1, 5, '2026-10-25 06:00:00', '2026-10-25 08:10:00', 180, 55, 4850.00, 'SCHEDULED'),  -- Flight Air India
(25, 2, 5, '2026-10-25 09:30:00', '2026-10-25 11:45:00', 186, 38, 5200.00, 'SCHEDULED'),  -- Flight IndiGo
(26, 33, 5, '2026-10-25 17:00:00', '2026-10-26 08:35:00', 450, 80, 2850.00, 'SCHEDULED'), -- Train Tejas Rajdhani
(27, 61, 5, '2026-10-25 15:00:00', '2026-10-26 17:30:00', 36, 12, 1950.00, 'SCHEDULED'),  -- Bus IntrCity SmartBus

-- Mumbai -> Bengaluru (Route 7)
(28, 2, 7, '2026-10-25 07:00:00', '2026-10-25 08:45:00', 186, 60, 4450.00, 'SCHEDULED'),  -- Flight IndiGo
(29, 3, 7, '2026-10-25 18:30:00', '2026-10-25 20:15:00', 189, 44, 3850.00, 'SCHEDULED'),  -- Flight Akasa Air
(30, 39, 7, '2026-10-25 20:00:00', '2026-10-26 14:30:00', 500, 95, 1250.00, 'SCHEDULED'), -- Train Udyan Express
(31, 64, 7, '2026-10-25 16:30:00', '2026-10-26 08:30:00', 36, 15, 1650.00, 'SCHEDULED'),  -- Bus VRL Travels

-- Delhi -> Jaipur (Route 9)
(32, 1, 9, '2026-10-25 08:00:00', '2026-10-25 08:55:00', 180, 45, 2850.00, 'SCHEDULED'),  -- Flight Air India
(33, 38, 9, '2026-10-25 06:10:00', '2026-10-25 10:40:00', 450, 85, 890.00, 'SCHEDULED'),  -- Train Vande Bharat / Shatabdi
(34, 62, 9, '2026-10-25 07:00:00', '2026-10-25 12:00:00', 40, 25, 550.00, 'SCHEDULED'),   -- Bus Zingbus Electric Coach

-- Mumbai -> Goa (Route 13)
(35, 2, 13, '2026-10-25 09:15:00', '2026-10-25 10:30:00', 186, 50, 3850.00, 'SCHEDULED'), -- Flight IndiGo
(36, 31, 13, '2026-10-25 05:25:00', '2026-10-25 13:10:00', 500, 75, 1650.00, 'SCHEDULED'),-- Train Vande Bharat
(37, 61, 13, '2026-10-25 19:00:00', '2026-10-26 07:30:00', 36, 18, 1450.00, 'SCHEDULED'), -- Bus IntrCity SmartBus

-- Additional National Connectivity Schedules
(38, 3, 17, '2026-10-25 10:00:00', '2026-10-25 11:15:00', 189, 65, 3200.00, 'SCHEDULED'), -- Bengaluru -> Hyderabad Flight
(39, 36, 17, '2026-10-25 05:45:00', '2026-10-25 14:15:00', 500, 80, 1420.00, 'SCHEDULED'),-- Bengaluru -> Hyderabad Vande Bharat
(40, 66, 17, '2026-10-25 21:00:00', '2026-10-26 06:30:00', 40, 15, 950.00, 'SCHEDULED'),  -- Bengaluru -> Hyderabad Bus
(41, 2, 23, '2026-10-25 08:30:00', '2026-10-25 09:40:00', 186, 42, 3450.00, 'SCHEDULED'), -- Delhi -> Lucknow Flight
(42, 59, 23, '2026-10-25 06:10:00', '2026-10-25 12:45:00', 450, 90, 1165.00, 'SCHEDULED'),-- Delhi -> Lucknow Shatabdi
(43, 61, 23, '2026-10-25 22:00:00', '2026-10-26 06:00:00', 36, 16, 750.00, 'SCHEDULED'),  -- Delhi -> Lucknow Bus
(44, 1, 25, '2026-10-25 07:15:00', '2026-10-25 08:25:00', 180, 35, 4100.00, 'SCHEDULED'), -- Delhi -> Amritsar Flight
(45, 32, 25, '2026-10-25 07:20:00', '2026-10-25 13:30:00', 500, 85, 1280.00, 'SCHEDULED'),-- Delhi -> Amritsar Shatabdi
(46, 2, 27, '2026-10-25 12:00:00', '2026-10-25 13:25:00', 186, 48, 4850.00, 'SCHEDULED'), -- Kolkata -> Varanasi Flight
(47, 47, 27, '2026-10-25 06:00:00', '2026-10-25 14:15:00', 500, 70, 1680.00, 'SCHEDULED'),-- Kolkata -> Varanasi Vande Bharat
(48, 1, 29, '2026-10-25 09:30:00', '2026-10-25 10:35:00', 180, 52, 3650.00, 'SCHEDULED'), -- Kochi -> Bengaluru Flight
(49, 37, 29, '2026-10-25 20:30:00', '2026-10-26 07:15:00', 500, 110, 1150.00, 'SCHEDULED'),-- Kochi -> Bengaluru Rail
(50, 70, 29, '2026-10-25 21:00:00', '2026-10-26 06:45:00', 36, 14, 850.00, 'SCHEDULED')   -- Kochi -> Bengaluru Kallada Bus
ON DUPLICATE KEY UPDATE base_price=VALUES(base_price), available_seats=VALUES(available_seats);

-- 6. Pre-seed 10 Authentic Hybrid Routes in MySQL
INSERT INTO hybrid_journeys (hybrid_journey_id, user_id, source_city_id, destination_city_id, total_price, total_duration_minutes, transfer_risk, created_at) VALUES
(1, 2, 1, 3, 4650.00, 655, 'LOW', CURRENT_TIMESTAMP), -- Pune -> Mumbai -> Jaipur -> Delhi
(2, 2, 1, 3, 5410.00, 365, 'LOW', CURRENT_TIMESTAMP), -- Pune -> Mumbai (Train) + Mumbai -> Delhi (Flight)
(3, 2, 1, 4, 4960.00, 420, 'LOW', CURRENT_TIMESTAMP), -- Pune -> Mumbai (Bus) + Mumbai -> Bengaluru (Flight)
(4, 2, 3, 13, 5300.00, 480, 'MEDIUM', CURRENT_TIMESTAMP), -- Delhi -> Mumbai (Flight) + Mumbai -> Goa (Train)
(5, 2, 9, 7, 1945.00, 390, 'LOW', CURRENT_TIMESTAMP), -- Chandigarh -> Delhi (Train) + Delhi -> Jaipur (Train)
(6, 2, 1, 7, 3710.00, 450, 'LOW', CURRENT_TIMESTAMP), -- Pune -> Mumbai (Bus) + Mumbai -> Jaipur (Flight)
(7, 2, 2, 20, 5830.00, 430, 'LOW', CURRENT_TIMESTAMP), -- Mumbai -> Delhi (Flight) + Delhi -> Amritsar (Train)
(8, 2, 4, 10, 5350.00, 490, 'MEDIUM', CURRENT_TIMESTAMP), -- Bengaluru -> Delhi (Flight) + Delhi -> Lucknow (Train)
(9, 2, 6, 5, 2370.00, 380, 'LOW', CURRENT_TIMESTAMP), -- Chennai -> Bengaluru (Train) + Bengaluru -> Hyderabad (Train)
(10, 2, 1, 13, 2210.00, 540, 'LOW', CURRENT_TIMESTAMP) -- Pune -> Mumbai (Train) + Mumbai -> Goa (Bus)
ON DUPLICATE KEY UPDATE total_price=VALUES(total_price);

-- Seed Hybrid Journey Legs for Journey #1 (Pune -> Mumbai [Bus] -> Jaipur [Flight] -> Delhi [Train])
INSERT INTO hybrid_journey_legs (hybrid_leg_id, hybrid_journey_id, schedule_id, leg_order) VALUES
(1, 1, 9, 1),   -- Leg 1: Pune -> Mumbai via Shivneri Bus (Schedule 9, ₹510)
(2, 1, 11, 2),  -- Leg 2: Mumbai -> Jaipur via Akasa Air Flight (Schedule 11, ₹3200)
(3, 1, 14, 3)   -- Leg 3: Jaipur -> Delhi via Shatabdi Express Train (Schedule 14, ₹800)
ON DUPLICATE KEY UPDATE leg_order=VALUES(leg_order);

-- Seed Sample Booking for Anushka Kumar
INSERT INTO bookings (booking_id, user_id, booking_date, total_amount, booking_status, passenger_count) VALUES
(1, 2, CURRENT_TIMESTAMP, 4650.00, 'CONFIRMED', 1)
ON DUPLICATE KEY UPDATE total_amount=VALUES(total_amount);

INSERT INTO booking_legs (booking_leg_id, booking_id, schedule_id, leg_order, price_at_booking) VALUES
(1, 1, 9, 1, 510.00),
(2, 1, 11, 2, 3200.00),
(3, 1, 14, 3, 800.00)
ON DUPLICATE KEY UPDATE price_at_booking=VALUES(price_at_booking);

INSERT INTO payments (payment_id, booking_id, amount, payment_method, payment_status, transaction_reference) VALUES
(1, 1, 4650.00, 'UPI / NetBanking', 'COMPLETED', 'TXN-TS-IN-889921')
ON DUPLICATE KEY UPDATE amount=VALUES(amount);


SELECT
    s.schedule_id,
    t.operator_name,
    t.service_number,
    s.base_price,
    s.available_seats
FROM schedules s
JOIN transport t
ON s.transport_id = t.transport_id
WHERE t.service_number = 'AI-852'
AND DATE(s.departure_datetime) = '2026-10-25';


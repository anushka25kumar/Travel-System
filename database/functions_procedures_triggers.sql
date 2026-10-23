-- =====================================================================
-- TravelSmart – Integrated Transportation Management System
-- MySQL Functions, Stored Procedures, and Triggers
-- Target Database: travelsmart_demo_db
-- =====================================================================

USE travelsmart_demo_db;

-- ---------------------------------------------------------------------
-- 1. AUDIT TABLE: schedule_audit
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_audit (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    schedule_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    old_value VARCHAR(255) NULL,
    new_value VARCHAR(255) NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
-- 2. FUNCTIONS
-- ---------------------------------------------------------------------

-- Function 1: fn_total_ticket_price
-- Purpose: Calculate total ticket price based on base price and passenger count.
-- Attributes: DETERMINISTIC, NO SQL
DROP FUNCTION IF EXISTS fn_total_ticket_price;
DELIMITER $$
CREATE FUNCTION fn_total_ticket_price(
    ticket_price DECIMAL(10,2),
    passengers INT
) RETURNS DECIMAL(12,2)
DETERMINISTIC
NO SQL
BEGIN
    IF ticket_price IS NULL OR passengers IS NULL OR passengers < 1 THEN
        RETURN 0.00;
    END IF;
    RETURN ticket_price * passengers;
END$$
DELIMITER ;

-- Function 2: fn_available_seats
-- Purpose: Retrieve available seats for a given transport schedule.
-- Attributes: READS SQL DATA
DROP FUNCTION IF EXISTS fn_available_seats;
DELIMITER $$
CREATE FUNCTION fn_available_seats(
    p_schedule_id BIGINT
) RETURNS INT
READS SQL DATA
BEGIN
    DECLARE v_seats INT DEFAULT 0;
    SELECT available_seats INTO v_seats
    FROM schedules
    WHERE schedule_id = p_schedule_id;
    RETURN IFNULL(v_seats, 0);
END$$
DELIMITER ;


-- ---------------------------------------------------------------------
-- 3. STORED PROCEDURES
-- ---------------------------------------------------------------------

-- Procedure 1: sp_show_all_transport
-- Purpose: Display all transport carriers with id, type, operator, and service number.
-- Attributes: READS SQL DATA
DROP PROCEDURE IF EXISTS sp_show_all_transport;
DELIMITER $$
CREATE PROCEDURE sp_show_all_transport()
READS SQL DATA
BEGIN
    SELECT
        transport_id,
        transport_type,
        operator_name,
        service_number
    FROM transport
    ORDER BY transport_type, operator_name, service_number;
END$$
DELIMITER ;

-- Procedure 2: sp_available_schedules
-- Purpose: Display all scheduled services that currently have seats available.
-- Attributes: READS SQL DATA
DROP PROCEDURE IF EXISTS sp_available_schedules;
DELIMITER $$
CREATE PROCEDURE sp_available_schedules()
READS SQL DATA
BEGIN
    SELECT
        s.schedule_id,
        t.transport_type,
        t.operator_name,
        t.service_number,
        s.departure_datetime,
        s.arrival_datetime,
        s.base_price AS ticket_price,
        s.available_seats
    FROM schedules s
    JOIN transport t ON s.transport_id = t.transport_id
    WHERE s.available_seats > 0
      AND s.schedule_status = 'SCHEDULED'
    ORDER BY s.departure_datetime;
END$$
DELIMITER ;

-- Procedure 3: sp_transport_by_type
-- Purpose: Display schedules filtered by transport type (FLIGHT, TRAIN, BUS).
-- Attributes: READS SQL DATA
DROP PROCEDURE IF EXISTS sp_transport_by_type;
DELIMITER $$
CREATE PROCEDURE sp_transport_by_type(
    IN p_transport_type VARCHAR(20)
)
READS SQL DATA
BEGIN
    SELECT
        s.schedule_id,
        t.transport_type,
        t.operator_name,
        t.service_number,
        s.departure_datetime,
        s.arrival_datetime,
        s.base_price AS ticket_price,
        s.available_seats
    FROM schedules s
    JOIN transport t ON s.transport_id = t.transport_id
    WHERE t.transport_type = UPPER(TRIM(p_transport_type))
      AND s.available_seats > 0
    ORDER BY s.departure_datetime;
END$$
DELIMITER ;


-- ---------------------------------------------------------------------
-- 4. TRIGGERS
-- ---------------------------------------------------------------------

-- Trigger 1: trg_price_update
-- Purpose: Automatically audit ticket base price updates on schedules table.
-- Timing: AFTER UPDATE ON schedules
DROP TRIGGER IF EXISTS trg_price_update;
DELIMITER $$
CREATE TRIGGER trg_price_update
AFTER UPDATE ON schedules
FOR EACH ROW
BEGIN
    IF NOT (OLD.base_price <=> NEW.base_price) THEN
        INSERT INTO schedule_audit (
            schedule_id,
            action_type,
            old_value,
            new_value,
            changed_at
        )
        VALUES (
            NEW.schedule_id,
            'PRICE_UPDATED',
            CAST(OLD.base_price AS CHAR),
            CAST(NEW.base_price AS CHAR),
            NOW()
        );
    END IF;
END$$
DELIMITER ;

-- Trigger 2: trg_seat_update
-- Purpose: Automatically audit available seat updates on schedules table.
-- Timing: AFTER UPDATE ON schedules
DROP TRIGGER IF EXISTS trg_seat_update;
DELIMITER $$
CREATE TRIGGER trg_seat_update
AFTER UPDATE ON schedules
FOR EACH ROW
BEGIN
    IF NOT (OLD.available_seats <=> NEW.available_seats) THEN
        INSERT INTO schedule_audit (
            schedule_id,
            action_type,
            old_value,
            new_value,
            changed_at
        )
        VALUES (
            NEW.schedule_id,
            'SEATS_UPDATED',
            CAST(OLD.available_seats AS CHAR),
            CAST(NEW.available_seats AS CHAR),
            NOW()
        );
    END IF;
END$$
DELIMITER ;

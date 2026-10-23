-- =====================================================================
-- TRAVELSMART — MULTIMODAL TRANSPORTATION MANAGEMENT SYSTEM
-- DBMS DEMONSTRATION SCRIPT & VIVA VOCE REFERENCE GUIDE
-- Target Database: travelsmart_demo_db (MySQL 8+)
-- =====================================================================

USE travelsmart_demo_db;

-- =====================================================================
-- SECTION 1: VERIFY INSTALLED DATABASE OBJECTS
-- Use these commands during project evaluation to show the examiner that
-- all objects are registered in MySQL's data dictionary.
-- =====================================================================

-- 1.1 List all custom stored functions in travelsmart_demo_db
SELECT 
    ROUTINE_NAME AS Function_Name, 
    DEFINER, 
    IS_DETERMINISTIC, 
    SQL_DATA_ACCESS, 
    CREATED 
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'travelsmart_demo_db' 
  AND ROUTINE_TYPE = 'FUNCTION'
ORDER BY ROUTINE_NAME;

-- 1.2 List all custom stored procedures in travelsmart_demo_db
SELECT 
    ROUTINE_NAME AS Procedure_Name, 
    DEFINER, 
    SQL_DATA_ACCESS, 
    CREATED 
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'travelsmart_demo_db' 
  AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

-- 1.3 List all active triggers on the schedules table
SELECT 
    TRIGGER_NAME, 
    EVENT_MANIPULATION AS Event, 
    EVENT_OBJECT_TABLE AS On_Table, 
    ACTION_TIMING AS Timing, 
    CREATED 
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'travelsmart_demo_db';

-- 1.4 Inspect definition of functions and procedures
SHOW CREATE FUNCTION fn_total_ticket_price;
SHOW CREATE FUNCTION fn_available_seats;
SHOW CREATE PROCEDURE sp_show_all_transport;
SHOW CREATE PROCEDURE sp_available_schedules;
SHOW CREATE PROCEDURE sp_transport_by_type;


-- =====================================================================
-- SECTION 2: DEMONSTRATING STORED FUNCTIONS
-- =====================================================================

-- 2.1 Demo: fn_total_ticket_price(ticket_price, passengers)
-- Function Type: DETERMINISTIC, NO SQL
-- Description: Computes (base_price * passenger_count) directly on the DB server.
SELECT 
    'Demo fn_total_ticket_price' AS Test_Description,
    fn_total_ticket_price(5980.00, 2) AS Total_For_2_Passengers,
    fn_total_ticket_price(1850.00, 4) AS Total_For_4_Passengers,
    fn_total_ticket_price(750.00, 0)  AS EdgeCase_Zero_Passengers;

-- 2.2 Demo: Using fn_total_ticket_price in a SELECT query with existing schedules
SELECT 
    s.schedule_id,
    t.operator_name,
    t.service_number,
    s.base_price,
    fn_total_ticket_price(s.base_price, 2) AS price_for_2_passengers,
    fn_total_ticket_price(s.base_price, 3) AS price_for_3_passengers
FROM schedules s
JOIN transport t ON s.transport_id = t.transport_id
LIMIT 5;

-- 2.3 Demo: fn_available_seats(schedule_id)
-- Function Type: NOT DETERMINISTIC, READS SQL DATA
-- Description: Queries schedules table to return current seat inventory.
SELECT 
    'Demo fn_available_seats' AS Test_Description,
    fn_available_seats(1) AS Available_Seats_Schedule_1,
    fn_available_seats(2) AS Available_Seats_Schedule_2,
    fn_available_seats(3) AS Available_Seats_Schedule_3;


-- =====================================================================
-- SECTION 3: DEMONSTRATING STORED PROCEDURES
-- =====================================================================

-- 3.1 Demo: sp_show_all_transport()
-- Description: Returns full catalog of transport carriers (flights, trains, buses)
-- Columns: transport_id, transport_type, operator_name, service_number
CALL sp_show_all_transport();

-- 3.2 Demo: sp_available_schedules()
-- Description: Returns all scheduled departures that have available_seats > 0
-- Joined with transport operator and sorted by departure time.
CALL sp_available_schedules();

-- 3.3 Demo: sp_transport_by_type(transport_type)
-- Description: Parameterized procedure filtering schedules by transport mode.
-- Try 'FLIGHT':
CALL sp_transport_by_type('FLIGHT');

-- Try 'TRAIN':
CALL sp_transport_by_type('TRAIN');

-- Try 'BUS':
CALL sp_transport_by_type('BUS');


-- =====================================================================
-- SECTION 4: SAFE LIVE TRIGGER & AUDIT DEMONSTRATION
-- NOTE: Uses a transaction with ROLLBACK so you can show the examiner
-- the triggers firing and populating schedule_audit without altering
-- your live database records!
-- =====================================================================

-- 4.1 Check initial record state before trigger test
SELECT schedule_id, base_price, available_seats 
FROM schedules 
WHERE schedule_id = 1;

-- 4.2 Start controlled transaction
START TRANSACTION;

-- Test Trigger 1 (trg_price_update): Update base price
UPDATE schedules 
SET base_price = 7200.00 
WHERE schedule_id = 1;

-- Test Trigger 2 (trg_seat_update): Book 2 seats
UPDATE schedules 
SET available_seats = available_seats - 2 
WHERE schedule_id = 1;

-- 4.3 Inspect the audit table!
-- You will see 2 new audit entries created automatically by the MySQL triggers:
-- 1. PRICE_UPDATED (old_value = 8999.00, new_value = 7200.00)
-- 2. SEATS_UPDATED (old_value = 12, new_value = 10)
SELECT 
    audit_id,
    schedule_id,
    action_type,
    old_value,
    new_value,
    changed_at
FROM schedule_audit
ORDER BY audit_id DESC
LIMIT 5;

-- 4.4 Rollback the transaction to keep the demo clean and preserve live data
ROLLBACK;

-- 4.5 Verify rollback restored original state
SELECT schedule_id, base_price, available_seats 
FROM schedules 
WHERE schedule_id = 1;


-- =====================================================================
-- SECTION 5: DBMS VIVA VOCE QUESTIONS & ANSWERS
-- Keep these answers in mind when defending your project!
-- =====================================================================
/*
Q1: What is the difference between a Stored Procedure and a Stored Function?
-------------------------------------------------------------------------
Answer:
1. Return Value: A Stored Function MUST return a single value via the RETURN statement. 
   A Stored Procedure can return zero, one, or multiple result sets (tables), or return 
   values via OUT / INOUT parameters.
2. Invocation: A Function can be called directly inside SQL statements (e.g., SELECT fn(...), 
   WHERE fn(...) > 10). A Procedure must be invoked using the CALL keyword (e.g., CALL sp_...).
3. Purpose: Functions are typically used for computations and utility transformations. 
   Procedures are used for business workflows, reporting, and executing batch logic.

Q2: What is the significance of DETERMINISTIC and NO SQL in fn_total_ticket_price?
---------------------------------------------------------------------------------
Answer:
- DETERMINISTIC: Informs the MySQL query optimizer that the function will always produce 
  the exact same output given the exact same input parameters. This allows MySQL to optimize 
  and cache function results.
- NO SQL: Indicates that the function body contains no SQL queries or table access; 
  it executes pure arithmetic logic in memory, guaranteeing high performance.

Q3: Why is fn_available_seats marked as READS SQL DATA?
-------------------------------------------------------
Answer:
It executes a SELECT query against the `schedules` table to look up current seat inventory. 
Specifying READS SQL DATA tells MySQL's optimizer and binary logging subsystem that the 
function performs read-only database reads without modifying state.

Q4: What is a Database Trigger and why use an AFTER UPDATE trigger?
-----------------------------------------------------------------
Answer:
A Trigger is a special procedural code block automatically executed by the DBMS in response 
to a specified event (INSERT, UPDATE, DELETE) on a particular table.
We chose AFTER UPDATE for `trg_price_update` and `trg_seat_update` because:
1. Audit logging must only record changes that actually succeeded in modifying the table.
2. In AFTER UPDATE, both the OLD (pre-update) and NEW (post-update) row states are accessible.

Q5: What is the role of the NULL-safe equality operator (<=>) in our triggers?
----------------------------------------------------------------------------
Answer:
We use `IF NOT (OLD.base_price <=> NEW.base_price) THEN`.
In SQL, comparing with NULL using standard `=` returns UNKNOWN (neither TRUE nor FALSE).
The `<=>` operator safely handles comparisons even when values could be NULL, ensuring 
the trigger reliably detects changes without false alarms or exceptions.

Q6: How do these database objects support the TravelSmart application architecture?
----------------------------------------------------------------------------------
Answer:
They enforce the "MySQL as Single Source of Truth" architectural principle:
1. Business and audit rules (e.g., tracking price changes and seat inventory changes) 
   occur atomically inside the database, so no external service or app can bypass auditing.
2. Stored procedures pre-compile query execution plans, providing consistent performance 
   for common queries like available schedules and transport catalog listings.
*/

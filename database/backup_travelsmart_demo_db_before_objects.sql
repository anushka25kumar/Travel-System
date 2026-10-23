-- MySQL dump 10.13  Distrib 9.7.1, for macos26.4 (arm64)
--
-- Host: localhost    Database: travelsmart_demo_db
-- ------------------------------------------------------
-- Server version	26.10.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking_legs`
--

DROP TABLE IF EXISTS `booking_legs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_legs` (
  `booking_leg_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `schedule_id` bigint NOT NULL,
  `leg_order` int NOT NULL,
  `price_at_booking` decimal(12,2) NOT NULL,
  PRIMARY KEY (`booking_leg_id`),
  KEY `fk_booking_leg_booking` (`booking_id`),
  KEY `fk_booking_leg_schedule` (`schedule_id`),
  CONSTRAINT `fk_booking_leg_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_leg_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_legs`
--

LOCK TABLES `booking_legs` WRITE;
/*!40000 ALTER TABLE `booking_legs` DISABLE KEYS */;
INSERT INTO `booking_legs` VALUES (1,1,9,1,510.00),(2,1,11,2,3200.00),(3,1,14,3,800.00),(4,2,4,1,5700.00),(5,3,2,1,6420.00),(6,4,3,1,4890.00),(7,5,5,1,2450.00),(8,6,5,1,2450.00),(9,7,6,1,1850.00),(10,8,1,1,8999.00),(11,9,1,1,8999.00),(12,10,2,1,6420.00),(13,11,1,1,8999.00),(14,12,33,1,890.00),(15,13,1,1,8999.00),(16,14,3,1,4890.00);
/*!40000 ALTER TABLE `booking_legs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `booking_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(12,2) NOT NULL,
  `booking_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONFIRMED',
  `passenger_count` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`booking_id`),
  KEY `idx_bookings_user` (`user_id`),
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,2,'2026-10-20 17:23:33',4650.00,'CONFIRMED',1),(2,2,'2026-10-20 17:38:33',5700.00,'CANCELLED',2),(3,2,'2026-10-20 18:01:30',6420.00,'CONFIRMED',1),(4,2,'2026-10-20 18:04:55',4890.00,'CONFIRMED',1),(5,2,'2026-10-20 18:05:43',2450.00,'CONFIRMED',1),(6,2,'2026-10-20 18:06:24',36750.00,'CONFIRMED',1),(7,2,'2026-10-20 18:06:53',1850.00,'CONFIRMED',1),(8,2,'2026-10-20 18:20:34',5980.00,'CONFIRMED',1),(9,2,'2026-10-20 18:57:57',8999.00,'CANCELLED',1),(10,2,'2026-10-20 19:00:33',6420.00,'CONFIRMED',1),(11,3,'2026-10-20 19:05:43',8999.00,'CONFIRMED',1),(12,3,'2026-10-20 19:12:00',890.00,'CONFIRMED',1),(13,3,'2026-10-21 01:39:07',8999.00,'CONFIRMED',1),(14,2,'2026-10-21 02:11:49',4890.00,'CANCELLED',1);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `city_id` bigint NOT NULL AUTO_INCREMENT,
  `city_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'India',
  `latitude` decimal(10,6) NOT NULL,
  `longitude` decimal(10,6) NOT NULL,
  PRIMARY KEY (`city_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Pune','Maharashtra','India',18.520400,73.856700),(2,'Mumbai','Maharashtra','India',19.076000,72.877700),(3,'Delhi','Delhi','India',28.613900,77.209000),(4,'Bengaluru','Karnataka','India',12.971600,77.594600),(5,'Hyderabad','Telangana','India',17.385000,78.486700),(6,'Chennai','Tamil Nadu','India',13.082700,80.270700),(7,'Jaipur','Rajasthan','India',26.912400,75.787300),(8,'Ahmedabad','Gujarat','India',23.022500,72.571400),(9,'Chandigarh','Chandigarh','India',30.733300,76.779400),(10,'Lucknow','Uttar Pradesh','India',26.846700,80.946200),(11,'Bhopal','Madhya Pradesh','India',23.259900,77.412600),(12,'Nagpur','Maharashtra','India',21.145800,79.088200),(13,'Goa','Goa','India',15.299300,74.124000),(14,'Kolkata','West Bengal','India',22.572600,88.363900),(15,'Indore','Madhya Pradesh','India',22.719600,75.857700),(16,'Surat','Gujarat','India',21.170200,72.831100),(17,'Varanasi','Uttar Pradesh','India',25.317600,82.973900),(18,'Kochi','Kerala','India',9.931200,76.267300),(19,'Patna','Bihar','India',25.594100,85.137600),(20,'Amritsar','Punjab','India',31.634000,74.872300);
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flyway_schema_history`
--

DROP TABLE IF EXISTS `flyway_schema_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flyway_schema_history` (
  `installed_rank` int NOT NULL,
  `version` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `script` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` int DEFAULT NULL,
  `installed_by` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `execution_time` int NOT NULL,
  `success` tinyint(1) NOT NULL,
  PRIMARY KEY (`installed_rank`),
  KEY `flyway_schema_history_s_idx` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flyway_schema_history`
--

LOCK TABLES `flyway_schema_history` WRITE;
/*!40000 ALTER TABLE `flyway_schema_history` DISABLE KEYS */;
INSERT INTO `flyway_schema_history` VALUES (1,'2','<< Flyway Baseline >>','BASELINE','<< Flyway Baseline >>',NULL,'root','2026-10-20 17:34:31',0,1);
/*!40000 ALTER TABLE `flyway_schema_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hybrid_journey_legs`
--

DROP TABLE IF EXISTS `hybrid_journey_legs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hybrid_journey_legs` (
  `hybrid_leg_id` bigint NOT NULL AUTO_INCREMENT,
  `hybrid_journey_id` bigint NOT NULL,
  `schedule_id` bigint NOT NULL,
  `leg_order` int NOT NULL,
  PRIMARY KEY (`hybrid_leg_id`),
  KEY `fk_hybrid_leg_journey` (`hybrid_journey_id`),
  KEY `fk_hybrid_leg_schedule` (`schedule_id`),
  CONSTRAINT `fk_hybrid_leg_journey` FOREIGN KEY (`hybrid_journey_id`) REFERENCES `hybrid_journeys` (`hybrid_journey_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hybrid_leg_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hybrid_journey_legs`
--

LOCK TABLES `hybrid_journey_legs` WRITE;
/*!40000 ALTER TABLE `hybrid_journey_legs` DISABLE KEYS */;
INSERT INTO `hybrid_journey_legs` VALUES (1,1,9,1),(2,1,11,2),(3,1,14,3),(4,11,7,1),(5,11,11,2),(6,11,14,3);
/*!40000 ALTER TABLE `hybrid_journey_legs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hybrid_journeys`
--

DROP TABLE IF EXISTS `hybrid_journeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hybrid_journeys` (
  `hybrid_journey_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `source_city_id` bigint NOT NULL,
  `destination_city_id` bigint NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `total_duration_minutes` int NOT NULL,
  `transfer_risk` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LOW',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`hybrid_journey_id`),
  KEY `fk_hybrid_user` (`user_id`),
  KEY `fk_hybrid_source_city` (`source_city_id`),
  KEY `fk_hybrid_dest_city` (`destination_city_id`),
  CONSTRAINT `fk_hybrid_dest_city` FOREIGN KEY (`destination_city_id`) REFERENCES `cities` (`city_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hybrid_source_city` FOREIGN KEY (`source_city_id`) REFERENCES `cities` (`city_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hybrid_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hybrid_journeys`
--

LOCK TABLES `hybrid_journeys` WRITE;
/*!40000 ALTER TABLE `hybrid_journeys` DISABLE KEYS */;
INSERT INTO `hybrid_journeys` VALUES (1,2,1,3,4650.00,655,'LOW','2026-10-20 17:23:33'),(2,2,1,3,5410.00,365,'LOW','2026-10-20 17:23:33'),(3,2,1,4,4960.00,420,'LOW','2026-10-20 17:23:33'),(4,2,3,13,5300.00,480,'MEDIUM','2026-10-20 17:23:33'),(5,2,9,7,1945.00,390,'LOW','2026-10-20 17:23:33'),(6,2,1,7,3710.00,450,'LOW','2026-10-20 17:23:33'),(7,2,2,20,5830.00,430,'LOW','2026-10-20 17:23:33'),(8,2,4,10,5350.00,490,'MEDIUM','2026-10-20 17:23:33'),(9,2,6,5,2370.00,380,'LOW','2026-10-20 17:23:33'),(10,2,1,13,2210.00,540,'LOW','2026-10-20 17:23:33'),(11,1,1,3,4510.00,740,'LOW','2026-10-20 19:07:44');
/*!40000 ALTER TABLE `hybrid_journeys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETED',
  `transaction_reference` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `transaction_reference` (`transaction_reference`),
  KEY `fk_payment_booking` (`booking_id`),
  CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,4650.00,'UPI / NetBanking','COMPLETED','TXN-TS-IN-889921'),(2,2,5700.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792517913474'),(3,3,6420.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792519290014'),(4,4,4890.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792519494951'),(5,5,2450.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792519543265'),(6,6,36750.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792519584334'),(7,7,1850.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792519613105'),(8,8,5980.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792520433690'),(9,9,8999.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792522676832'),(10,10,6420.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792522832930'),(11,11,8999.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792523143317'),(12,12,890.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792523520117'),(13,13,8999.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792546746696'),(14,14,4890.00,'Card / UPI (Demo)','COMPLETED','TXN-TS-1792548708840');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `route_id` bigint NOT NULL AUTO_INCREMENT,
  `source_city_id` bigint NOT NULL,
  `destination_city_id` bigint NOT NULL,
  `distance_km` decimal(10,2) NOT NULL,
  PRIMARY KEY (`route_id`),
  KEY `fk_route_dest_city` (`destination_city_id`),
  KEY `idx_routes_source_dest` (`source_city_id`,`destination_city_id`),
  CONSTRAINT `fk_route_dest_city` FOREIGN KEY (`destination_city_id`) REFERENCES `cities` (`city_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_route_source_city` FOREIGN KEY (`source_city_id`) REFERENCES `cities` (`city_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (1,1,3,1420.00),(2,3,1,1420.00),(3,1,2,150.00),(4,2,1,150.00),(5,2,3,1400.00),(6,3,2,1400.00),(7,2,4,980.00),(8,4,2,980.00),(9,3,7,280.00),(10,7,3,280.00),(11,9,3,250.00),(12,3,9,250.00),(13,2,13,580.00),(14,13,2,580.00),(15,2,7,1150.00),(16,7,2,1150.00),(17,4,5,570.00),(18,5,4,570.00),(19,6,4,350.00),(20,4,6,350.00),(21,8,2,520.00),(22,2,8,520.00),(23,3,10,550.00),(24,10,3,550.00),(25,3,20,450.00),(26,20,3,450.00),(27,14,17,680.00),(28,17,14,680.00),(29,18,4,540.00),(30,4,18,540.00);
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule_audit`
--

DROP TABLE IF EXISTS `schedule_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedule_audit` (
  `audit_id` bigint NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint NOT NULL,
  `action_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_value` decimal(12,2) DEFAULT NULL,
  `new_value` decimal(12,2) DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_audit`
--

LOCK TABLES `schedule_audit` WRITE;
/*!40000 ALTER TABLE `schedule_audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedule_audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `schedule_id` bigint NOT NULL AUTO_INCREMENT,
  `transport_id` bigint NOT NULL,
  `route_id` bigint NOT NULL,
  `departure_datetime` datetime NOT NULL,
  `arrival_datetime` datetime NOT NULL,
  `total_seats` int NOT NULL,
  `available_seats` int NOT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `schedule_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  PRIMARY KEY (`schedule_id`),
  KEY `fk_schedule_transport` (`transport_id`),
  KEY `idx_schedules_route` (`route_id`),
  KEY `idx_schedules_departure` (`departure_datetime`),
  CONSTRAINT `fk_schedule_route` FOREIGN KEY (`route_id`) REFERENCES `routes` (`route_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedule_transport` FOREIGN KEY (`transport_id`) REFERENCES `transport` (`transport_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_available_seats` CHECK (((`available_seats` >= 0) and (`available_seats` <= `total_seats`)))
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (1,1,1,'2026-10-25 06:15:00','2026-10-25 08:30:00',180,12,8999.00,'SCHEDULED'),(2,2,1,'2026-10-25 14:20:00','2026-10-25 16:35:00',186,26,6420.00,'SCHEDULED'),(3,3,1,'2026-10-25 19:40:00','2026-10-25 21:55:00',189,55,4890.00,'SCHEDULED'),(4,31,1,'2026-10-25 05:45:00','2026-10-25 21:30:00',500,85,2850.00,'SCHEDULED'),(5,52,1,'2026-10-25 17:15:00','2026-10-26 10:20:00',450,58,2450.00,'SCHEDULED'),(6,61,1,'2026-10-25 16:00:00','2026-10-26 18:30:00',36,13,1850.00,'SCHEDULED'),(7,31,3,'2026-10-25 05:45:00','2026-10-25 08:50:00',500,120,560.00,'SCHEDULED'),(8,49,3,'2026-10-25 07:15:00','2026-10-25 10:30:00',600,150,380.00,'SCHEDULED'),(9,63,3,'2026-10-25 06:00:00','2026-10-25 09:30:00',45,20,510.00,'SCHEDULED'),(10,65,3,'2026-10-25 08:30:00','2026-10-25 12:00:00',40,18,480.00,'SCHEDULED'),(11,3,15,'2026-10-25 10:30:00','2026-10-25 12:15:00',189,45,3200.00,'SCHEDULED'),(12,1,15,'2026-10-25 13:45:00','2026-10-25 15:35:00',180,15,8999.00,'SCHEDULED'),(13,33,15,'2026-10-25 17:00:00','2026-10-26 09:15:00',400,75,1680.00,'SCHEDULED'),(14,38,10,'2026-10-25 14:00:00','2026-10-25 18:20:00',450,95,800.00,'SCHEDULED'),(15,50,10,'2026-10-25 15:30:00','2026-10-25 20:00:00',550,110,550.00,'SCHEDULED'),(16,62,10,'2026-10-25 14:30:00','2026-10-25 19:30:00',40,22,550.00,'SCHEDULED'),(17,2,11,'2026-10-25 06:15:00','2026-10-25 08:30:00',186,32,5450.00,'SCHEDULED'),(18,1,11,'2026-10-25 11:30:00','2026-10-25 13:45:00',180,15,8999.00,'SCHEDULED'),(19,3,11,'2026-10-25 17:15:00','2026-10-25 19:30:00',189,40,4890.00,'SCHEDULED'),(20,34,11,'2026-10-25 07:45:00','2026-10-25 11:00:00',500,90,1145.00,'SCHEDULED'),(21,32,11,'2026-10-25 06:50:00','2026-10-25 10:15:00',450,70,980.00,'SCHEDULED'),(22,61,11,'2026-10-25 07:30:00','2026-10-25 12:30:00',36,16,620.00,'SCHEDULED'),(23,62,11,'2026-10-25 08:00:00','2026-10-25 13:00:00',40,24,550.00,'SCHEDULED'),(24,1,5,'2026-10-25 06:00:00','2026-10-25 08:10:00',180,15,8999.00,'SCHEDULED'),(25,2,5,'2026-10-25 09:30:00','2026-10-25 11:45:00',186,38,5200.00,'SCHEDULED'),(26,33,5,'2026-10-25 17:00:00','2026-10-26 08:35:00',450,80,2850.00,'SCHEDULED'),(27,61,5,'2026-10-25 15:00:00','2026-10-26 17:30:00',36,12,1950.00,'SCHEDULED'),(28,2,7,'2026-10-25 07:00:00','2026-10-25 08:45:00',186,60,4450.00,'SCHEDULED'),(29,3,7,'2026-10-25 18:30:00','2026-10-25 20:15:00',189,44,3850.00,'SCHEDULED'),(30,39,7,'2026-10-25 20:00:00','2026-10-26 14:30:00',500,95,1250.00,'SCHEDULED'),(31,64,7,'2026-10-25 16:30:00','2026-10-26 08:30:00',36,15,1650.00,'SCHEDULED'),(32,1,9,'2026-10-25 08:00:00','2026-10-25 08:55:00',180,15,8999.00,'SCHEDULED'),(33,38,9,'2026-10-25 06:10:00','2026-10-25 10:40:00',450,84,890.00,'SCHEDULED'),(34,62,9,'2026-10-25 07:00:00','2026-10-25 12:00:00',40,25,550.00,'SCHEDULED'),(35,2,13,'2026-10-25 09:15:00','2026-10-25 10:30:00',186,50,3850.00,'SCHEDULED'),(36,31,13,'2026-10-25 05:25:00','2026-10-25 13:10:00',500,75,1650.00,'SCHEDULED'),(37,61,13,'2026-10-25 19:00:00','2026-10-26 07:30:00',36,18,1450.00,'SCHEDULED'),(38,3,17,'2026-10-25 10:00:00','2026-10-25 11:15:00',189,65,3200.00,'SCHEDULED'),(39,36,17,'2026-10-25 05:45:00','2026-10-25 14:15:00',500,80,1420.00,'SCHEDULED'),(40,66,17,'2026-10-25 21:00:00','2026-10-26 06:30:00',40,15,950.00,'SCHEDULED'),(41,2,23,'2026-10-25 08:30:00','2026-10-25 09:40:00',186,42,3450.00,'SCHEDULED'),(42,59,23,'2026-10-25 06:10:00','2026-10-25 12:45:00',450,90,1165.00,'SCHEDULED'),(43,61,23,'2026-10-25 22:00:00','2026-10-26 06:00:00',36,16,750.00,'SCHEDULED'),(44,1,25,'2026-10-25 07:15:00','2026-10-25 08:25:00',180,15,8999.00,'SCHEDULED'),(45,32,25,'2026-10-25 07:20:00','2026-10-25 13:30:00',500,85,1280.00,'SCHEDULED'),(46,2,27,'2026-10-25 12:00:00','2026-10-25 13:25:00',186,48,4850.00,'SCHEDULED'),(47,47,27,'2026-10-25 06:00:00','2026-10-25 14:15:00',500,70,1680.00,'SCHEDULED'),(48,1,29,'2026-10-25 09:30:00','2026-10-25 10:35:00',180,15,8999.00,'SCHEDULED'),(49,37,29,'2026-10-25 20:30:00','2026-10-26 07:15:00',500,110,1150.00,'SCHEDULED'),(50,70,29,'2026-10-25 21:00:00','2026-10-26 06:45:00',36,14,850.00,'SCHEDULED');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_price_update` AFTER UPDATE ON `schedules` FOR EACH ROW BEGIN
    IF NOT (OLD.base_price <=> NEW.base_price) THEN
        INSERT INTO schedule_audit (
            schedule_id,
            action_type,
            old_value,
            new_value
        )
        VALUES (
            NEW.schedule_id,
            'PRICE_UPDATED',
            OLD.base_price,
            NEW.base_price
        );
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_seat_update` AFTER UPDATE ON `schedules` FOR EACH ROW BEGIN
    IF NOT (OLD.available_seats <=> NEW.available_seats) THEN
        INSERT INTO schedule_audit (
            schedule_id,
            action_type,
            old_value,
            new_value
        )
        VALUES (
            NEW.schedule_id,
            'SEATS_UPDATED',
            OLD.available_seats,
            NEW.available_seats
        );
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `transport`
--

DROP TABLE IF EXISTS `transport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transport` (
  `transport_id` bigint NOT NULL AUTO_INCREMENT,
  `transport_type` enum('FLIGHT','TRAIN','BUS') COLLATE utf8mb4_unicode_ci NOT NULL,
  `operator_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transport_details` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`transport_id`),
  KEY `idx_transport_type` (`transport_type`)
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transport`
--

LOCK TABLES `transport` WRITE;
/*!40000 ALTER TABLE `transport` DISABLE KEYS */;
INSERT INTO `transport` VALUES (1,'FLIGHT','Air India','AI-852','Airbus A320neo, In-flight meal, 15kg baggage included'),(2,'FLIGHT','IndiGo','6E-532','Airbus A321neo, Express boarding, USB power at seats'),(3,'FLIGHT','Akasa Air','QP-1120','Boeing 737 MAX, High headroom, Café Akasa gourmet snacks'),(4,'FLIGHT','SpiceJet','SG-8194','Boeing 737-800, SpiceMax extra legroom seats'),(5,'FLIGHT','Air India Express','IX-142','Boeing 737, Hot meals pre-booked, Standard pitch'),(6,'FLIGHT','IndiGo','6E-204','Airbus A320, On-time performance guarantee'),(7,'FLIGHT','Air India','AI-442','Airbus A321neo, Complimentary beverages, In-seat screen'),(8,'FLIGHT','Akasa Air','QP-1351','Boeing 737 MAX, Eco-friendly ultra-quiet engines'),(9,'FLIGHT','IndiGo','6E-671','Airbus A320neo, Direct non-stop service'),(10,'FLIGHT','Air India','AI-512','Boeing 787 Dreamliner, Full reclining seats'),(11,'FLIGHT','SpiceJet','SG-261','Boeing 737, Regional connectivity priority'),(12,'FLIGHT','IndiGo','6E-884','Airbus A321neo, Fast check-in priority'),(13,'FLIGHT','Air India','AI-664','Airbus A320, Wide-body connection at hub'),(14,'FLIGHT','Akasa Air','QP-1402','Boeing 737 MAX, Pet friendly travel available'),(15,'FLIGHT','IndiGo','6E-902','Airbus A320neo, Express baggage drop'),(16,'FLIGHT','Air India Express','IX-782','Boeing 737, Value fares with complimentary water'),(17,'FLIGHT','SpiceJet','SG-105','Boeing 737, Morning departure priority'),(18,'FLIGHT','IndiGo','6E-315','Airbus A320, Popular business corridor'),(19,'FLIGHT','Air India','AI-801','Airbus A321neo, Business and economy class'),(20,'FLIGHT','Akasa Air','QP-1721','Boeing 737 MAX, Warm hospitality and snacks'),(21,'FLIGHT','IndiGo','6E-448','Airbus A321neo, Prime evening departure slot'),(22,'FLIGHT','Air India','AI-211','Boeing 777-300ER, Flagship wide-body domestic leg'),(23,'FLIGHT','SpiceJet','SG-492','Boeing 737, Budget-friendly student allowance'),(24,'FLIGHT','IndiGo','6E-755','Airbus A320neo, Early bird morning frequency'),(25,'FLIGHT','Akasa Air','QP-1833','Boeing 737 MAX, Modern cabin atmosphere'),(26,'FLIGHT','Air India','AI-922','Airbus A320neo, Inter-state trunk corridor'),(27,'FLIGHT','IndiGo','6E-1011','Airbus A321neo, High frequency schedule'),(28,'FLIGHT','SpiceJet','SG-704','Boeing 737, Seasonal vacation special'),(29,'FLIGHT','Air India Express','IX-992','Boeing 737, Coast-to-capital express'),(30,'FLIGHT','IndiGo','6E-1205','Airbus A320neo, Night owl discount service'),(31,'TRAIN','Indian Railways (IRCTC)','VB-22226','Vande Bharat Express, 160 km/h semi-high speed, GPS info, Executive & Chair Car'),(32,'TRAIN','Indian Railways (IRCTC)','12006','Kalka New Delhi Shatabdi Express, All AC Chair Car, Meals served at seat'),(33,'TRAIN','Indian Railways (IRCTC)','12951','Mumbai Tejas Rajdhani Express, Premium sleeper AC, Wi-Fi infotainment, Bedding'),(34,'TRAIN','Indian Railways (IRCTC)','22448','Amb Andaura New Delhi Vande Bharat, Automated plug doors, Bio-vacuum toilets'),(35,'TRAIN','Indian Railways (IRCTC)','12009','Mumbai Ahmedabad Shatabdi Express, High-speed corridor priority'),(36,'TRAIN','Indian Railways (IRCTC)','20607','MGR Chennai Central Mysuru Vande Bharat, Southern rail speed benchmark'),(37,'TRAIN','Indian Railways (IRCTC)','12626','Kerala Superfast Express, Daily long-haul connecting southern ports'),(38,'TRAIN','Indian Railways (IRCTC)','12015','New Delhi Daurai (Ajmer) Shatabdi, Heritage state transit via Jaipur'),(39,'TRAIN','Indian Railways (IRCTC)','22691','KSR Bengaluru Rajdhani Express, Superfast connectivity via Secunderabad'),(40,'TRAIN','Indian Railways (IRCTC)','12137','Punjab Mail, Historical prestige train via central junction'),(41,'TRAIN','Indian Railways (IRCTC)','20901','Mumbai Central Gandhinagar Capital Vande Bharat, World-class comfort'),(42,'TRAIN','Indian Railways (IRCTC)','12002','New Delhi Rani Kamlapati (Bhopal) Shatabdi, India top speed corridor'),(43,'TRAIN','Indian Railways (IRCTC)','12224','Ernakulam Mumbai LTT AC Duronto Express, Non-stop point-to-point speed'),(44,'TRAIN','Indian Railways (IRCTC)','20833','Visakhapatnam Secunderabad Vande Bharat, Coastal to Deccan speedway'),(45,'TRAIN','Indian Railways (IRCTC)','12301','Howrah New Delhi Rajdhani Express, Eastern gateway premier express'),(46,'TRAIN','Indian Railways (IRCTC)','12046','Chandigarh New Delhi Shatabdi Express, Business executive choice'),(47,'TRAIN','Indian Railways (IRCTC)','22436','Varanasi New Delhi Vande Bharat Express, India first Vande Bharat rake'),(48,'TRAIN','Indian Railways (IRCTC)','12953','August Kranti Tejas Rajdhani, Fast overnight corporate transit'),(49,'TRAIN','Indian Railways (IRCTC)','12123','Deccan Queen Superfast, Pune-Mumbai historical icon with dining car'),(50,'TRAIN','Indian Railways (IRCTC)','12985','Jaipur Delhi Sarai Rohilla Double Decker Express, High capacity AC seating'),(51,'TRAIN','Indian Railways (IRCTC)','12675','Kovai Superfast Express, Tamil Nadu commercial lifeline'),(52,'TRAIN','Indian Railways (IRCTC)','22221','CSMT Mumbai Hazrat Nizamuddin Rajdhani, Via Bhopal and Agra'),(53,'TRAIN','Indian Railways (IRCTC)','12011','Kalka Shatabdi, Early morning express to national capital'),(54,'TRAIN','Indian Railways (IRCTC)','20631','Kasaragod Thiruvananthapuram Vande Bharat, Kerala coastal express'),(55,'TRAIN','Indian Railways (IRCTC)','12417','Prayagraj Express, Punctual superfast link to capital'),(56,'TRAIN','Indian Railways (IRCTC)','12028','KSR Bengaluru MGR Chennai Central Shatabdi, IT corridor priority'),(57,'TRAIN','Indian Railways (IRCTC)','22470','Hazrat Nizamuddin Khajuraho Vande Bharat, Heritage and culture tourism line'),(58,'TRAIN','Indian Railways (IRCTC)','12111','Amravati Mumbai CSMT Superfast, Vidarbha overnight link'),(59,'TRAIN','Indian Railways (IRCTC)','12004','New Delhi Lucknow Jn Shatabdi Express, Clean express corridor'),(60,'TRAIN','Indian Railways (IRCTC)','12267','Mumbai Central Hapa Duronto Express, Gujarat industrial corridor'),(61,'BUS','IntrCity SmartBus','IC-701','Volvo 9600 Multi-Axle AC Sleeper, Smart lounge access, Clean washroom on board'),(62,'BUS','Zingbus Electric Coach','ZB-202','Zero-emission Luxury Electric Coach, Reclining leather seats, Fast charging stops'),(63,'BUS','MSRTC Shivneri','MH-SHIV-01','Scania AC Seater, Pune-Mumbai Expressway hourly express, Punctual state service'),(64,'BUS','VRL Travels','VRL-992','I-Shift Multi-Axle AC Sleeper, Reading lamp, Personal LED screen, Mineral water'),(65,'BUS','Neeta Travels','NT-450','Mercedes-Benz Multi-Axle AC Sleeper, Luxury suspension, Clean blankets'),(66,'BUS','KSRTC FlyBus','KA-FLY-10','Direct airport to city center executive coach, Flight schedule sync'),(67,'BUS','IntrCity SmartBus','IC-808','Volvo Multi-Axle Sleeper, Live tracking, In-bus washroom, CCTV safety'),(68,'BUS','Zingbus Electric Coach','ZB-404','Intercity EV Coach, Quiet ride, Zero noise vibration, Type-C charging ports'),(69,'BUS','SRS Travels','SRS-551','Scania Metrolink Multi-Axle AC Sleeper, Professional double drivers'),(70,'BUS','Kallada Travels','KT-210','Volvo B11R Multi-Axle, Southern express night transit with blankets'),(71,'BUS','MSRTC Shivshahi','MH-SHIV-44','Air-conditioned express coach, Budget inter-district connectivity'),(72,'BUS','IntrCity SmartBus','IC-912','Volvo 9600 AC Sleeper, Captain onboard, Clean bed linen, Free Wi-Fi'),(73,'BUS','Zingbus Electric Coach','ZB-610','Electric Premium Seater, 100% green travel, Emergency SOS buttons'),(74,'BUS','Orange Tours and Travels','OR-330','BharatBenz AC Sleeper, Air suspension, High ground clearance comfort'),(75,'BUS','Hans Travels','HT-770','Volvo Multi-Axle AC Sleeper, Central India express network'),(76,'BUS','IntrCity SmartBus','IC-420','Multi-Axle Premium Sleeper, Pre-boarding thermal check, Mineral water bottle'),(77,'BUS','Zingbus Electric Coach','ZB-818','Green Fleet Express Coach, Reclining 140 degree comfort seats'),(78,'BUS','KSRTC Airavat Club Class','KA-AIR-05','Volvo Multi-Axle Luxury Seater, State transport gold standard'),(79,'BUS','VRL Travels','VRL-114','I-Shift AC Sleeper, Spacious berths, Punctual overnight arrival guarantee'),(80,'BUS','Neeta Travels','NT-880','Volvo AC Seater, Expressway special shuttle every 30 minutes'),(81,'BUS','IntrCity SmartBus','IC-305','Volvo 9600 Multi-Axle AC Sleeper, Onboard refreshment kiosk'),(82,'BUS','Zingbus Electric Coach','ZB-999','High Speed Electric Coach, Panoramic window view, UV air sanitized'),(83,'BUS','Prasanna Purple','PP-501','Multi-Axle Scania AC Seater, Pune city center to airport and express terminals'),(84,'BUS','Jabbar Travels','JT-220','Volvo AC Sleeper, Southern trunk link with smooth highway speed'),(85,'BUS','IntrCity SmartBus','IC-615','Volvo Multi-Axle Sleeper, Safe solo traveler female priority berths'),(86,'BUS','Zingbus Electric Coach','ZB-112','Express Electric Shuttle Coach, Ergonomic headrest support'),(87,'BUS','KSRTC Ambaari Dream Class','KA-AMB-01','Volvo 9600 Sleeper, Hotel on wheels luxury experience'),(88,'BUS','SRS Travels','SRS-890','Scania AC Sleeper, Direct interstate highway runner'),(89,'BUS','MSRTC Shivneri','MH-SHIV-88','Scania AC Seater, Swargate Pune to Dadar Mumbai non-stop'),(90,'BUS','Zingbus Electric Coach','ZB-333','Intercity EV sleeper, Silent cabin technology');
/*!40000 ALTER TABLE `transport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ROLE_USER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'TravelSmart Administrator','admin@travelsmart.in','+919876543210','$2a$10$wN7K0ZvxK2X7G5qN5pQGqe1F4dZgq0q00qHq3zK8g7j1d2s3t4u5v','ROLE_ADMIN','2026-10-20 17:23:33'),(2,'Anushka Kumar','user@travelsmart.in','+919876543211','$2a$10$wN7K0ZvxK2X7G5qN5pQGqe1F4dZgq0q00qHq3zK8g7j1d2s3t4u5v','ROLE_USER','2026-10-20 17:23:33'),(3,'Anushka Kumar','anushka25kumar@gmail.com','9870657834','$2a$10$miDxsveCFsATjGEZvIoMiuHre3k1V/K8AOe.GBKIp1650/vaAJCqm','ROLE_USER','2026-10-20 19:05:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'travelsmart_demo_db'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_total_ticket_price` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_total_ticket_price`(
    ticket_price DECIMAL(10,2),
    passengers INT
) RETURNS decimal(12,2)
    NO SQL
    DETERMINISTIC
BEGIN
    RETURN ticket_price * passengers;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_available_schedules` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_available_schedules`()
BEGIN
    SELECT
        s.schedule_id,
        t.transport_type,
        t.operator_name,
        t.service_number,
        s.departure_datetime,
        s.arrival_datetime,
        s.base_price,
        s.available_seats
    FROM schedules s
    JOIN transport t
        ON s.transport_id = t.transport_id
    WHERE s.available_seats > 0
    ORDER BY s.departure_datetime;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_show_all_transport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_show_all_transport`()
BEGIN
    SELECT
        transport_id,
        transport_type,
        operator_name,
        service_number
    FROM transport;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_transport_by_type` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_transport_by_type`(
    IN p_type VARCHAR(20)
)
BEGIN
    SELECT
        s.schedule_id,
        t.transport_type,
        t.operator_name,
        t.service_number,
        s.departure_datetime,
        s.base_price,
        s.available_seats
    FROM schedules s
    JOIN transport t
        ON s.transport_id = t.transport_id
    WHERE t.transport_type = UPPER(p_type)
    ORDER BY s.departure_datetime;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-21  8:35:09

-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: street_light_control
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `configure`
--
use street_light_control;
DROP TABLE IF EXISTS `configure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configure` (  
  `uid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rr_no` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `constituency` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `zone_ulb` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pole` int DEFAULT NULL,
  `conn_pole` int DEFAULT NULL,
  `arm` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lamp_type` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Board_no` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `watts` int DEFAULT NULL,
  `location_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `service_type` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_no` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imei_no` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sim_no` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `longitude` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phase` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `configured_on_time` time DEFAULT NULL,
  `configured_off_time` time DEFAULT NULL,
  `time_zone` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `ld_details` varchar(256) DEFAULT NULL
  )   ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configure`
--

LOCK TABLES `configure` WRITE;
/*!40000 ALTER TABLE `configure` DISABLE KEYS */;
/*INSERT INTO `configure` VALUES (38,'SS1075AA38135','BSTL-14','Central','Shiggaon Cons','Savanur',5,4,'A','LED','BRD-77',120,'(10)NEAR-DHODKERE','SC','Auto','5755183051548','867530900123456','8991012345678901234','14.91855','75.26258','single','18:00:00','06:00:00','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(39,'SS1075AA38117','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STOREE','SC','Auto','5755183074398','8659620586468576','8991012345678901234','14.91855','75.26258','single','18:00:00','06:00:00','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(40,'SS1075AA38118','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STORE','SC','Auto','5755183074394','865962058646857','8991012345678901234','14.99515','75.2249','single','00:00:18','00:00:06','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(41,'SS1075AA38119','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STORE','SC','Auto','5755183074394','865962058646857','8991012345678901234','14.99515','75.2249','single','00:00:18','00:00:06','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(42,'SS1075AA38120','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STORE','SC','Auto','5755183074394','865962058646857','8991012345678901234','14.99515','75.2249','single','00:00:18','00:00:06','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(43,'SS1075AA38121','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STORE','SC','Auto','5755183074394','865962058646857','8991012345678901234','14.99515','75.2249','single','00:00:18','00:00:06','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(44,'SS1075AA38122','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STORE','SC','Auto','5755183074394','865962058646857','8991012345678901234','14.99515','75.2249','single','00:00:18','00:00:06','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(45,'SS1075AA38123','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STORE','SC','Auto','5755183074394','865962058646857','8991012345678901234','14.99515','75.2249','single','00:00:18','00:00:06','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(46,'SS1075AA38124','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STORE','SC','Auto','5755183074394','865962058646857','8991012345678901234','14.99515','75.2249','single','00:00:18','00:00:06','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2),(47,'SS1075AA38125','CL 14259171','Central','Shiggaon Cons','Shiggaon',5,4,'A','LED','BRD-77',120,'(08)MARKET-ROAD-NEARBY-GANJIGATTI-CLOTH-STORE','SC','Auto','5755183074394','865962058646857','8991012345678901234','14.99515','75.2249','single','00:00:18','00:00:06','Asia/Kolkata','commissioned','2025-12-24',11,100,20,50,40,25,50,10,60,5,100,2);*/
/*!40000 ALTER TABLE `configure` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-25 19:50:45

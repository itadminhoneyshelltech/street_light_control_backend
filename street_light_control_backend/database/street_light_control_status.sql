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
-- Table structure for table `status`
--
use street_light_control;
DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `uid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `actual_on_time` time DEFAULT NULL,
  `actual_off_time` time DEFAULT NULL,
  `r_volt` float DEFAULT NULL,
  `y_volt` float DEFAULT NULL,
  `b_volt` float DEFAULT NULL,
  `r_cur` float DEFAULT NULL,
  `y_cur` float DEFAULT NULL,
  `b_cur` float DEFAULT NULL,
  `r_kw` float DEFAULT NULL,
  `y_kw` float DEFAULT NULL,
  `b_kw` float DEFAULT NULL,
  `r_pf` float DEFAULT NULL,
  `y_pf` float DEFAULT NULL,
  `b_pf` float DEFAULT NULL,
  `battery_status` float DEFAULT NULL,
  `battery_backup_hrs` float DEFAULT NULL,
  `day_open_reading` float DEFAULT NULL,
  `day_close_reading` float DEFAULT NULL,
  `cur_reading` float DEFAULT NULL,
  `baseline_kWh` float DEFAULT NULL,
  `adjusted_baseline_kWh` float DEFAULT NULL,
  `actual_consumption_kWh` float DEFAULT NULL,
  `energy_saved_kWh` float DEFAULT NULL,
  `energy_saving_per` float DEFAULT NULL,
  `lamp_burning_per` float DEFAULT NULL,
  `status` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CCMS_STATUS` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
/*INSERT INTO `status` VALUES (1,'SS1075AA3811','periodic_status','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online'),(2,'SS1075AA3811','load_on','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online'),(3,'SS1075AA3811','load_off','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online'),(4,'SS1075AA3811','load_on_periodic','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online'),(5,'SS1075AA3811','load_on_periodic_updatae','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online'),(6,'SS1075AA3811','load_off_periodic_updatae','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online'),(7,'SS1075AA3811','day_start_report','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online'),(8,'SS1075AA3811','day_end_report','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online'),(9,'SS1075AA3811','error_report','2025-12-24','18:00:00','06:00:00',230.5,229.9,231.2,2.1,2,2.2,0.45,0.44,0.46,0.98,0.97,0.99,94.2,6.5,1234.5,1240.7,1240.7,1200,1195,5.8,0.3,5.17,98,'ok','online');*/
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-25 19:50:46

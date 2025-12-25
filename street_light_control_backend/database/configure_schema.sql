-- Configure table schema
-- Generated on 2025-12-24

CREATE TABLE IF NOT EXISTS `configure` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uid` VARCHAR(64) NOT NULL,
  `rr_no` VARCHAR(64) NULL,
  `constituency` VARCHAR(128) NULL,
  `zone_ulb` VARCHAR(128) NULL,
  `ward` VARCHAR(128) NULL,
  `pole` INT NULL,
  `conn_pole` INT NULL,
  `arm` VARCHAR(64) NULL,
  `lamp_type` VARCHAR(128) NULL,
  `Board_no` VARCHAR(64) NULL,
  `watts` INT NULL,
  `location_address` VARCHAR(255) NULL,
  `service_type` VARCHAR(64) NULL,
  `mode` VARCHAR(64) NULL,
  `phone_no` VARCHAR(32) NULL,
  `imei_no` VARCHAR(32) NULL,
  `sim_no` VARCHAR(32) NULL,
  `latitude` VARCHAR(64) NULL,
  `longitude` VARCHAR(64) NULL,
  `phase` VARCHAR(32) NULL,
  `configured_on_time` DATE NULL,
  `configured_off_time` DATE NULL,
  `time_zone` VARCHAR(64) NULL,
  `event` VARCHAR(128) NULL,
  `date` DATE NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
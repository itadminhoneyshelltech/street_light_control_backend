<?php
// backend/database-ccms-extended.sql
// Extended schema to support CCMS specification requirements

-- Add columns to street_lights table for CCMS compliance
ALTER TABLE street_lights ADD COLUMN IF NOT EXISTS (
    schedule_enabled BOOLEAN DEFAULT FALSE,
    sunrise_time TIME,
    sunset_time TIME,
    latitude_backup DECIMAL(10, 8),
    longitude_backup DECIMAL(11, 8),
    battery_backup_hours INT DEFAULT 12,
    battery_status ENUM('full', 'good', 'warning', 'critical', 'offline') DEFAULT 'full',
    gsm_imei VARCHAR(15),
    gsm_signal_strength INT,
    communication_type ENUM('GSM', 'RF', 'Wired') DEFAULT 'GSM',
    maintenance_required BOOLEAN DEFAULT FALSE
);

-- Smart Meters table (for energy monitoring)
CREATE TABLE IF NOT EXISTS smart_meters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) UNIQUE NOT NULL,
    meter_id VARCHAR(50) UNIQUE,
    meter_type ENUM('Non-CT', 'CT-operated') DEFAULT 'Non-CT',
    gsm_imei VARCHAR(15),
    phase_type ENUM('Single', '3-Phase') DEFAULT 'Single',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE,
    INDEX idx_meter_id (meter_id),
    INDEX idx_light_id (light_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Energy Parameters table (real-time monitoring)
CREATE TABLE IF NOT EXISTS energy_parameters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    meter_id VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phase_a_voltage DECIMAL(6, 2),
    phase_b_voltage DECIMAL(6, 2),
    phase_c_voltage DECIMAL(6, 2),
    phase_a_current DECIMAL(8, 2),
    phase_b_current DECIMAL(8, 2),
    phase_c_current DECIMAL(8, 2),
    phase_a_power_factor DECIMAL(4, 3),
    phase_b_power_factor DECIMAL(4, 3),
    phase_c_power_factor DECIMAL(4, 3),
    frequency DECIMAL(6, 2),
    total_active_power DECIMAL(10, 2),
    total_apparent_power DECIMAL(10, 2),
    cumulative_kwh DECIMAL(12, 2),
    cumulative_kvah DECIMAL(12, 2),
    power_unavailable_hours INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Schedule table (for automatic ON/OFF based on sunrise/sunset)
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    schedule_type ENUM('sunrise_sunset', 'fixed_time', 'seasonal') DEFAULT 'sunrise_sunset',
    start_time TIME,
    end_time TIME,
    monday BOOLEAN DEFAULT TRUE,
    tuesday BOOLEAN DEFAULT TRUE,
    wednesday BOOLEAN DEFAULT TRUE,
    thursday BOOLEAN DEFAULT TRUE,
    friday BOOLEAN DEFAULT TRUE,
    saturday BOOLEAN DEFAULT TRUE,
    sunday BOOLEAN DEFAULT TRUE,
    seasonal_start_date DATE,
    seasonal_end_date DATE,
    action ENUM('on', 'off') DEFAULT 'on',
    brightness_level INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Battery Status table
CREATE TABLE IF NOT EXISTS battery_status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) UNIQUE NOT NULL,
    backup_hours_available INT DEFAULT 12,
    current_charge_percentage INT DEFAULT 100,
    status ENUM('full', 'good', 'warning', 'critical', 'offline') DEFAULT 'full',
    last_discharge_time DATETIME,
    discharge_duration_hours INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- GSM Communication Log
CREATE TABLE IF NOT EXISTS gsm_communication_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    gsm_imei VARCHAR(15),
    signal_strength INT,
    message_sent TEXT,
    message_received TEXT,
    status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Alerts/Notifications table
CREATE TABLE IF NOT EXISTS alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    alert_type ENUM('battery_low', 'communication_lost', 'maintenance_required', 'power_failure', 'error', 'info') DEFAULT 'info',
    severity ENUM('critical', 'high', 'medium', 'low', 'info') DEFAULT 'info',
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_light_id (light_id),
    INDEX idx_severity (severity),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
?>

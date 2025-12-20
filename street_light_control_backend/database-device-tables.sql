-- Device Commands Queue Table
-- Run this after database-ccms-extended.sql

USE street_light_control;

-- Device Commands Queue (for queuing commands to devices)
CREATE TABLE IF NOT EXISTS device_commands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    command_type ENUM('power_control', 'brightness_control', 'schedule_update', 'maintenance', 'firmware_update') NOT NULL,
    action VARCHAR(50),
    brightness_level INT,
    schedule JSON,
    priority ENUM('critical', 'high', 'normal', 'low') DEFAULT 'normal',
    requested_by INT,
    executed BOOLEAN DEFAULT 0,
    executed_at TIMESTAMP NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_executed (executed),
    INDEX idx_requested_at (requested_at),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Device Logs Table (optional, for storing device diagnostic logs)
CREATE TABLE IF NOT EXISTS device_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    log_level ENUM('debug', 'info', 'warning', 'error', 'critical') DEFAULT 'info',
    log_message TEXT,
    device_timestamp TIMESTAMP,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_received_at (received_at),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Device Firmware Versions Table (optional, for tracking firmware)
CREATE TABLE IF NOT EXISTS firmware_versions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    version VARCHAR(20) UNIQUE NOT NULL,
    release_date DATE,
    download_url VARCHAR(255),
    changelog TEXT,
    is_latest BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample firmware entry
INSERT INTO firmware_versions (version, is_latest, changelog) 
VALUES ('2.2.0', 1, 'Bug fixes and performance improvements');

-- Device Health Monitoring Table (optional, for historical tracking)
CREATE TABLE IF NOT EXISTS device_health_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    status ENUM('healthy', 'degraded', 'offline', 'error') DEFAULT 'healthy',
    signal_strength INT,
    battery_percentage INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_recorded_at (recorded_at),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

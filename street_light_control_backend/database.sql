<?php
// backend/database.sql
// MySQL Database schema

CREATE DATABASE IF NOT EXISTS street_light_control;
USE street_light_control;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'operator', 'viewer') DEFAULT 'viewer',
    city VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_city (city),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Street Lights table
CREATE TABLE IF NOT EXISTS street_lights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    status ENUM('on', 'off', 'error') DEFAULT 'off',
    is_automatic BOOLEAN DEFAULT TRUE,
    last_status_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_details TEXT,
    brightness INT DEFAULT 100,
    energy_consumption FLOAT DEFAULT 0,
    installation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    maintenance_schedule TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_city (city),
    INDEX idx_status (status),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Control Logs table
CREATE TABLE IF NOT EXISTS control_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    action ENUM('on', 'off', 'brightness_change', 'mode_change') NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    user_id INT,
    control_type ENUM('manual', 'automatic') DEFAULT 'manual',
    previous_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- City Summary table
CREATE TABLE IF NOT EXISTS city_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    city VARCHAR(100) UNIQUE NOT NULL,
    total_lights INT DEFAULT 0,
    lights_on INT DEFAULT 0,
    lights_off INT DEFAULT 0,
    lights_in_error INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample admin user
INSERT INTO users (name, email, password, role, city, is_active)
VALUES ('Admin User', 'admin@streetlight.com', '$2y$10$n/PPDnf9piuGlw89NwAxCOei7J9H5r6XGxLP8jB4x2HZN/sY80fey', 'admin', 'Delhi', TRUE);

-- Insert sample street lights
INSERT INTO street_lights (light_id, name, city, latitude, longitude, address, status, is_automatic)
VALUES 
    ('SL001', 'Light 1 - Main Road', 'Delhi', 28.6139, 77.2090, 'Main Road, Delhi', 'off', TRUE),
    ('SL002', 'Light 2 - Park Avenue', 'Delhi', 28.6145, 77.2100, 'Park Avenue, Delhi', 'on', TRUE),
    ('SL003', 'Light 3 - Market Street', 'Delhi', 28.6150, 77.2110, 'Market Street, Delhi', 'error', TRUE),
    ('SL004', 'Light 4 - Hospital Road', 'Delhi', 28.6160, 77.2120, 'Hospital Road, Delhi', 'off', TRUE),
    ('SL005', 'Light 5 - School Lane', 'Delhi', 28.6170, 77.2130, 'School Lane, Delhi', 'on', TRUE);
?>

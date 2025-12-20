-- Add to your database.sql file

-- Street Light Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    inspector_id INT,
    inspection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    photo_path VARCHAR(255),
    photo_base64 LONGTEXT,
    gps_latitude DECIMAL(10, 8),
    gps_longitude DECIMAL(11, 8),
    light_status ENUM('on', 'off', 'error', 'not-accessible') DEFAULT 'off',
    ward_number INT,
    notes TEXT,
    brightness_level INT DEFAULT 0,
    temperature FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_inspection_date (inspection_date),
    INDEX idx_ward_number (ward_number),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE,
    FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create table for inspection history
CREATE TABLE IF NOT EXISTS inspection_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100) NOT NULL,
    previous_status VARCHAR(50),
    current_status VARCHAR(50),
    issues_found TEXT,
    maintenance_required BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    assigned_to INT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_light_id (light_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (light_id) REFERENCES street_lights(light_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

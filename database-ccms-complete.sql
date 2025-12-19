-- ============================================================================
-- CCMS Complete Database Schema - All Tables Required for Full Functionality
-- Compliant with IS 16444 Smart Energy Meter Specification
-- ============================================================================

-- ============================================================================
-- 1. GEOGRAPHIC ZONES & WARDS MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS cities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  city_name VARCHAR(100) NOT NULL UNIQUE,
  state VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_switching_points INT DEFAULT 0,
  total_lights INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS zones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  city_id INT NOT NULL,
  zone_name VARCHAR(100) NOT NULL,
  zone_code VARCHAR(50) UNIQUE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_switching_points INT DEFAULT 0,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  UNIQUE KEY unique_zone (city_id, zone_name),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  zone_id INT NOT NULL,
  city_id INT NOT NULL,
  ward_name VARCHAR(100) NOT NULL,
  ward_code VARCHAR(50) UNIQUE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_switching_points INT DEFAULT 0,
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  UNIQUE KEY unique_ward (zone_id, ward_name),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 2. FEEDER PANELS / SWITCHING POINTS (Main Control Points)
-- ============================================================================

CREATE TABLE IF NOT EXISTS feeder_panels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ward_id INT NOT NULL,
  zone_id INT NOT NULL,
  city_id INT NOT NULL,
  panel_name VARCHAR(100) NOT NULL,
  panel_code VARCHAR(50) UNIQUE NOT NULL,
  panel_id VARCHAR(50) UNIQUE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Power Supply Details
  supply_phase ENUM('single', 'three') DEFAULT 'single',
  rated_voltage INT DEFAULT 240, -- 240V or 415V
  frequency INT DEFAULT 50,
  
  -- Equipment Ratings
  panel_rating INT, -- kW capacity
  mcb_rating INT, -- Amps
  contactor_type VARCHAR(50),
  
  -- Status Monitoring
  connection_status ENUM('connected', 'disconnected', 'error') DEFAULT 'disconnected',
  manual_mode TINYINT DEFAULT 0, -- 1 = manual, 0 = auto
  last_sync DATETIME,
  last_command DATETIME,
  last_command_status VARCHAR(50),
  
  -- Operational Hours
  on_time TIME, -- Default ON time (Sunrise)
  off_time TIME, -- Default OFF time (Sunset)
  
  -- Safety & Alerts
  door_open TINYINT DEFAULT 0,
  door_tamper_alert TINYINT DEFAULT 0,
  
  -- Configuration
  gsm_modem_id VARCHAR(50), -- IMEI
  gsm_signal_strength INT, -- Signal percentage
  
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  KEY idx_city_zone_ward (city_id, zone_id, ward_id),
  KEY idx_status (connection_status),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 3. LED LUMINAIRES / STREET LIGHTS (Connected to Feeder Panels)
-- ============================================================================

CREATE TABLE IF NOT EXISTS led_luminaires (
  id INT PRIMARY KEY AUTO_INCREMENT,
  feeder_panel_id INT NOT NULL,
  light_id VARCHAR(50) UNIQUE NOT NULL,
  light_name VARCHAR(100),
  
  -- Location
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  street_name VARCHAR(150),
  
  -- Light Specifications
  wattage INT DEFAULT 100, -- Watts
  type ENUM('LED', 'HPS', 'CFL') DEFAULT 'LED',
  
  -- Status
  status ENUM('on', 'off', 'faulty', 'unknown') DEFAULT 'unknown',
  last_status_update DATETIME,
  faulty_since DATETIME,
  
  -- Operating Hours
  total_hours INT DEFAULT 0, -- Cumulative operating hours
  today_hours INT DEFAULT 0, -- Hours today
  
  -- Battery Status
  battery_percentage INT DEFAULT 100,
  battery_status ENUM('good', 'warning', 'low', 'critical') DEFAULT 'good',
  
  -- Fault Details
  fault_type VARCHAR(100), -- LED failure, ballast issue, etc.
  failure_count INT DEFAULT 0,
  
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  KEY idx_panel_status (feeder_panel_id, status),
  KEY idx_battery (battery_status),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 4. SMART METERS - Energy Measurement (IS 16444 Compliant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS smart_meters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  feeder_panel_id INT UNIQUE NOT NULL,
  meter_id VARCHAR(50) UNIQUE NOT NULL,
  meter_type ENUM('CT', 'Non-CT') DEFAULT 'Non-CT',
  
  -- Meter Location & Connection
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Connectivity
  gsm_connectivity ENUM('connected', 'disconnected') DEFAULT 'connected',
  imei_number VARCHAR(20),
  sim_number VARCHAR(20),
  
  -- Meter Specifications (IS 16444 - Variant 2)
  c1_connectivity TINYINT DEFAULT 1, -- C1 port available
  c3_connectivity TINYINT DEFAULT 1, -- C3 port available
  ihd_available TINYINT DEFAULT 1, -- In-House Display
  ihd_communication TINYINT DEFAULT 1,
  wan_module TINYINT DEFAULT 1, -- WAN Communication Module
  
  -- Calibration
  last_calibration_date DATE,
  next_calibration_date DATE,
  calibration_valid TINYINT DEFAULT 1,
  
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  KEY idx_meter_status (gsm_connectivity),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 5. ENERGY PARAMETERS - Real-time & 15-minute Interval Data
-- ============================================================================

CREATE TABLE IF NOT EXISTS energy_parameters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  smart_meter_id INT NOT NULL,
  feeder_panel_id INT NOT NULL,
  
  -- Measurement Timestamp
  reading_timestamp DATETIME NOT NULL,
  reading_interval INT DEFAULT 15, -- minutes
  
  -- Phase-wise Voltage (V)
  voltage_phase_a DECIMAL(8, 2),
  voltage_phase_b DECIMAL(8, 2),
  voltage_phase_c DECIMAL(8, 2),
  voltage_avg DECIMAL(8, 2),
  
  -- Phase-wise Current (A)
  current_phase_a DECIMAL(8, 2),
  current_phase_b DECIMAL(8, 2),
  current_phase_c DECIMAL(8, 2),
  current_total DECIMAL(8, 2),
  
  -- Power Factor
  pf_phase_a DECIMAL(4, 3),
  pf_phase_b DECIMAL(4, 3),
  pf_phase_c DECIMAL(4, 3),
  pf_total DECIMAL(4, 3),
  
  -- Power Measurements
  active_power_kw DECIMAL(10, 3),
  apparent_power_kva DECIMAL(10, 3),
  reactive_power_kvar DECIMAL(10, 3),
  
  -- Energy Cumulative (Metering)
  energy_kwh_cumulative DECIMAL(12, 3),
  energy_kvah_cumulative DECIMAL(12, 3),
  
  -- Frequency
  frequency_hz DECIMAL(6, 2) DEFAULT 50,
  
  -- Fault Indicators
  voltage_imbalance_percent DECIMAL(5, 2),
  current_imbalance_percent DECIMAL(5, 2),
  thd_current_percent DECIMAL(5, 2), -- Total Harmonic Distortion
  
  -- Additional Flags
  power_failure TINYINT DEFAULT 0,
  high_voltage_alert TINYINT DEFAULT 0,
  low_voltage_alert TINYINT DEFAULT 0,
  overload_alert TINYINT DEFAULT 0,
  
  FOREIGN KEY (smart_meter_id) REFERENCES smart_meters(id),
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  KEY idx_meter_timestamp (smart_meter_id, reading_timestamp),
  KEY idx_panel_timestamp (feeder_panel_id, reading_timestamp),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 6. FAULT LOGS & ALERTS (Per Specification Requirements)
-- ============================================================================

CREATE TABLE IF NOT EXISTS fault_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  feeder_panel_id INT NOT NULL,
  meter_id INT,
  light_id INT,
  
  -- Fault Classification
  fault_type ENUM(
    'phase_voltage_high',
    'phase_voltage_low',
    'phase_current_high',
    'phase_current_low',
    'outgoing_mcb_trip',
    'incoming_mcb_trip',
    'theft_alert',
    'group_failure',
    'leakage_to_ground',
    'no_output_supply',
    'door_open',
    'door_tamper',
    'contactor_failure',
    'power_failure',
    'led_failure',
    'communication_loss'
  ) NOT NULL,
  
  -- Severity
  severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
  
  -- Details
  fault_description TEXT,
  fault_value DECIMAL(10, 3),
  threshold_value DECIMAL(10, 3),
  unit VARCHAR(20),
  
  -- Status
  fault_active TINYINT DEFAULT 1,
  acknowledged TINYINT DEFAULT 0,
  acknowledged_by INT,
  acknowledged_at DATETIME,
  resolved_at DATETIME,
  
  -- Automatic Actions
  alert_sent TINYINT DEFAULT 0,
  sms_recipients TEXT, -- JSON array of phone numbers
  
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  KEY idx_active (fault_active),
  KEY idx_type_active (fault_type, fault_active),
  KEY idx_timestamp (created_at),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 7. ALERT MANAGEMENT & SMS NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  city_id INT,
  ward_id INT,
  phone_number VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(100),
  recipient_role VARCHAR(50), -- Operator, Supervisor, Manager, etc.
  is_active TINYINT DEFAULT 1,
  
  -- Notification Preferences
  receive_all_alerts TINYINT DEFAULT 0,
  receive_critical TINYINT DEFAULT 1,
  receive_warning TINYINT DEFAULT 0,
  receive_info TINYINT DEFAULT 0,
  
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  UNIQUE KEY unique_phone_city (city_id, phone_number),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alert_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fault_log_id INT,
  message_type ENUM('sms', 'push', 'email', 'dashboard') DEFAULT 'sms',
  recipient_number VARCHAR(20),
  message_text TEXT,
  
  -- Delivery Status
  delivery_status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  delivery_timestamp DATETIME,
  delivery_response TEXT,
  
  FOREIGN KEY (fault_log_id) REFERENCES fault_logs(id),
  KEY idx_delivery_status (delivery_status),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 8. CONTROL OPERATIONS & SCHEDULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS control_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  feeder_panel_id INT NOT NULL,
  
  -- Schedule Type
  schedule_type ENUM('daily', 'weekly', 'monthly', 'once', 'seasonal') DEFAULT 'daily',
  
  -- Timing
  start_time TIME,
  end_time TIME,
  on_time TIME, -- Alternative to start_time for sunrise/sunset
  off_time TIME,
  
  -- Days (if weekly)
  days_of_week VARCHAR(50), -- JSON or comma-separated: 1,2,3,4,5,6,7
  
  -- Control Action
  action ENUM('on', 'off', 'dim', 'brightness_level') DEFAULT 'on',
  brightness_level INT DEFAULT 100, -- 0-100%
  
  -- Mode
  mode ENUM('manual', 'automatic', 'seasonal') DEFAULT 'automatic',
  use_sunrise_sunset TINYINT DEFAULT 1, -- Astronomical timer
  
  -- Status
  is_active TINYINT DEFAULT 1,
  last_execution DATETIME,
  next_execution DATETIME,
  
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  KEY idx_active_panel (is_active, feeder_panel_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS control_operations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  feeder_panel_id INT NOT NULL,
  
  -- Operation Details
  operation_type ENUM('on', 'off', 'dim', 'schedule', 'emergency') NOT NULL,
  action_value VARCHAR(50),
  
  -- Execution
  initiated_by INT, -- User ID who triggered
  initiated_timestamp DATETIME NOT NULL,
  execution_timestamp DATETIME,
  
  -- Status
  status ENUM('pending', 'executing', 'success', 'failed') DEFAULT 'pending',
  status_message TEXT,
  
  -- Feedback from Device
  device_acknowledgment_time DATETIME,
  actual_execution_time DATETIME,
  affected_light_count INT,
  
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  KEY idx_timestamp (initiated_timestamp),
  KEY idx_status (status),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 9. REPORTS & ENERGY ANALYSIS
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_energy_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  feeder_panel_id INT NOT NULL,
  city_id INT NOT NULL,
  ward_id INT,
  
  -- Report Date
  report_date DATE NOT NULL,
  
  -- Energy Consumption
  energy_consumed_kwh DECIMAL(10, 3),
  energy_consumed_kvah DECIMAL(10, 3),
  
  -- Operating Statistics
  lights_on_count INT,
  lights_off_count INT,
  lights_faulty_count INT,
  total_lights INT,
  uptime_percentage DECIMAL(5, 2),
  
  -- Financial Metrics
  energy_cost_estimated DECIMAL(10, 2),
  cost_per_unit DECIMAL(8, 2),
  
  -- Peak & Off-Peak
  peak_load_kw DECIMAL(10, 3),
  off_peak_load_kw DECIMAL(10, 3),
  average_load_kw DECIMAL(10, 3),
  
  -- Power Quality
  avg_power_factor DECIMAL(4, 3),
  avg_voltage DECIMAL(8, 2),
  avg_current DECIMAL(8, 2),
  
  -- Faults Occurred
  fault_count INT DEFAULT 0,
  critical_fault_count INT DEFAULT 0,
  
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  UNIQUE KEY unique_report (feeder_panel_id, report_date),
  KEY idx_date_city (report_date, city_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS monthly_summaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  city_id INT NOT NULL,
  ward_id INT,
  
  -- Month
  year INT,
  month INT,
  
  -- Energy
  total_energy_kwh DECIMAL(12, 3),
  total_energy_cost DECIMAL(12, 2),
  
  -- Lights
  total_lights INT,
  average_faulty_lights INT,
  
  -- Uptime
  average_uptime_percentage DECIMAL(5, 2),
  
  -- Savings (vs baseline)
  estimated_energy_saved_kwh DECIMAL(10, 3),
  estimated_cost_saved DECIMAL(10, 2),
  
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  UNIQUE KEY unique_summary (city_id, year, month),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 10. ASSET & INVENTORY MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS asset_inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_type ENUM('led_luminaire', 'smart_meter', 'feeder_panel', 'gsm_modem', 'contactor', 'mcb', 'battery', 'other') NOT NULL,
  asset_code VARCHAR(50) UNIQUE NOT NULL,
  asset_name VARCHAR(100),
  
  -- Location
  ward_id INT,
  zone_id INT,
  city_id INT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Status
  status ENUM('active', 'spare', 'defective', 'in_maintenance', 'decommissioned') DEFAULT 'active',
  
  -- Specifications
  model VARCHAR(100),
  manufacturer VARCHAR(100),
  serial_number VARCHAR(50),
  purchase_date DATE,
  installation_date DATE,
  warranty_expiry DATE,
  
  -- Operational Details
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  failure_count INT DEFAULT 0,
  
  -- Cost
  purchase_cost DECIMAL(10, 2),
  maintenance_cost DECIMAL(10, 2),
  
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  KEY idx_type_status (asset_type, status),
  KEY idx_city (city_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 11. MAINTENANCE & SERVICE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_inventory_id INT,
  feeder_panel_id INT,
  
  -- Request Details
  request_type ENUM('preventive', 'corrective', 'breakdown') DEFAULT 'corrective',
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  
  -- Assignment
  contractor_id INT,
  assigned_date DATETIME,
  
  -- Status
  status ENUM('open', 'assigned', 'in_progress', 'completed', 'closed') DEFAULT 'open',
  start_date DATETIME,
  completion_date DATETIME,
  completion_notes TEXT,
  
  -- Cost
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  
  FOREIGN KEY (asset_inventory_id) REFERENCES asset_inventory(id),
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  KEY idx_status (status),
  KEY idx_contractor (contractor_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 12. CONTRACTOR & PERFORMANCE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS contractors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contractor_name VARCHAR(150) NOT NULL,
  contractor_code VARCHAR(50) UNIQUE,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  
  -- Service Area
  assigned_wards TEXT, -- JSON array of ward IDs
  assigned_zones TEXT, -- JSON array of zone IDs
  
  -- Status
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  
  -- Performance Metrics
  total_jobs INT DEFAULT 0,
  completed_jobs INT DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  
  -- Contract Details
  contract_start_date DATE,
  contract_end_date DATE,
  contract_value DECIMAL(12, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS contractor_performance_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contractor_id INT NOT NULL,
  maintenance_request_id INT,
  
  -- Performance Metrics
  job_completion_date DATETIME,
  scheduled_completion_date DATETIME,
  days_variance INT, -- Positive = late, Negative = early
  
  -- Quality Rating
  quality_rating INT DEFAULT 5, -- 1-5 stars
  timeliness_rating INT DEFAULT 5,
  professionalism_rating INT DEFAULT 5,
  
  -- Comments
  feedback TEXT,
  
  FOREIGN KEY (contractor_id) REFERENCES contractors(id),
  FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id),
  KEY idx_contractor (contractor_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 13. USER MANAGEMENT & ACCESS CONTROL
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  role_description TEXT,
  
  -- Permissions (JSON)
  permissions JSON,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_role_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  city_id INT,
  ward_id INT,
  
  -- Scope of Access
  assigned_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATETIME,
  is_active TINYINT DEFAULT 1,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES user_roles(id),
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (ward_id) REFERENCES wards(id),
  KEY idx_user_active (user_id, is_active),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS access_audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50), -- feeder_panel, meter, schedule, etc.
  resource_id INT,
  
  -- Details
  action_details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Status
  status ENUM('success', 'failed') DEFAULT 'success',
  status_message TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  KEY idx_user_timestamp (user_id, created_at),
  KEY idx_action (action),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 14. GSM COMMUNICATION LOG (IMEI Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gsm_communication_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  feeder_panel_id INT NOT NULL,
  gsm_modem_id VARCHAR(50), -- IMEI
  
  -- Communication Details
  message_type ENUM('command', 'data_read', 'status_update', 'alert', 'response') NOT NULL,
  message_direction ENUM('send', 'receive') NOT NULL,
  message_content TEXT,
  
  -- Status
  delivery_status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
  delivery_timestamp DATETIME,
  
  -- Signal Quality
  signal_strength INT, -- 0-100%
  
  FOREIGN KEY (feeder_panel_id) REFERENCES feeder_panels(id),
  KEY idx_modem_timestamp (gsm_modem_id, created_at),
  KEY idx_panel_timestamp (feeder_panel_id, created_at),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- 15. SYSTEM CONFIGURATION & BACKUP
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value LONGTEXT,
  config_type ENUM('string', 'int', 'float', 'json', 'boolean') DEFAULT 'string',
  description TEXT,
  is_editable TINYINT DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS data_backup_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  backup_type ENUM('full', 'incremental', 'differential') DEFAULT 'full',
  backup_size BIGINT, -- bytes
  
  -- Status
  status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
  
  -- Details
  backup_location TEXT,
  error_message TEXT,
  
  -- Retention
  retention_until DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_energy_params_meter_date ON energy_parameters(smart_meter_id, reading_timestamp DESC);
CREATE INDEX idx_energy_params_panel_date ON energy_parameters(feeder_panel_id, reading_timestamp DESC);
CREATE INDEX idx_fault_logs_active_type ON fault_logs(fault_active, fault_type);
CREATE INDEX idx_control_ops_panel_date ON control_operations(feeder_panel_id, initiated_timestamp DESC);
CREATE INDEX idx_daily_reports_date ON daily_energy_reports(report_date DESC);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);
CREATE INDEX idx_audit_log_user_date ON access_audit_log(user_id, created_at DESC);

-- ============================================================================
-- DEFAULT CONFIGURATION ENTRIES
-- ============================================================================

INSERT IGNORE INTO system_config (config_key, config_value, config_type, description) VALUES
('min_voltage_threshold', '200', 'int', 'Minimum voltage threshold (V) - Alert if below'),
('max_voltage_threshold', '280', 'int', 'Maximum voltage threshold (V) - Alert if above'),
('min_current_threshold', '5', 'int', 'Minimum current threshold (A)'),
('max_current_threshold', '80', 'int', 'Maximum current threshold (A) - Overload alert'),
('min_power_factor', '0.85', 'float', 'Minimum acceptable power factor'),
('data_retention_days', '730', 'int', '24 months data retention'),
('sms_alert_recipients', '5', 'int', 'Number of SMS recipients per alert'),
('battery_backup_hours', '12', 'int', 'Minimum battery backup (hours)'),
('default_update_interval', '15', 'int', 'Default data update interval (minutes)'),
('gis_map_center_lat', '28.7041', 'float', 'Default map center latitude'),
('gis_map_center_lng', '77.1025', 'float', 'Default map center longitude'),
('enable_self_healing', '1', 'boolean', 'Enable CCMS self-healing'),
('self_healing_timeout', '86400', 'int', 'Self-healing timeout (seconds - 24 hrs)');


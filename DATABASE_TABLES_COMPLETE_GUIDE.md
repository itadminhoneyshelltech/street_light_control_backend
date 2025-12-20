# Street Light Control System - Complete Database Guide

**Date:** December 17, 2025  
**Total Tables:** 14  
**Database:** street_light_control  
**Engine:** InnoDB with UTF8MB4

---

## 📊 Database Overview

### All Tables in System
```
1. users                    - User accounts and authentication
2. street_lights            - Main device registry
3. energy_parameters        - Energy readings and consumption
4. battery_status           - Battery tracking
5. control_logs             - Command audit trail
6. alerts                   - Alert/issue tracking
7. city_summary             - City-level statistics
8. schedules                - Automation schedules
9. smart_meters             - Smart meter data
10. gsm_communication_log   - GSM communication history
11. device_commands         - Command queue (NEW)
12. device_logs             - Device diagnostics (NEW)
13. firmware_versions       - Firmware versions (NEW)
14. device_health_log       - Device health history (NEW)
```

---

## 🆕 NEW TABLES CREATED (4 tables)

### TABLE 1: device_commands

**Purpose:** Queue for commands that need to be sent to street light devices

**When it's used:**
- Admin sends "Turn ON" command from dashboard
- Command is stored in this queue
- Device polls this table to fetch pending commands
- Device executes command and marks it as done

**Structure:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| id | INT AUTO_INCREMENT | Unique command ID | 1, 2, 3 |
| light_id | VARCHAR(100) | Which device the command is for | IMEI:351234567890123 |
| command_type | ENUM | Type of command | power_control, brightness_control, schedule_update, maintenance, firmware_update |
| action | VARCHAR(50) | What action to take | "on", "off", "set", "execute" |
| brightness_level | INT | Brightness value (0-100) | 50, 75, 100 |
| schedule | JSON | Schedule details | {"start": "18:00", "end": "06:00"} |
| priority | ENUM | How urgent | critical > high > normal > low |
| requested_by | INT | Which user made the request | 1 (admin user ID) |
| executed | BOOLEAN | Has this command been done? | 0 (pending), 1 (done) |
| executed_at | TIMESTAMP | When was it executed? | 2025-12-17 13:30:45 |
| requested_at | TIMESTAMP | When was it created? | 2025-12-17 13:25:00 |

**Example Data:**
```
id=1, light_id='SL001', command_type='power_control', action='on', 
priority='high', executed=0, requested_at='2025-12-17 10:30:00'
```

**Data Flow:**
```
Admin clicks "Turn ON"
    ↓
Frontend calls: POST /lights/control {lightId: "SL001", action: "on"}
    ↓
Backend inserts into device_commands table
    ↓
Device polls: GET /device/commands?device_id=SL001
    ↓
Backend returns: [{command_id: 1, action: "on", priority: "high"}]
    ↓
Device executes: Power supply ON
    ↓
Device reports: POST /device/command-ack {command_id: 1, status: "executed"}
    ↓
Backend updates: device_commands SET executed=1 WHERE id=1
    ↓
Command is marked COMPLETE ✅
```

**Indexes (for fast queries):**
- `idx_light_id` - Fast lookup by device
- `idx_executed` - Find pending commands (executed=0)
- `idx_requested_at` - Find recent commands

---

### TABLE 2: device_logs

**Purpose:** Store diagnostic messages from street light devices

**When it's used:**
- Device sends error/warning/info messages
- Used for troubleshooting device issues
- Historical record of device behavior

**Structure:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| id | INT AUTO_INCREMENT | Log entry ID | 1, 2, 3 |
| light_id | VARCHAR(100) | Which device | IMEI:351234567890123 |
| log_level | ENUM | Severity level | debug, info, warning, error, critical |
| log_message | TEXT | The actual message | "GSM signal lost", "Battery low warning" |
| device_timestamp | TIMESTAMP | When device recorded it | 2025-12-17 10:15:30 |
| received_at | TIMESTAMP | When server received it | 2025-12-17 10:15:35 |

**Example Data:**
```
id=1, light_id='SL001', log_level='warning', 
log_message='GSM signal strength dropped below threshold',
device_timestamp='2025-12-17 10:15:30'
```

**Data Flow:**
```
Device experiences problem
    ↓
Device creates log entry
    ↓
Device sends: POST /device/logs {device_id: "SL001", logs: [{level: "warning", message: "..."}]}
    ↓
Backend inserts into device_logs table
    ↓
Admin can view logs in Dashboard > Device Diagnostics
```

**Typical Log Messages:**
- **DEBUG:** "Checking battery voltage: 12.5V"
- **INFO:** "Scheduled turn ON at 18:00"
- **WARNING:** "Signal strength: -95 dBm (weak)"
- **ERROR:** "Failed to connect to MQTT broker"
- **CRITICAL:** "Battery voltage: 8.0V (CRITICAL)"

---

### TABLE 3: firmware_versions

**Purpose:** Track available firmware versions for OTA (Over-The-Air) updates

**When it's used:**
- Device asks: "Is there a new firmware?"
- Backend checks this table for latest version
- Device downloads and installs if newer version exists

**Structure:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| id | INT AUTO_INCREMENT | Version ID | 1, 2, 3 |
| version | VARCHAR(20) UNIQUE | Version number | 2.2.0, 2.3.0, 3.0.0 |
| release_date | DATE | When released | 2025-12-15 |
| download_url | VARCHAR(255) | URL to download | /firmware/v2.2.0/device-fw.bin |
| changelog | TEXT | What changed | "Bug fixes and performance improvements" |
| is_latest | BOOLEAN | Is this the newest? | 0 or 1 |
| created_at | TIMESTAMP | When added to system | 2025-12-15 10:00:00 |

**Example Data:**
```
id=1, version='2.2.0', release_date='2025-12-15', 
is_latest=1, changelog='Bug fixes, improved battery efficiency'
```

**Data Flow:**
```
Device at startup or periodically asks: "What's the latest firmware?"
    ↓
Device sends: GET /device/firmware?device_id=SL001&version=2.1.0
    ↓
Backend queries: SELECT * FROM firmware_versions WHERE is_latest=1
    ↓
Backend returns: version=2.2.0 (newer than 2.1.0)
    ↓
Device downloads from download_url
    ↓
Device installs new firmware
    ↓
Device reboots with new version
    ↓
Admin can see: Device now running v2.2.0 ✅
```

---

### TABLE 4: device_health_log

**Purpose:** Historical record of device health and connectivity status

**When it's used:**
- Track device availability over time
- Generate uptime reports
- Identify problematic devices
- Historical analysis

**Structure:**

| Column | Type | Purpose | Example |
|--------|------|---------|---------|
| id | INT AUTO_INCREMENT | Log entry ID | 1, 2, 3 |
| light_id | VARCHAR(100) | Which device | IMEI:351234567890123 |
| status | ENUM | Health status | healthy, degraded, offline, error |
| signal_strength | INT | GSM signal (dBm) | -75, -95, -105 |
| battery_percentage | INT | Battery charge (0-100) | 85, 50, 15 |
| recorded_at | TIMESTAMP | When recorded | 2025-12-17 10:30:00 |

**Example Data:**
```
id=1, light_id='SL001', status='healthy', 
signal_strength=-85, battery_percentage=92, recorded_at='2025-12-17 10:30:00'
```

**Data Flow:**
```
Every hour (or on schedule):
    ↓
Backend checks: SELECT last_status_change FROM street_lights WHERE light_id='SL001'
    ↓
If last update < 2 minutes: status='healthy'
If last update < 1 minute: status='degraded'
If last update > 2 minutes: status='offline'
    ↓
Backend inserts record into device_health_log
    ↓
Admin dashboard shows: "SL001: HEALTHY (92% battery, -85 dBm signal)"
    ↓
Over time, creates historical record for uptime reports
```

**Status Meanings:**
- **HEALTHY:** Device responding normally, battery > 50%, signal strong
- **DEGRADED:** Device responding slowly, battery 20-50%, signal weak
- **OFFLINE:** No response for > 2 minutes
- **ERROR:** Device sent error alert

---

## 📚 EXISTING TABLES (10 tables)

### TABLE 5: users

**Purpose:** User accounts and authentication

**Usage:**
- Login/Register
- User roles (admin, operator, viewer)
- Access control

**Key Columns:** id, email, password_hash, role, city, created_at

---

### TABLE 6: street_lights

**Purpose:** Main device registry - the core of the system

**Usage:**
- Every street light device is registered here
- Stores device configuration
- Current status and settings

**Key Columns:**
- light_id (unique device identifier)
- name, city, coordinates
- status (on/off)
- brightness_level
- battery_percentage
- last_status_change
- gsm_imei (device phone number)
- communication_type (GSM/MQTT)

**Example:**
```
light_id='IMEI:351234567890123'
name='Street Light SL001'
city='Delhi'
latitude=28.6139, longitude=77.2090
status='on'
brightness_level=85
battery_percentage=92
gsm_imei='351234567890123'
```

---

### TABLE 7: energy_parameters

**Purpose:** Store energy consumption readings

**Usage:**
- Track power usage per light
- Calculate energy costs
- Identify high consumers
- Generate energy reports

**Key Columns:**
- light_id
- timestamp
- phase_a_voltage (230V)
- phase_a_current (amps)
- total_active_power (watts)
- frequency (50 Hz)
- cumulative_kwh (total energy)

---

### TABLE 8: battery_status

**Purpose:** Track battery health and charging

**Usage:**
- Monitor backup battery capacity
- Predict when battery will fail
- Alert on low battery
- Maintenance scheduling

**Key Columns:**
- light_id
- current_charge_percentage (0-100)
- status (full, good, warning, critical)
- backup_hours_available

---

### TABLE 9: control_logs

**Purpose:** Audit trail of all commands and actions

**Usage:**
- Track who did what and when
- Compliance and accountability
- Troubleshooting

**Key Columns:**
- light_id
- action (on/off/set brightness)
- performed_by (user ID or "device_auto")
- control_type (manual/automatic)
- previous_status / new_status
- created_at

---

### TABLE 10: alerts

**Purpose:** Store alerts and issues

**Usage:**
- Track problems (battery low, offline, error)
- Alert admin when issues occur
- Historical issue tracking

**Key Columns:**
- light_id
- alert_type (battery_low, offline, error, etc)
- severity (critical, high, medium, low)
- message
- resolved (0/1)
- created_at

---

### TABLE 11: city_summary

**Purpose:** City-level statistics cache

**Usage:**
- Fast dashboard queries
- City overview stats
- Performance optimization

**Key Columns:**
- city
- total_lights
- lights_on / lights_off
- lights_in_error
- average_brightness
- average_battery
- cumulative_energy_today

---

### TABLE 12: schedules

**Purpose:** Automation rules for lights

**Usage:**
- Turn lights on at sunset
- Turn lights off at sunrise
- Dimming schedules
- Maintenance windows

**Key Columns:**
- light_id / city
- start_time, end_time
- action, brightness_level
- schedule_type (daily, weekly, monthly)

---

### TABLE 13: smart_meters

**Purpose:** Smart meter readings (CCMS integration)

**Usage:**
- Energy monitoring per zone
- Three-phase power tracking
- Total consumption by area

**Key Columns:**
- meter_id
- city / zone
- voltage, current, frequency
- cumulative_energy
- last_reading

---

### TABLE 14: gsm_communication_log

**Purpose:** GSM connectivity history

**Usage:**
- Track GSM signal strength
- Troubleshoot connectivity issues
- Network quality analysis

**Key Columns:**
- light_id
- signal_strength (dBm)
- connection_status
- last_connected
- error_message

---

## 🔄 Complete Data Flow Example

### Scenario: Admin Controls a Light

```
STEP 1: Admin Opens Dashboard
    └─ Dashboard loads from: SELECT * FROM street_lights WHERE city='Delhi' LIMIT 10
    └─ Shows: "Street Light SL001 - Status: OFF - Battery: 92%"

STEP 2: Admin Clicks "Turn ON"
    └─ Frontend sends: POST /lights/control {lightId: "SL001", action: "on"}
    └─ Backend inserts into device_commands table:
       - light_id='SL001'
       - command_type='power_control'
       - action='on'
       - priority='high'
       - executed=0

STEP 3: Device Polls for Commands
    └─ Device sends: GET /device/commands?device_id=SL001
    └─ Backend queries: SELECT * FROM device_commands WHERE light_id='SL001' AND executed=0
    └─ Returns: [{command_id: 1, action: "on", priority: "high"}]

STEP 4: Device Executes Command
    └─ Device powers ON
    └─ Device measures voltage, current, battery, temperature
    └─ Device sends: POST /device/status
       - status: "on"
       - brightness: 100
       - battery_percentage: 92
       - energy: {voltage: 230.5, current: 0.85, power: 195.9}

STEP 5: Backend Updates Tables
    └─ Updates street_lights: status='on', brightness_level=100, last_status_change=NOW()
    └─ Inserts into energy_parameters: voltage, current, power, cumulative_kwh
    └─ Updates battery_status: charge_percentage=92, status='full'
    └─ Inserts into control_logs: action='on', performed_by='device_auto'

STEP 6: Device Acknowledges Command
    └─ Device sends: POST /device/command-ack {command_id: 1, status: "executed"}
    └─ Backend updates: device_commands SET executed=1, executed_at=NOW() WHERE id=1
    └─ Inserts into control_logs: action='on', performed_by='device_auto', status='executed'

STEP 7: Backend Updates Health
    └─ Records in device_health_log: status='healthy', signal_strength=-85, battery_percentage=92
    └─ Updates city_summary: total_lights_on += 1

STEP 8: Admin Dashboard Updates
    └─ Frontend refreshes
    └─ Shows: "Street Light SL001 - Status: ON - Battery: 92% ✅"
    └─ Loads from all relevant tables and displays live data
```

---

## 📈 Query Examples

### Find All Devices That Are Offline
```sql
SELECT light_id, name, last_status_change 
FROM street_lights 
WHERE last_status_change < DATE_SUB(NOW(), INTERVAL 2 MINUTE);
```

### Get Pending Commands for Device
```sql
SELECT id, command_type, action, brightness_level, priority 
FROM device_commands 
WHERE light_id='SL001' AND executed=0 
ORDER BY priority DESC;
```

### Get Latest Device Health
```sql
SELECT light_id, status, signal_strength, battery_percentage, recorded_at 
FROM device_health_log 
ORDER BY recorded_at DESC 
LIMIT 1000;
```

### Get Energy Consumption for Last 24 Hours
```sql
SELECT light_id, SUM(cumulative_kwh) as total_energy 
FROM energy_parameters 
WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY) 
GROUP BY light_id;
```

### Get Device Diagnostic Logs
```sql
SELECT light_id, log_level, log_message, device_timestamp 
FROM device_logs 
WHERE light_id='SL001' AND log_level IN ('warning', 'error', 'critical') 
ORDER BY device_timestamp DESC 
LIMIT 50;
```

### Get Devices with Low Battery
```sql
SELECT light_id, name, battery_percentage 
FROM street_lights 
WHERE battery_percentage < 20 
ORDER BY battery_percentage ASC;
```

### Get Today's Commands Summary
```sql
SELECT light_id, command_type, COUNT(*) as total, 
       SUM(CASE WHEN executed=1 THEN 1 ELSE 0 END) as completed,
       SUM(CASE WHEN executed=0 THEN 1 ELSE 0 END) as pending
FROM device_commands 
WHERE DATE(requested_at) = CURDATE()
GROUP BY light_id, command_type;
```

---

## 🔐 Relationships (Foreign Keys)

```
device_commands.light_id ──────→ street_lights.light_id
device_commands.requested_by ──→ users.id

device_logs.light_id ──────────→ street_lights.light_id

device_health_log.light_id ────→ street_lights.light_id

energy_parameters.light_id ────→ street_lights.light_id

battery_status.light_id ───────→ street_lights.light_id

control_logs.light_id ─────────→ street_lights.light_id

alerts.light_id ───────────────→ street_lights.light_id

schedules.light_id ────────────→ street_lights.light_id (optional)
```

---

## 📊 Data Volume Estimates

### Per 1,000 Devices Over 1 Year

| Table | Records/Day | Records/Year | Storage |
|-------|-------------|--------------|---------|
| device_commands | 1,000 | 365,000 | ~50 MB |
| device_logs | 50,000 | 18.25M | ~2 GB |
| device_health_log | 24,000 | 8.76M | ~800 MB |
| energy_parameters | 2.88M | 1.05B | ~50 GB |
| control_logs | 1,000 | 365,000 | ~50 MB |
| alerts | 5,000 | 1.8M | ~200 MB |
| **TOTAL** | **2.97M** | **1.07B** | **~53 GB** |

---

## ✅ Summary

**Key Points:**

1. **device_commands** - Queues commands for devices ⏳
2. **device_logs** - Stores diagnostic messages 📝
3. **firmware_versions** - Tracks available firmware 🔄
4. **device_health_log** - Historical health records 📊
5. **All other tables** - Support core functionality 🔧

**The complete system handles:**
- Device registration & configuration ✅
- Command queuing & execution ✅
- Status monitoring & health checks ✅
- Energy consumption tracking ✅
- Alert management ✅
- Audit trails & logging ✅
- Automation schedules ✅
- Firmware updates ✅

All tables work together to create a complete street light management system! 🚀

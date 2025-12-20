# 📋 Database Tables - Quick Reference Card

## 🎯 At a Glance

**Total Tables:** 14 (4 NEW + 10 existing)  
**Database:** street_light_control  
**Engine:** InnoDB  

---

## 🆕 4 NEW TABLES

### 1. **device_commands** (Command Queue)
```
┌─────────────────────────────────────────────────────┐
│ PURPOSE: Store commands for devices to execute      │
│ RECORDS: ~1,000 per day                             │
│                                                      │
│ KEY FIELDS:                                         │
│  • light_id      → Which device                     │
│  • command_type  → power_control, brightness_..     │
│  • action        → "on", "off", "set"              │
│  • priority      → critical > high > normal > low   │
│  • executed      → 0 (pending), 1 (done)            │
│                                                      │
│ FLOW:                                               │
│  Admin sends command                                │
│    ↓                                                 │
│  INSERT into device_commands                        │
│    ↓                                                 │
│  Device polls: GET /device/commands                 │
│    ↓                                                 │
│  Device executes                                    │
│    ↓                                                 │
│  UPDATE executed = 1                                │
└─────────────────────────────────────────────────────┘
```

---

### 2. **device_logs** (Device Diary)
```
┌─────────────────────────────────────────────────────┐
│ PURPOSE: Store device messages (errors/warnings)    │
│ RECORDS: ~50,000 per day                            │
│                                                      │
│ KEY FIELDS:                                         │
│  • light_id      → Which device                     │
│  • log_level     → debug, info, warning, error,     │
│                   critical                          │
│  • log_message   → "Battery low", "Signal weak"    │
│  • device_timestamp → When device recorded it       │
│  • received_at   → When server received it          │
│                                                      │
│ FLOW:                                               │
│  Device experiences issue                           │
│    ↓                                                 │
│  Device creates log entry                           │
│    ↓                                                 │
│  POST /device/logs                                  │
│    ↓                                                 │
│  INSERT into device_logs                            │
│    ↓                                                 │
│  Admin sees in Dashboard                            │
└─────────────────────────────────────────────────────┘
```

---

### 3. **firmware_versions** (App Store)
```
┌─────────────────────────────────────────────────────┐
│ PURPOSE: Manage firmware versions for OTA updates   │
│ RECORDS: ~20 versions                               │
│                                                      │
│ KEY FIELDS:                                         │
│  • version       → "2.1.0", "2.2.0" (UNIQUE)       │
│  • is_latest     → 1 for newest version            │
│  • download_url  → Path to firmware file            │
│  • changelog     → "Bug fixes, performance..."     │
│  • release_date  → When released                    │
│                                                      │
│ FLOW:                                               │
│  Device checks: "Is my firmware old?"               │
│    ↓                                                 │
│  GET /device/firmware?version=2.1.0                 │
│    ↓                                                 │
│  Backend queries WHERE is_latest=1                  │
│    ↓                                                 │
│  Compares: 2.1.0 < 2.2.0 → UPDATE NEEDED          │
│    ↓                                                 │
│  Returns download URL                               │
│    ↓                                                 │
│  Device downloads & installs                        │
└─────────────────────────────────────────────────────┘
```

---

### 4. **device_health_log** (Health Records)
```
┌─────────────────────────────────────────────────────┐
│ PURPOSE: Historical device health snapshots         │
│ RECORDS: ~24,000 per day                            │
│                                                      │
│ KEY FIELDS:                                         │
│  • light_id      → Which device                     │
│  • status        → healthy ✅, degraded ⚠️,        │
│                   offline ❌, error 🔴              │
│  • signal_strength → GSM signal (dBm)               │
│  • battery_percentage → 0-100%                      │
│  • recorded_at   → Timestamp                        │
│                                                      │
│ FLOW (Hourly):                                      │
│  Backend health check task runs                     │
│    ↓                                                 │
│  Check each device status                           │
│    ↓                                                 │
│  If last update < 1 min: status = healthy ✅       │
│  If 1-2 min: status = degraded ⚠️                   │
│  If > 2 min: status = offline ❌                     │
│    ↓                                                 │
│  INSERT new record                                  │
│    ↓                                                 │
│  Over time: Create uptime report                    │
└─────────────────────────────────────────────────────┘
```

---

## ✅ 10 EXISTING TABLES

| # | Table | Purpose | Key Fields |
|---|-------|---------|-----------|
| 5 | **users** | Authentication | id, email, password_hash, role |
| 6 | **street_lights** | Device registry | light_id, name, city, latitude, longitude, status, brightness, battery% |
| 7 | **energy_parameters** | Power tracking | light_id, timestamp, voltage, current, power, frequency, cumulative_kwh |
| 8 | **battery_status** | Backup battery | light_id, charge%, status, backup_hours |
| 9 | **control_logs** | Audit trail | light_id, action, performed_by, previous_status, new_status |
| 10 | **alerts** | Issue tracking | light_id, alert_type, severity, message, resolved |
| 11 | **city_summary** | Statistics | city, total_lights, lights_on, lights_off, avg_brightness |
| 12 | **schedules** | Automation | light_id, start_time, end_time, action, schedule_type |
| 13 | **smart_meters** | Energy monitoring | meter_id, city, voltage, current, frequency, cumulative_energy |
| 14 | **gsm_communication** | Network history | light_id, signal_strength, connection_status, last_connected |

---

## 📊 Data Volume

```
FOR 1,000 DEVICES OVER 1 YEAR:

                        Daily Records    Annual Records    Storage
device_commands         1,000            365,000          50 MB
device_logs             50,000           18.25M           2 GB
device_health_log       24,000           8.76M            800 MB
energy_parameters       2.88M            1.05B            50 GB
─────────────────────────────────────────────────────────
TOTAL                   2.97M            1.07B            53 GB
```

---

## 🔗 Relationships

```
All 4 new tables connect to street_lights via light_id:

street_lights
    ↑
    ├─ device_commands (many commands per device)
    ├─ device_logs (many logs per device)
    ├─ device_health_log (many health records per device)
    └─ (relationships also to all 10 existing tables)
```

---

## 🎬 Complete Workflow

```
MORNING SEQUENCE (6:00 AM to 6:30 AM):

6:00 AM ──→ Device boots
            ├─ POST /device/configure
            └─ Inserted into: street_lights

6:05 AM ──→ Device sends first status
            ├─ POST /device/status
            └─ Inserted into: energy_parameters, battery_status

6:30 AM ──→ Backend health check (first hour)
            ├─ INSERT into device_health_log
            └─ Status: "healthy" ✅

────────────────────────────────────────────────

DAYTIME SEQUENCE (10:00 AM to 2:00 PM):

10:00 AM → Admin sends: "Turn brightness to 50%"
            ├─ INSERT into device_commands
            └─ executed = 0 (waiting)

10:01 AM → Device polls GET /device/commands
            ├─ Receives command
            └─ Executes brightness change

10:01:15 → Device acknowledges command
            ├─ POST /device/command-ack
            ├─ UPDATE device_commands (executed=1)
            └─ INSERT into control_logs

2:00 PM  → Device checks firmware
            ├─ GET /device/firmware
            ├─ Query firmware_versions (is_latest=1)
            └─ If newer: Download & install

────────────────────────────────────────────────

CONTINUOUS (Every 30s):

Device sends status →
├─ POST /device/status
├─ UPDATE street_lights
├─ INSERT energy_parameters
└─ UPDATE battery_status

────────────────────────────────────────────────

HOURLY:

Backend health check task →
├─ Check all device statuses
├─ Calculate health score
├─ INSERT device_health_log
└─ Send alerts if offline

────────────────────────────────────────────────

DAILY (Midnight):

Admin generates report →
├─ SELECT FROM device_commands (commands sent)
├─ SELECT FROM device_logs (errors/warnings)
├─ SELECT FROM device_health_log (uptime %)
├─ SELECT FROM energy_parameters (total usage)
└─ Generate PDF report
```

---

## 💡 Example Queries

```sql
-- Get all pending commands for device
SELECT * FROM device_commands 
WHERE light_id='SL001' AND executed=0;

-- Get device error logs
SELECT * FROM device_logs 
WHERE light_id='SL001' AND log_level IN ('error','critical')
ORDER BY device_timestamp DESC LIMIT 100;

-- Check if firmware update needed
SELECT * FROM firmware_versions WHERE is_latest=1;

-- Get device health history
SELECT status, COUNT(*) as occurrences 
FROM device_health_log 
WHERE light_id='SL001' AND recorded_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY status;

-- Get devices currently offline
SELECT light_id, last_status_change
FROM street_lights
WHERE last_status_change < DATE_SUB(NOW(), INTERVAL 2 MINUTE);
```

---

## ✨ Summary

**These 4 tables enable:**
- ✅ Bidirectional communication (commands in, status out)
- ✅ Device troubleshooting (via logs)
- ✅ Automatic updates (via firmware versions)
- ✅ Performance monitoring (via health logs)
- ✅ Historical analysis (all tables are time-stamped)

**Complete system supports:**
- 🌍 1,000+ devices simultaneously
- 📊 Real-time monitoring and control
- 📈 Historical reporting and trending
- 🔐 Audit trails for compliance
- ⚡ Energy tracking and optimization

---

## 📚 Full Documentation

For detailed information, see:
- `DATABASE_TABLES_COMPLETE_GUIDE.md` - Full technical guide
- `DATABASE_VISUAL_GUIDE.md` - Visual workflows
- `DATABASE_SIMPLE_GUIDE.md` - Easy explanation
- `DATABASE_ER_DIAGRAM.md` - Relationships

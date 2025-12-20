# Simple Database Guide - Easy Explanation

## 📋 What Are Tables?

Think of database tables like **Excel sheets**. Each row is a record, each column is a field.

---

## 🆕 4 NEW TABLES (For Device Communication)

### 1️⃣ **device_commands** Table

**What is it?** 
- A TO-DO list for devices
- Commands waiting to be executed

**Columns (Fields):**
| Field | Example | Meaning |
|-------|---------|---------|
| id | 1 | Unique command ID |
| light_id | SL001 | Which device |
| command_type | power_control | What type of command |
| action | "on" | What to do |
| brightness_level | 75 | How bright (if brightness command) |
| priority | high | How urgent |
| executed | 0 | Has it been done? 0=no, 1=yes |
| requested_at | 2025-12-17 10:30 | When was it created |
| executed_at | NULL | When was it done |

**Real Example:**
```
Admin clicks "Turn ON Light SL001"
    ↓
New row added to device_commands:
┌─────────────────────────────────────┐
│ id=1, light_id='SL001'              │
│ action='on', priority='high'         │
│ executed=0 (not done yet)            │
└─────────────────────────────────────┘
    ↓
Device polls: "Any commands for me?"
    ↓
Backend: "Yes! Turn ON!"
    ↓
Device executes: Power turns ON
    ↓
Device reports: "Done!"
    ↓
Backend updates: executed=1
```

---

### 2️⃣ **device_logs** Table

**What is it?**
- A diary/notebook for devices
- Records what happened (errors, warnings, info)

**Columns:**
| Field | Example | Meaning |
|-------|---------|---------|
| id | 1 | Log entry ID |
| light_id | SL001 | Which device |
| log_level | warning | How serious (debug/info/warning/error/critical) |
| log_message | "Battery low: 8%" | What happened |
| device_timestamp | 2025-12-17 10:15 | When device recorded it |
| received_at | 2025-12-17 10:15:05 | When server received it |

**Real Example:**
```
Device experiences problem:
  - Battery drops below 20%
  - Creates log entry

Device sends: "I have a message for you"
    ↓
Backend receives and stores in device_logs:
┌─────────────────────────────────────┐
│ light_id='SL001'                    │
│ log_level='warning'                  │
│ log_message='Battery at 15%'         │
│ device_timestamp='10:15:00'          │
└─────────────────────────────────────┘
    ↓
Admin sees in Dashboard: "SL001 has warning: Battery low"
```

**Log Levels Explained:**
- 🔧 **DEBUG** - Technical info (developers only)
- ℹ️ **INFO** - Normal operation ("Started successfully")
- ⚠️ **WARNING** - Something needs attention ("Battery low")
- ❌ **ERROR** - Something went wrong ("Failed to connect")
- 🔴 **CRITICAL** - Urgent attention needed ("Battery dying: 5%")

---

### 3️⃣ **firmware_versions** Table

**What is it?**
- Like an App Store for devices
- List of available software versions

**Columns:**
| Field | Example | Meaning |
|-------|---------|---------|
| id | 1 | Version ID |
| version | 2.2.0 | Version number |
| release_date | 2025-12-15 | When released |
| download_url | /firmware/v2.2.0/bin | Where to download |
| changelog | "Bug fixes" | What changed |
| is_latest | 1 | Is this the newest? 1=yes |

**Real Example:**
```
Device checks: "Is my software old?"
    ↓
Device sends: "I'm running v2.1.0, is there newer?"
    ↓
Backend checks firmware_versions table:
┌─────────────────────────────────────┐
│ version='2.2.0'                     │
│ is_latest=1 (This is the newest!)   │
│ Your version (2.1.0) < Latest (2.2) │
│ UPDATE NEEDED!                      │
└─────────────────────────────────────┘
    ↓
Backend: "Yes! Download from /firmware/v2.2.0/bin"
    ↓
Device downloads v2.2.0
    ↓
Device installs it
    ↓
Device reboots
    ↓
Device now running v2.2.0 ✅
```

---

### 4️⃣ **device_health_log** Table

**What is it?**
- Like a health check-up record
- Snapshots of device condition over time

**Columns:**
| Field | Example | Meaning |
|-------|---------|---------|
| id | 1000 | Log entry ID |
| light_id | SL001 | Which device |
| status | healthy | Device condition (healthy/degraded/offline/error) |
| signal_strength | -85 | GSM signal strength (dBm) |
| battery_percentage | 92 | Battery charge level (0-100) |
| recorded_at | 2025-12-17 10:00 | When recorded |

**Real Example:**
```
Backend hourly health check:

HOUR 10:00
Device last updated: 10:00:00 (just now)
Result: ✅ HEALTHY
    ↓
    Inserts into device_health_log:
    ┌─────────────────────────────────────┐
    │ light_id='SL001'                    │
    │ status='healthy' ✅                  │
    │ signal_strength=-85 (good)          │
    │ battery_percentage=92 (excellent)   │
    │ recorded_at=2025-12-17 10:00:00     │
    └─────────────────────────────────────┘

HOUR 11:00
Device last updated: 10:55:00 (5 min ago)
Result: ⚠️ DEGRADED (connection slow)
    ↓
    Inserts into device_health_log:
    ┌─────────────────────────────────────┐
    │ light_id='SL001'                    │
    │ status='degraded' ⚠️                 │
    │ signal_strength=-105 (weak)         │
    │ battery_percentage=75 (good)        │
    │ recorded_at=2025-12-17 11:00:00     │
    └─────────────────────────────────────┘

HOUR 12:00
Device last updated: 11:00:00 (60 min ago)
Result: ❌ OFFLINE (no connection)
    ↓
    Inserts into device_health_log:
    ┌─────────────────────────────────────┐
    │ light_id='SL001'                    │
    │ status='offline' ❌                  │
    │ signal_strength=NULL                │
    │ battery_percentage=NULL             │
    │ recorded_at=2025-12-17 12:00:00     │
    └─────────────────────────────────────┘

Over time: Creates historical record
Can generate UPTIME REPORT:
  - 10:00-11:00: 100% healthy
  - 11:00-12:00: 100% degraded
  - 12:00-onwards: offline
  = Overall: Device having issues
```

---

## 📊 How They All Work Together

```
DAY IN THE LIFE OF A STREET LIGHT:

6:00 AM
└─ Device powers on
   └─ device_commands: No commands (empty)
   └─ device_logs: "Device boot successful" (info)
   └─ device_health_log: "healthy" (first check)

6:30 AM
└─ Device sends periodic status
   └─ device_logs: "Voltage: 230V, Current: 0.5A" (info)
   └─ device_health_log: "healthy" (updated)

10:00 AM
└─ Admin sends command: "Brightness 50%"
   └─ device_commands: New row added (brightness=50, executed=0)

10:01 AM
└─ Device polls for commands
   └─ Backend: "You have a command: Set brightness 50%"
   └─ Device executes
   └─ device_commands: Updated (executed=1, executed_at=10:01)
   └─ device_logs: "Brightness changed to 50%" (info)

2:00 PM
└─ Device checks firmware
   └─ firmware_versions: "Latest is v2.2.0"
   └─ Device version: v2.1.0
   └─ Backend: "Update available!"
   └─ Device downloads and installs
   └─ device_logs: "Firmware updated to v2.2.0" (info)

6:00 PM
└─ Battery drops to 15%
   └─ device_logs: "Battery critical: 15%" (critical)
   └─ Also stored in alerts table (admin gets notification)

Every hour:
└─ Backend health check
   └─ device_health_log: New record with current status

End of day (11:59 PM):
└─ Admin views dashboard
   └─ Queries all tables:
      - Commands sent today: 5
      - Successful: 5, Failed: 0
      - Errors/warnings: 2
      - Battery status: 15% (critical)
      - Last seen: 23:55:00 (healthy)
      - Firmware version: v2.2.0 (latest) ✅
```

---

## 🎯 Quick Answer: What Each Table Does

| Table | Simple Answer | When You Need It |
|-------|---------------|-----------------| 
| **device_commands** | "To-do list for devices" | When admin sends command |
| **device_logs** | "Device diary/notebook" | When troubleshooting problems |
| **firmware_versions** | "Software version library" | When updating device software |
| **device_health_log** | "Health check-up records" | When generating reports/monitoring |

---

## ✅ Plus 10 Other Tables

The system also has 10 more tables for:
- **users** - User accounts
- **street_lights** - Device registry
- **energy_parameters** - Power usage
- **battery_status** - Backup power
- **control_logs** - Who did what when
- **alerts** - Problem notifications
- **city_summary** - Statistics
- **schedules** - Automation rules
- **smart_meters** - Energy monitoring
- **gsm_communication_log** - Network history

**Total = 14 Tables = Complete System** ✅

---

## 🔑 Key Relationships

```
Every entry in:
  - device_commands → linked to street_lights table (light_id)
  - device_logs → linked to street_lights table (light_id)
  - device_health_log → linked to street_lights table (light_id)

This means: All records can be traced back to which device they belong to
```

---

## 📈 What Happens With Data Over Time

```
Day 1:  1,000 devices → ~3 million records
Day 7:  1,000 devices → ~21 million records
Month:  1,000 devices → ~90 million records
Year:   1,000 devices → ~1 billion records

Storage needed: ~50 GB per year for 1,000 devices
```

---

## ✨ Bottom Line

These 4 tables + 10 existing tables = **Complete Smart City Light System**

✅ Devices register and report status  
✅ Admins send commands and get feedback  
✅ System monitors health and sends alerts  
✅ Devices can update their software  
✅ Everything is tracked and audited  

All stored in MySQL database for fast queries and reports! 🚀

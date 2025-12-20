# Database Tables - Visual Flow & Relationships

## 🎯 The 4 NEW Device Communication Tables

```
┌─────────────────────────────────────────────────────────────────┐
│                     STREET LIGHT DEVICE                         │
│                  (registered in street_lights)                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┬────────────┐
          │            │            │            │
          ▼            ▼            ▼            ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   COMMANDS   │  │    LOGS      │  │   FIRMWARE   │  │    HEALTH    │
    │   (to send)  │  │ (diagnostic) │  │  (updates)   │  │  (history)   │
    └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
         Queue           Diagnostic      Version Track    Status History
         System          Records         OTA Updates      Monitoring
```

---

## 📊 STEP-BY-STEP TABLE FUNCTIONS

### STEP 1️⃣: Admin Sends Command → device_commands Table

```
ADMIN DASHBOARD                          BACKEND                          DATABASE
┌─────────────────────┐                ┌──────────────────┐            ┌──────────────────────┐
│ "Turn Light ON"     │                │ Receives command │            │  device_commands     │
│  [ON Button]        │─POST request─→ │ and processes    │─INSERT──→  │ ┌────────────────┐  │
│                     │                │                  │            │ │ id: 1          │  │
└─────────────────────┘                │ Calls:           │            │ │ light_id: SL001│  │
                                       │ POST /lights/    │            │ │ command_type:  │  │
                                       │ control          │            │ │   power_control│  │
                                       │                  │            │ │ action: "on"   │  │
                                       │                  │            │ │ priority: high │  │
                                       │                  │            │ │ executed: 0    │  │
                                       │                  │            │ │ requested_at:  │  │
                                       │                  │            │ │   2025-12-17   │  │
                                       │                  │            │ │   10:30:00     │  │
                                       └──────────────────┘            │ └────────────────┘  │
                                                                       └──────────────────────┘
     RESULT: ✅ Command queued and waiting for device to fetch
```

---

### STEP 2️⃣: Device Polls Commands → device_commands Table

```
STREET LIGHT DEVICE                      BACKEND                        DATABASE
┌─────────────────────┐                ┌──────────────────┐            ┌──────────────────────┐
│ Every 10 seconds:   │                │ Receives GET     │            │  device_commands     │
│ "Any commands       │─GET request──→ │ request for      │─SELECT──→  │ ┌────────────────┐  │
│  for me?"           │                │ commands         │            │ │ (Query:)       │  │
│                     │                │                  │            │ │ WHERE light_id │  │
│ GET /device/        │                │ Queries table:   │            │ │ = 'SL001'      │  │
│ commands?device_    │                │ "Show me pending │            │ │ AND executed=0 │  │
│ id=SL001            │                │  commands for    │            │ │                │  │
│                     │                │  SL001"          │            │ │ RETURNS:       │  │
└─────────────────────┘                │                  │            │ │ [{id: 1,       │  │
                                       │ Returns: [{      │            │ │  action: "on", │  │
                                       │   command_id: 1, │            │ │  priority:     │  │
                                       │   action: "on",  │            │ │  "high"}]      │  │
                                       │   priority:      │            │ └────────────────┘  │
                                       │   "high"         │            │                     │
                                       │ }]               │            │ (No changes yet)    │
                                       └──────────────────┘            └──────────────────────┘
     RESULT: ✅ Device receives command and executes it
```

---

### STEP 3️⃣: Device Sends Status + Device Logs → device_logs Table

```
STREET LIGHT DEVICE                      BACKEND                        DATABASE
┌─────────────────────┐                ┌──────────────────┐            ┌──────────────────────┐
│ Device Executing:   │                │ Receives POST    │            │  device_logs         │
│                     │                │ /device/logs     │            │ ┌────────────────┐  │
│ 1. Powers ON        │                │                  │            │ │ id: 1          │  │
│ 2. Measures values: │─POST request─→ │ Extracts log     │─INSERT──→  │ │ light_id:      │  │
│    - Battery: 92%   │                │ entries:         │            │ │   SL001        │  │
│    - Signal: -85dBm │                │                  │            │ │ log_level:     │  │
│                     │                │ Log 1: level=    │            │ │   'info'       │  │
│ 3. Creates logs:    │                │        "info"    │            │ │ log_message:   │  │
│    - "Device boot   │                │ Log 2: level=    │            │ │   "Device      │  │
│      successful"    │                │        "warning" │            │ │   booted OK"   │  │
│    - "Signal weak:  │                │                  │            │ │ device_        │  │
│      -85 dBm"       │                │ Inserts both     │            │ │ timestamp:     │  │
│                     │                │ into device_logs │            │ │   2025-12-17   │  │
│ 4. Sends:           │                │                  │            │ │   10:30:15     │  │
│    POST /device/    │                │                  │            │ │ received_at:   │  │
│    logs             │                │                  │            │ │   2025-12-17   │  │
│    {                │                │                  │            │ │   10:30:17     │  │
│      logs: [        │                │                  │            │ └────────────────┘  │
│        {level: ...} │                │                  │            │ ┌────────────────┐  │
│      ]              │                │                  │            │ │ id: 2          │  │
│    }                │                │                  │            │ │ light_id:      │  │
└─────────────────────┘                │                  │            │ │   SL001        │  │
                                       └──────────────────┘            │ │ log_level:     │  │
                                                                       │ │   'warning'    │  │
                                                                       │ │ log_message:   │  │
                                                                       │ │   "Signal weak"│  │
                                                                       │ │ device_        │  │
                                                                       │ │ timestamp:     │  │
                                                                       │ │   2025-12-17   │  │
                                                                       │ │   10:30:20     │  │
                                                                       │ └────────────────┘  │
     RESULT: ✅ Device diagnostics stored for troubleshooting
```

---

### STEP 4️⃣: Device Checks Firmware → firmware_versions Table

```
STREET LIGHT DEVICE                      BACKEND                        DATABASE
┌─────────────────────┐                ┌──────────────────┐            ┌──────────────────────┐
│ Device checks:      │                │ Receives GET     │            │ firmware_versions    │
│ "Is there new       │                │ request:         │            │ ┌────────────────┐  │
│  firmware?"         │─GET request──→ │ /device/firmware │─SELECT──→  │ │ version: 2.1.0 │  │
│                     │                │                  │            │ │ is_latest: 0   │  │
│ Current version:    │                │ Query finds      │            │ │ ┌────────────┐  │  │
│ 2.1.0               │                │ latest firmware  │            │ │ │ version:   │  │  │
│                     │                │ is 2.2.0         │            │ │ │ 2.2.0      │  │  │
│ GET /device/        │                │                  │            │ │ │ is_latest: │  │  │
│ firmware?device_    │                │ Current < Latest │            │ │ │ 1 ✅ YES   │  │  │
│ id=SL001&version=   │                │ = UPDATE NEEDED  │            │ │ │ download_  │  │  │
│ 2.1.0               │                │                  │            │ │ │ url: /fw/  │  │  │
│                     │                │ Returns:         │            │ │ │ v2.2.0/bin │  │  │
│                     │                │ {                │            │ │ │ changelog: │  │  │
│                     │                │   version: 2.2.0 │            │ │ │ "Bug fixes"│  │  │
│                     │                │   download_url:  │            │ │ │ release_   │  │  │
│                     │                │   "/fw/v2.2.0/   │            │ │ │ date:      │  │  │
│                     │                │   bin"           │            │ │ │ 2025-12-15 │  │  │
│                     │                │ }                │            │ │ └────────────┘  │  │
└─────────────────────┘                │                  │            │ └────────────────┘  │
                                       └──────────────────┘            └──────────────────────┘
         Device downloads & installs v2.2.0 ✅
     RESULT: ✅ Device gets latest firmware (OTA update)
```

---

### STEP 5️⃣: Backend Records Health → device_health_log Table

```
BACKEND SCHEDULED TASK (Every Hour)      DATABASE
┌──────────────────────────────────┐    ┌──────────────────────┐
│ Health Check Service:            │    │  device_health_log   │
│                                  │    │ ┌────────────────┐   │
│ 1. Query street_lights table     │    │ │ id: 1000       │   │
│ 2. For each device:              │    │ │ light_id:      │   │
│    - Check last_status_change    │    │ │   SL001        │   │
│    - Calculate time difference   │    │ │ status:        │   │
│                                  │    │ │   'healthy'    │   │
│ 3. Determine health:             │    │ │ signal_strength│   │
│    - < 1 min = 'healthy' ✅      │    │ │   -85          │   │
│    - 1-2 min = 'degraded' ⚠️     │    │ │ battery_%:     │   │
│    - > 2 min = 'offline' ❌      │    │ │   92           │   │
│                                  │    │ │ recorded_at:   │   │
│ 4. Get latest measurements:      │    │ │   2025-12-17   │   │
│    - From battery_status table   │    │ │   10:30:00     │   │
│    - Get battery %               │    │ │ ┌────────────┐ │   │
│    - Get signal strength         │    │ │ │ NEXT HOUR  │ │   │
│                                  │    │ │ │ id: 1001   │ │   │
│ 5. INSERT into device_health_log │    │ │ │ light_id:  │ │   │
│    {                             │    │ │ │   SL001    │ │   │
│      light_id: 'SL001'           │    │ │ │ status:    │ │   │
│      status: 'healthy'           │    │ │ │   'degraded'│   │
│      signal_strength: -85        │    │ │ │ signal_%:  │ │   │
│      battery_percentage: 92      │    │ │ │   -95      │ │   │
│      recorded_at: NOW()          │    │ │ │ battery_%: │ │   │
│    }                             │    │ │ │   75       │ │   │
│                                  │    │ │ └────────────┘ │   │
└──────────────────────────────────┘    │ └────────────────┘   │
                                        └──────────────────────┘
     RESULT: ✅ Historical record created for trending & reports
```

---

## 🔄 Complete Device Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVICE LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: DEVICE POWERS ON
  ├─ Device registers: POST /device/configure
  ├─ Backend inserts into: street_lights table
  └─ Device stores config locally

PHASE 2: PERIODIC UPDATES (Every 30 seconds)
  ├─ Device sends: POST /device/status
  ├─ Backend updates: street_lights, energy_parameters, battery_status
  ├─ Backend records: device_health_log (hourly)
  └─ Device creates logs (errors/warnings)

PHASE 3: COMMAND POLLING (Every 10 seconds)
  ├─ Device asks: GET /device/commands
  ├─ Backend checks: device_commands (WHERE executed=0)
  ├─ Device executes command
  └─ Device confirms: POST /device/command-ack

PHASE 4: DEVICE ISSUES
  ├─ Device sends: POST /device/alert
  ├─ Backend inserts: alerts table
  ├─ Device logs error: POST /device/logs
  ├─ Backend inserts: device_logs table
  └─ Admin sees alert on dashboard

PHASE 5: FIRMWARE UPDATE
  ├─ Device checks: GET /device/firmware
  ├─ Backend queries: firmware_versions (is_latest=1)
  ├─ Device downloads new firmware
  ├─ Device installs and reboots
  ├─ Device comes back online
  └─ Cycle restarts

PHASE 6: END OF LIFE
  ├─ Admin deregisters device
  └─ All related records cascade deleted
```

---

## 📋 Quick Reference: When Each Table Is Used

| Action | Tables Used | Flow |
|--------|------------|------|
| **Admin sends command** | device_commands | Admin → Backend → device_commands (INSERT) |
| **Device polls** | device_commands | Device → Backend → device_commands (SELECT WHERE executed=0) |
| **Device executes** | street_lights, energy_parameters, battery_status | Device → Backend → multiple updates |
| **Device reports status** | device_logs | Device → Backend → device_logs (INSERT) |
| **Device has error** | device_logs (error level) | Device → Backend → device_logs (INSERT with log_level='error') |
| **Device sends alert** | alerts | Device → Backend → alerts (INSERT) |
| **Check firmware** | firmware_versions | Device → Backend → firmware_versions (SELECT WHERE is_latest=1) |
| **Download firmware** | firmware_versions | Device reads download_url from firmware_versions |
| **Hourly health check** | device_health_log | Backend → device_health_log (INSERT) |
| **Generate reports** | device_health_log, energy_parameters | Backend → SELECT FROM multiple tables |

---

## 💾 Data Storage Timeline

```
TIME                    DEVICE ACTIONS                  DATABASE RECORDS
─────────────────────────────────────────────────────────────────────
10:00:00  Device powers ON
          → POST /configure              ✅ street_lights INSERT
                                        
10:00:30  Device sends status update
          → POST /status                 ✅ energy_parameters INSERT
                                         ✅ battery_status UPDATE
          Creates logs                   ✅ device_logs INSERT (info)
                                        
10:01:00  Admin sends command "ON"       ✅ device_commands INSERT
                                        
10:01:10  Device polls commands
          → GET /commands                🔍 device_commands SELECT
          Receives: [{action: "on"}]
                                        
10:01:15  Device executes command
          → POST /device/command-ack     ✅ device_commands UPDATE (executed=1)
                                         ✅ control_logs INSERT
                                        
10:02:00  Device sends warning log
          → POST /logs                   ✅ device_logs INSERT (warning)
                                        
11:00:00  Backend health check task
          (scheduled every hour)         ✅ device_health_log INSERT
                                        
12:00:00  Device checks firmware
          → GET /firmware                🔍 firmware_versions SELECT
          v2.2.0 is newer
                                        
12:00:30  Device installs firmware
          Reboots...                     
                                        
12:01:00  Device back online
          → POST /status                 ✅ All tables updated
                                        
End of day: Admin views reports
          → Dashboard queries            🔍 All tables SELECT
            - Energy used
            - Commands executed
            - Health status
            - Errors/warnings
```

---

## 🎓 Summary

**The 4 New Tables Work Like This:**

1. **device_commands** = Inbox for commands (commands to execute)
2. **device_logs** = Diary for device (what device experienced)
3. **firmware_versions** = App Store (software library)
4. **device_health_log** = Health Records (historical wellness tracking)

**Together they enable:**
- ✅ Two-way communication (commands in, status out)
- ✅ Troubleshooting (via logs)
- ✅ System updates (via firmware versions)
- ✅ Historical analysis (via health logs)

**All 14 tables combined create:**
- 🌍 Complete device lifecycle management
- 📊 Real-time monitoring and control
- 📈 Historical data and reporting
- 🔐 Audit trails and compliance
- ⚡ Energy and performance tracking

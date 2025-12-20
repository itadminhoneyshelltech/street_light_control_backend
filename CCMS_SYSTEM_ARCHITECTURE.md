# CCMS System Architecture & Integration Guide

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER (React)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  Dashboard       │  │  Control Lights  │  │  Reports         │       │
│  │  (Enhanced)      │  │  (Manual Control)│  │  (Analytics)     │       │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘       │
│           │                      │                     │                  │
│  ┌────────▼──────────────────────▼─────────────────────▼──────┐         │
│  │         CCMSDashboard Component (New)                       │         │
│  │  ┌─────────────────────────────────────────────────────┐   │         │
│  │  │ Overview │ Zones │ Energy │ Alerts │ Reports       │   │         │
│  │  └────────────────────┬────────────────────────────────┘   │         │
│  └───────────────────────┼────────────────────────────────────┘         │
│                          │                                               │
└──────────────────────────┼───────────────────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │   API Client        │
                │  (axios + auth)     │
                └──────────┬──────────┘
                           │ HTTP/REST
┌──────────────────────────▼──────────────────────────────────────────────┐
│                      BACKEND API LAYER (PHP)                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │  API Router (index.php → routes/api.php)                     │       │
│  └────────┬───────────────────────────────────────────────────┬─┘       │
│           │                                                   │          │
│  ┌────────▼─────────────┐  ┌────────────────────┐  ┌────────▼──────┐  │
│  │ Controllers (30+)    │  │ Middleware         │  │ Middleware   │  │
│  ├──────────────────────┤  ├────────────────────┤  ├──────────────┤  │
│  │FeederPanel*          │  │ Authentication     │  │Authorization │  │
│  │Reports*              │  │ (JWT Tokens)       │  │ (RBAC)       │  │
│  │SmartMeter            │  │ Request Validation │  │ Audit Logging│  │
│  │Energy                │  │ Rate Limiting      │  │ CORS         │  │
│  │Alerts                │  │ Error Handling     │  │              │  │
│  │Dashboard             │  │ Logging            │  │              │  │
│  │GIS                   │  │                    │  │              │  │
│  │User                  │  │                    │  │              │  │
│  │Maintenance           │  │                    │  │              │  │
│  │Asset                 │  │                    │  │              │  │
│  │Contractor            │  │                    │  │              │  │
│  │Alert (create)        │  │                    │  │              │  │
│  └──────────┬───────────┘  └────────────────────┘  └──────────────┘  │
│             │                                                          │
│  ┌──────────▼─────────────────────────────────────────────────────┐   │
│  │  Models & Services                                             │   │
│  ├─────────────────────────────────────────────────────────────┐   │   │
│  │ Database Queries | Business Logic | Data Processing         │   │   │
│  └─────────────────────────────────────────────────────────────┘   │   │
│                                                                      │   │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                ┌──────────▼──────────┐
                │   Database Layer    │
                │  (mysqli/PDO)       │
                └──────────┬──────────┘
                           │ SQL
┌──────────────────────────▼──────────────────────────────────────────────┐
│                    DATABASE LAYER (MySQL 8.0+)                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │ Geographic Management              │ Hardware Infrastructure │       │
│  ├─────────────────────────────────────┼──────────────────────┤       │
│  │ • cities (1 row per city)           │ • feeder_panels      │       │
│  │ • zones (5-10 per city)             │ • led_luminaires     │       │
│  │ • wards (20+ per zone)              │ • smart_meters       │       │
│  │                                     │ • asset_inventory    │       │
│  └─────────────────────────────────────┴──────────────────────┘       │
│                                                                          │
│  ┌─────────────────────────────────────┬──────────────────────┐       │
│  │ Data Collection (Real-time)         │ Operations & Control │       │
│  ├─────────────────────────────────────┼──────────────────────┤       │
│  │ • energy_parameters (15-min)        │ • control_schedules  │       │
│  │   └─ Voltage, Current, Power, PF    │ • control_operations │       │
│  │   └─ Frequency, Harmonics           │ • fault_logs (15+)   │       │
│  │ • fault_logs                        │                      │       │
│  │ • alert_history                     │                      │       │
│  │ • gsm_communication_log             │                      │       │
│  │                                     │                      │       │
│  └─────────────────────────────────────┴──────────────────────┘       │
│                                                                          │
│  ┌─────────────────────────────────────┬──────────────────────┐       │
│  │ Admin & Management                  │ Reports & Analytics  │       │
│  ├─────────────────────────────────────┼──────────────────────┤       │
│  │ • user_roles                        │ • daily_energy_reports
│  │ • user_role_assignments             │ • monthly_summaries  │       │
│  │ • access_audit_log                  │ • maintenance_history│       │
│  │ • alert_recipients (SMS config)     │ • contractor_perf    │       │
│  │ • contractors                       │                      │       │
│  │ • maintenance_requests              │                      │       │
│  │ • contractor_performance_log        │                      │       │
│  │ • system_config                     │                      │       │
│  │ • data_backup_log                   │                      │       │
│  │                                     │                      │       │
│  └─────────────────────────────────────┴──────────────────────┘       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Gateway Pattern

```
┌─────────────────────────────────────┐
│    Frontend (React)                 │
│    - Dashboard                      │
│    - Control Lights                 │
│    - Reports                        │
│    - GIS Map                        │
└────────────────┬────────────────────┘
                 │ HTTP/REST
┌────────────────▼────────────────────┐
│  API Routes (routes/api.php)        │
│  - Authentication Check             │
│  - Route Matching                   │
│  - CORS Headers                     │
└────────────────┬────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
┌─────▼─────────┐   ┌──────▼──────────┐
│ FeederPanel*  │   │ Reports*        │
├───────────────┤   ├─────────────────┤
│ list()        │   │ getEnergySaving │
│ getStatus()   │   │ getLampFailure  │
│ control()     │   │ getUptime       │
│ getEnergyData │   │ getMaintenance  │
│ getFaults()   │   │ getPerformance  │
└────────┬──────┘   └────────┬────────┘
         │                   │
         └───────────────────┴─ Database Queries
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────┐
│  Feeder Panel (Hardware)        │
│  - Smart Meter                  │
│  - LED Lights (10-50)           │
│  - GSM Modem (IMEI)             │
└────────────┬────────────────────┘
             │ GSM Data Upload
             │ (15-min intervals)
             │
┌────────────▼────────────────────┐
│  CCMS Central Server            │
│  ┌─────────────────────────────┐│
│  │ API Receiver                ││
│  │ - Validate data             ││
│  │ - Parse readings            ││
│  │ - Detect faults             ││
│  └────────────┬────────────────┘│
│               │                 │
│  ┌────────────▼────────────────┐│
│  │ Database Writer             ││
│  │ - energy_parameters         ││
│  │ - fault_logs (if any)       ││
│  │ - alert_history             ││
│  │ - gsm_communication_log     ││
│  └────────────┬────────────────┘│
└───────────────┼──────────────────┘
                │
    ┌───────────┴───────────┐
    │                       │
    │                       │ Trigger Alerts
    │                       │ (Phase-wise voltage,
    │                       │  Current high,
    │                       │  Door open, etc)
    │                       │
┌───▼──────────────────────▼───┐
│ Alert Engine                 │
├──────────────────────────────┤
│ ✓ Match fault vs thresholds  │
│ ✓ Format SMS message         │
│ ✓ Get SMS recipients (5 max) │
│ ✓ Send via SMS Gateway       │
│ ✓ Send push notification     │
│ ✓ Update dashboard           │
└──────────────────────────────┘
```

---

## 🔄 Real-time Update Flow

```
Dashboard (React)
    │
    ├─ Component Mount
    │   └─ Axios GET /api/dashboard/city-snapshot
    │       └─ FeederPanelController::list()
    │           └─ Query: SELECT fp.*, stats FROM feeder_panels
    │               └─ Aggregate: lights_on, lights_off, status
    │
    ├─ Set State with Data
    │   └─ Re-render Metric Cards
    │
    ├─ 30-second Interval Timer
    │   └─ Repeat API call
    │
    └─ User Actions
        ├─ Click Zone
        │   └─ Filter feeder_panels by zone_id
        │
        ├─ Click Control
        │   └─ POST /api/feeder-panels/{id}/control
        │       └─ FeederPanelController::control()
        │           ├─ Create control_operations record
        │           ├─ Send GSM command to modem
        │           ├─ Update feeder_panel status
        │           ├─ Log audit_trail
        │           └─ Trigger dashboard refresh event
        │
        └─ Generate Report
            └─ GET /api/reports/energy-saving
                └─ ReportsController::getEnergySavingReport()
                    ├─ Query daily_energy_reports
                    ├─ Aggregate by date
                    └─ Return chart data
```

---

## 🛠️ Integration Points

### 1. GSM Modem Integration
```
Feeder Panel (Hardware)
    │
    └─ SMS Data → IMEI: 123456789012345
                       Message: "P:230,C:45,F:50,E:100"
                                │
                                ▼
                       Server Receives
                       Parse & Validate
                       │
                       ├─ Store in energy_parameters
                       ├─ Check thresholds
                       ├─ Trigger alerts if needed
                       └─ Update city_summary
```

### 2. Alert Notification Flow
```
Fault Detected (e.g., voltage high)
    │
    ├─ Check severity → CRITICAL
    │
    ├─ Get alert_recipients
    │   └─ SELECT phone_number FROM alert_recipients 
    │       WHERE city_id=1 AND receive_critical=1
    │       LIMIT 5
    │
    ├─ Format message
    │   └─ "ALERT: Panel-A voltage HIGH (300V) 
    │       Ref: FLT-2024-001"
    │
    ├─ Send SMS (via gateway)
    ├─ Store alert_history
    ├─ Update dashboard (real-time)
    └─ Mark fault_log as active
```

### 3. Control Command Flow
```
User clicks "Turn On All Lights"
    │
    ├─ Frontend sends POST /api/feeder-panels/{id}/control
    │   └─ { action: 'on', brightness: 100 }
    │
    ├─ Backend creates control_operations record
    │
    ├─ Generate GSM command
    │   └─ Format: AT+GSM_CONTROL=ON,100
    │
    ├─ Send to modem (IMEI: XXX)
    │
    ├─ Log in gsm_communication_log
    │
    ├─ Get IMEI response from modem
    │
    ├─ Update feeder_panel status
    │
    ├─ Update city_summary
    │
    └─ Trigger dashboard refresh
```

### 4. Report Generation Flow
```
User requests "Energy Saving Report"
    │
    ├─ Frontend: GET /api/reports/energy-saving
    │    params: {city_id=1, start_date='2024-01-01', 
    │             end_date='2024-12-31'}
    │
    ├─ Backend: ReportsController::getEnergySavingReport()
    │   │
    │   ├─ Query daily_energy_reports
    │   │   └─ SELECT SUM(energy_consumed_kwh),
    │   │         SUM(cost), AVG(uptime)
    │   │         WHERE city_id=1 
    │   │         AND report_date BETWEEN dates
    │   │
    │   ├─ Query monthly_summaries
    │   │   └─ SELECT * WHERE city_id=1
    │   │
    │   └─ Aggregate & format response
    │       └─ daily_data: [...]
    │          summary: {...}
    │          monthly: [...]
    │
    └─ Frontend renders charts
        └─ LineChart, BarChart, Tables
```

---

## 🗂️ File Organization

```
street_light_control_backend/
├── controllers/
│   ├── FeederPanelController.php      ✅ NEW
│   ├── ReportsController.php          ✅ NEW
│   ├── SmartMeterController.php       📝 TODO
│   ├── EnergyController.php           📝 TODO
│   ├── AlertController.php            📝 TODO
│   ├── DashboardController.php        📝 TODO
│   ├── GISController.php              📝 TODO
│   ├── UserController.php             📝 TODO
│   ├── MaintenanceController.php      📝 TODO
│   ├── AssetController.php            📝 TODO
│   ├── ContractorController.php       📝 TODO
│   └── (existing controllers)
│
├── models/
│   ├── FeederPanel.php                📝 TODO
│   ├── SmartMeter.php                 📝 TODO
│   ├── EnergyParameter.php            📝 TODO
│   ├── FaultLog.php                   📝 TODO
│   ├── Alert.php                      📝 TODO
│   └── (existing models)
│
├── services/
│   ├── AlertService.php               📝 TODO
│   ├── ReportService.php              📝 TODO
│   ├── GSMService.php                 📝 TODO
│   └── (existing services)
│
├── database-ccms-complete.sql         ✅ NEW (850 lines)
├── routes/
│   └── api.php                        📝 NEEDS UPDATE
│
└── (other backend files)

street_light_control_frontend/
├── src/
│   ├── components/
│   │   ├── CCMSDashboard.tsx          ✅ NEW
│   │   ├── (existing components)
│   │
│   ├── styles/
│   │   ├── CCMSDashboard.css          ✅ NEW
│   │   └── (existing styles)
│   │
│   └── (existing frontend structure)
│
└── (config files)

Project Root/
├── CCMS_IMPLEMENTATION_PLAN.md        ✅ NEW
├── CCMS_QUICK_START_GUIDE.md          ✅ NEW
├── CCMS_IMPLEMENTATION_COMPLETE.md    ✅ NEW
└── CCMS_SYSTEM_ARCHITECTURE.md        ✅ NEW (THIS FILE)
```

---

## 🔐 Authentication & Authorization Flow

```
Login Request
    │
    ├─ POST /api/auth/login
    │   └─ { username, password }
    │
    ├─ AuthController::login()
    │   ├─ Query users table
    │   ├─ Verify password (bcrypt)
    │   ├─ Generate JWT token
    │   └─ Return token
    │
┌───▼──────────────────────────────────┐
│ Store JWT in localStorage            │
│ (Axios intercepts all requests)      │
└───┬──────────────────────────────────┘
    │
    ├─ GET /api/feeder-panels/list
    │   Header: Authorization: Bearer {JWT_TOKEN}
    │
    ├─ Middleware::authenticateToken()
    │   ├─ Extract token from header
    │   ├─ Verify JWT signature
    │   ├─ Decode claims: {user_id, role}
    │   └─ Continue or reject
    │
    ├─ Middleware::authorizeRole()
    │   ├─ Query user_role_assignments
    │   ├─ Check permission for route
    │   ├─ Check scope (city_id, ward_id)
    │   └─ Continue or return 403 Forbidden
    │
    ├─ FeederPanelController::list()
    │   ├─ Apply scope filter
    │   │   └─ IF role='zone_operator' 
    │   │       └─ Only show feeder_panels in assigned zone
    │   │
    │   └─ Return data
    │
    └─ Log access_audit_log
        └─ user_id, action, timestamp, ip_address
```

---

## 📈 Data Aggregation Pipeline

```
Raw 15-minute readings (energy_parameters)
    │
    ├─ Nightly Job (00:00 UTC)
    │   │
    │   ├─ For each feeder_panel
    │   │   ├─ Query last 24 hours of readings
    │   │   ├─ Calculate daily stats:
    │   │   │   ├─ Total kWh consumed
    │   │   │   ├─ Peak load (kW)
    │   │   │   ├─ Average voltage
    │   │   │   ├─ Power factor
    │   │   │   └─ Uptime %
    │   │   │
    │   │   └─ INSERT INTO daily_energy_reports
    │   │
    │   └─ For each city
    │       ├─ SUM all panel dailies
    │       └─ INSERT INTO city_summary
    │
    └─ Monthly Job (1st day of month)
        │
        ├─ For each city
        │   ├─ Query 30 days of daily reports
        │   ├─ Aggregate monthly stats
        │   └─ INSERT INTO monthly_summaries
        │
        └─ For each contractor
            ├─ Query maintenance records
            ├─ Calculate performance metrics
            └─ UPDATE contractor_performance_log
```

---

## 🎯 Key Integration Checklist

Before production deployment:

- [ ] Database schema imported successfully
- [ ] All API endpoints tested & responding
- [ ] Frontend dashboard loading without errors
- [ ] Authentication working (JWT tokens)
- [ ] Authorization checks passing
- [ ] Real-time data refresh working (30-sec intervals)
- [ ] Fault detection triggering alerts
- [ ] Alert recipients receiving SMS (test 5 numbers)
- [ ] Reports generating within 10 seconds
- [ ] Contractor performance metrics calculating
- [ ] Audit logs recording all actions
- [ ] Error handling working (graceful failures)
- [ ] SSL/TLS configured for HTTPS
- [ ] Backup system running
- [ ] Monitoring & alerting active

---

**Last Updated**: December 18, 2025
**Status**: ✅ Architecture Complete
**Ready for Implementation**: YES

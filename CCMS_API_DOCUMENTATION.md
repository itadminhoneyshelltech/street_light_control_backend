# CCMS API Documentation

## Current API Endpoints Mapping

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Light Control (Current)
- `GET /api/lights/list` - Get all lights (optionally filtered by city)
- `GET /api/lights/detail` - Get light detail
- `GET /api/lights/summary` - Get city summary
- `POST /api/lights/control` - Turn light on/off
- `POST /api/lights/update-status` - Update light status

### CCMS Features (New)

#### CCMS Panel Technical Specifications (operational)
- Remote switching: CCS can instantly or automatically switch ON/OFF a single switching point or grouped/networked points.
- Astronomical scheduling: Uses sunrise/sunset at the switching point location for year-round automation.
- Communications: GSM (IMEI-based) and/or proven RF for remote monitoring, reading, control, and data logging; WAN-ready with GSM module.
- Battery backup: ≥12 hours for the CCMS unit.
- Secure comms port: Optically isolated communication port for safe data transfer and unauthorized-access protection.
- Panel hardware: Control panel per switch point/feeder with required control elements and single/3-phase smart energy meter (non-CT or CT for higher loads).

#### Smart Meter Standards & Capabilities
- Compliance: IS 16444 Part-1 and Part-2 (CT-operated), Variant-2 with C1 and C3 connectivity.
- Interfaces: IHD (in-house display) + IHD communication module; WAN comms via GSM.
- Functions: Remote reading, switching, data logging, communication, and control from CCS.

#### Metered/Reported Parameters (variable intervals)
- Phase-wise voltage (phase-to-neutral) and current
- Phase-wise power factor; frequency
- Total active power (kW) and apparent power (kVA)
- Cumulative energy: kWh and kVAh; time-of-day (TOD)
- Power supply unavailability (hours)
- Emergency wireless ON/OFF facility

#### Reporting
- Daily status/report email with snapshot and dashboard-ready data.

#### Smart Meter & Energy Monitoring
- `GET /api/ccms/meter-data` - Get smart meter data
  - Query params: `lightId`
  - Returns: Current meter readings

- `GET /api/ccms/energy-parameters` - Get energy parameters
  - Query params: `lightId`, `hours` (default 24)
  - Returns: Voltage, Current, Power Factor, Power consumption

- `POST /api/ccms/energy-parameters` - Record energy parameters (from IoT)
  - Body: Energy meter readings from devices

#### Automatic Scheduling
- `POST /api/ccms/schedule` - Set automatic schedule
  - Body:
    ```json
    {
      "lightId": "SL001",
      "scheduleType": "sunrise_sunset",
      "enabled": true,
      "startTime": "18:00:00",
      "endTime": "06:00:00",
      "brightnessLevel": 100
    }
    ```

#### Battery Backup Monitoring
- `GET /api/ccms/battery-status` - Get battery status
  - Query params: `lightId`
  - Returns: Charge %, status (full/good/warning/critical)

- `POST /api/ccms/battery-status` - Update battery status (from devices)
  - Body:
    ```json
    {
      "lightId": "SL001",
      "currentChargePercentage": 85,
      "backupHoursAvailable": 10,
      "status": "good"
    }
    ```

#### Alerts & Notifications
- `GET /api/ccms/alerts` - Get all alerts
  - Query params: `lightId`, `unreadOnly` (true/false)
  - Returns: Critical/High/Medium/Low severity alerts

- `POST /api/ccms/alerts/resolve` - Mark alert as resolved
  - Body: `{ "alertId": 1 }`

#### Dashboard Summary
- `GET /api/ccms/dashboard-summary` - Get CCMS dashboard stats
  - Query params: `city`
  - Returns: Total lights, battery status summary, alerts count, avg power consumption

---

## Database Schema Extensions

### New Tables Created:
1. **smart_meters** - Smart meter configuration (IS 16444 compliant)
2. **energy_parameters** - Real-time energy readings (voltage, current, power factor, etc.)
3. **schedules** - Automatic ON/OFF schedules (sunrise/sunset, fixed time, seasonal)
4. **battery_status** - Battery backup status tracking
5. **gsm_communication_log** - GSM/RF communication tracking
6. **alerts** - System alerts and notifications

### Enhanced street_lights table with:
- `schedule_enabled` - Enable/disable automatic scheduling
- `sunrise_time`, `sunset_time` - For automatic scheduling
- `battery_status` - Current battery status
- `gsm_imei` - GSM device identifier
- `communication_type` - GSM/RF/Wired
- `maintenance_required` - Flag for maintenance alerts

---

## Implementation Status

✅ Database schema extended for CCMS compliance
✅ API endpoints created for all features
✅ Energy parameter monitoring
✅ Battery status tracking
✅ Automatic scheduling support
✅ Alert management

⏳ Pending:
- Frontend UI for new features
- Automatic sunrise/sunset calculation (geo-location based)
- GSM/RF device integration
- IoT device communication handler

---

## Example Usage

### 1. Record Energy Parameters (from IoT device)
```bash
curl -X POST http://localhost:8000/api/ccms/energy-parameters \
  -H "Content-Type: application/json" \
  -d '{
    "lightId": "SL001",
    "phaseAVoltage": 230.5,
    "phaseACurrent": 2.5,
    "phaseAPowerFactor": 0.95,
    "frequency": 50,
    "totalActivePower": 575,
    "cumulativeKwh": 1234.56
  }'
```

### 2. Set Automatic Schedule
```bash
curl -X POST http://localhost:8000/api/ccms/schedule \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lightId": "SL001",
    "scheduleType": "sunrise_sunset",
    "enabled": true,
    "brightnessLevel": 100
  }'
```

### 3. Update Battery Status
```bash
curl -X POST http://localhost:8000/api/ccms/battery-status \
  -H "Content-Type: application/json" \
  -d '{
    "lightId": "SL001",
    "currentChargePercentage": 85,
    "status": "good"
  }'
```

### 4. Get Alerts
```bash
curl -X GET "http://localhost:8000/api/ccms/alerts?lightId=SL001&unreadOnly=true" \
  -H "Authorization: Bearer TOKEN"
```

---

## CCMS Compliance Mapping

| Specification | Implementation | Status |
|---|---|---|
| Instant ON/OFF control | `/api/lights/control` | ✅ |
| Automatic sunrise/sunset scheduling | `/api/ccms/schedule` | ✅ |
| Smart Energy Meter support (IS 16444) | `smart_meters` table | ✅ |
| GSM/RF communication tracking | `gsm_communication_log` table | ✅ |
| Battery backup (12+ hours) | `battery_status` table | ✅ |
| Real-time energy monitoring | `energy_parameters` table | ✅ |
| Phase-wise voltage/current/PF | `energy_parameters` fields | ✅ |
| Communication logs | `gsm_communication_log` table | ✅ |
| Alert management | `alerts` table | ✅ |

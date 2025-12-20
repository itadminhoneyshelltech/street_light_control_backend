# Quick Start: Testing Device Controller

## One-Line Setup & Test

```powershell
# Terminal 1: Start Backend
cd C:\Users\rakes\OneDrive\Desktop\Repo\Street_Light_Control_Systems\street_light_control_backend; & "C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000 index.php

# Terminal 2: Run All Tests
$device_id="IMEI:TEST_$(Get-Random)"; Write-Host "Testing with Device ID: $device_id" -ForegroundColor Cyan; $body = "{`"device_id`":`"$device_id`",`"name`":`"Test Light`",`"city`":`"Delhi`",`"latitude`":28.6139,`"longitude`":77.2090,`"status`":`"off`",`"battery_backup_hours`":12,`"gsm_imei`":`"$device_id`"}"; $r1=Invoke-RestMethod -Uri "http://localhost:8000/api/device/configure" -Method POST -Body $body -ContentType "application/json"; Write-Host "✓ Device Configured" -ForegroundColor Green; $statusBody = "{`"device_id`":`"$device_id`",`"status`":{`"power_state`":`"on`",`"brightness`":85,`"battery_percentage`":92},`"temperature`":35.5,`"energy`":{`"voltage`":230.5,`"current`":0.85,`"power_watts`":195.9,`"frequency`":50,`"cumulative_kwh`":4.25}}"; $r2=Invoke-RestMethod -Uri "http://localhost:8000/api/device/status" -Method POST -Body $statusBody -ContentType "application/json"; Write-Host "✓ Status Updated" -ForegroundColor Green; $r3=Invoke-RestMethod -Uri "http://localhost:8000/api/device/commands?device_id=$device_id" -Method GET; Write-Host "✓ Commands Polled: $($r3.data.commands.Count) pending" -ForegroundColor Green; $alertBody = "{`"device_id`":`"$device_id`",`"alert_type`":`"battery_low`",`"severity`":`"critical`",`"message`":`"Battery at 8%`"}"; $r4=Invoke-RestMethod -Uri "http://localhost:8000/api/device/alert" -Method POST -Body $alertBody -ContentType "application/json"; Write-Host "✓ Alert Sent" -ForegroundColor Green; $r5=Invoke-RestMethod -Uri "http://localhost:8000/api/device/health?device_id=$device_id" -Method GET; Write-Host "✓ Health: $($r5.data.health_status)" -ForegroundColor Green; Write-Host "`nAll Tests Passed! ✅" -ForegroundColor Cyan
```

---

## Step-by-Step Testing

### 1. Start Backend
```powershell
cd street_light_control_backend
& "C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000 index.php
```
✅ You should see: "PHP 8.3.x Development Server started"

### 2. Register a Device
```powershell
$body = @{
    device_id="IMEI:12345678901234"
    name="Street Light Test"
    city="Delhi"
    latitude=28.6139
    longitude=77.2090
    status="off"
    battery_backup_hours=12
    gsm_imei="12345678901234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/device/configure" -Method POST -Body $body -ContentType "application/json"
```

✅ Expected response: 200 Success with device config

### 3. Send Device Status
```powershell
$body = @{
    device_id="IMEI:12345678901234"
    status=@{ power_state="on"; brightness=85; battery_percentage=92 }
    temperature=35.5
    energy=@{
        voltage=230.5
        current=0.85
        power_watts=195.9
        frequency=50
        cumulative_kwh=4.25
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8000/api/device/status" -Method POST -Body $body -ContentType "application/json"
```

✅ Expected response: 200 Success, "Status recorded"

### 4. Check Device Health
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/device/health?device_id=IMEI:12345678901234" -Method GET | ConvertTo-Json
```

✅ Expected response: health_status = "healthy"

### 5. Send Alert
```powershell
$body = @{
    device_id="IMEI:12345678901234"
    alert_type="battery_low"
    severity="critical"
    message="Battery at 8%, urgent action needed"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/device/alert" -Method POST -Body $body -ContentType "application/json"
```

✅ Expected response: 200 Success, "Alert received"

### 6. Poll for Commands
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/device/commands?device_id=IMEI:12345678901234" -Method GET | ConvertTo-Json
```

✅ Expected response: Array of pending commands (initially empty)

---

## Verify Data in Database

```powershell
# Check registered devices
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT light_id, name, city, status, brightness FROM street_lights LIMIT 3;"

# Check status updates
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT light_id, timestamp, phase_a_voltage, phase_a_current FROM energy_parameters ORDER BY timestamp DESC LIMIT 3;"

# Check alerts
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT light_id, alert_type, severity, message FROM alerts ORDER BY created_at DESC LIMIT 3;"

# Check commands
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT light_id, command_type, brightness_level, executed FROM device_commands;"
```

---

## Common Error Messages & Fixes

### Error: "Cannot connect to localhost:8000"
**Solution:** Make sure backend is running with `php -S localhost:8000 index.php`

### Error: "Table doesn't exist"
**Solution:** Run migration: 
```powershell
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control < database-device-tables.sql
```

### Error: "Enum value is wrong"
**Solution:** Use correct enum values:
- `power_control` (not "power")
- `brightness_control` (not "brightness")
- `schedule_update`
- `maintenance`
- `firmware_update`

### Error: "500 Internal Server Error"
**Solution:** Check PHP terminal for error details. Usually means:
- Missing database column
- Wrong data type
- Syntax error in SQL

---

## Expected Test Results Summary

| Test | Endpoint | Method | Status | Response |
|------|----------|--------|--------|----------|
| Register Device | /device/configure | POST | 200 | Device configured successfully |
| Send Status | /device/status | POST | 200 | Status recorded |
| Poll Commands | /device/commands | GET | 200 | Commands array (empty initially) |
| Send Alert | /device/alert | POST | 200 | Alert received |
| Check Health | /device/health | GET | 200 | health_status: healthy |

---

## Production Deployment

### Before Going Live
- [ ] Tested with 10+ simulated devices
- [ ] Verified database storage works correctly
- [ ] Checked for SQL injection vulnerabilities
- [ ] Implemented rate limiting for device polling
- [ ] Set up database backups
- [ ] Configured error logging
- [ ] Load tested with 100+ concurrent devices
- [ ] Set up monitoring alerts

### Performance Tuning
```sql
-- Index for fast command polling
CREATE INDEX idx_device_commands ON device_commands(light_id, executed);

-- Index for health checks
CREATE INDEX idx_street_lights_status ON street_lights(light_id, last_status_change);

-- Index for alerts
CREATE INDEX idx_alerts_light ON alerts(light_id, created_at);
```

---

## Help & Support

**Backend Logs:** Check the PHP terminal where you started the server

**Database Issues:** 
```powershell
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SHOW TABLES;"
```

**API Testing:** Use Postman or curl for cleaner testing

**Documentation:** See DEVICE_CONTROLLER_TEST_RESULTS.md for detailed results

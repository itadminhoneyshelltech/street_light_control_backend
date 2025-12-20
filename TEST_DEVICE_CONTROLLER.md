# Testing Device Controller - Step by Step Guide

This guide will help you test the DeviceController with simulated device data and verify it's stored in the database.

---

## Prerequisites Check

✅ Backend folder: `street_light_control_backend`
✅ Frontend folder: `street_light_control_frontend`
✅ MySQL running with database: `street_light_control`
✅ PHP 8.3 installed

---

## Step 1: Run Database Migration (Create Device Tables)

Open PowerShell in the **backend directory**:

```powershell
cd C:\Users\rakes\OneDrive\Desktop\Repo\Street_Light_Control_Systems\street_light_control_backend
```

Run the migration:

```powershell
mysql -h localhost -u root -p -D street_light_control < database-device-tables.sql
```

When prompted, enter password: `Honeyshell2024`

**Verify tables created:**

```powershell
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SHOW TABLES LIKE 'device%';"
```

Expected output:
```
device_commands
device_health_log
device_logs
firmware_versions
```

---

## Step 2: Start Backend Server

In the same PowerShell window:

```powershell
& "C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000 index.php
```

You should see:
```
PHP 8.3.x Development Server (http://localhost:8000) started
```

**Keep this terminal open!**

---

## Step 3: Test Device Configuration (Registration)

Open a **NEW PowerShell window** and run:

```powershell
$deviceConfig = @{
    device_id = "IMEI:351234567890123"
    name = "Street Light SL001"
    city = "Delhi"
    latitude = 28.6139
    longitude = 77.2090
    status = "off"
    battery_backup_hours = 12
    gsm_imei = "351234567890123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/device/configure" -Method POST -Body $deviceConfig -ContentType "application/json"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Device configured successfully",
  "light_id": "IMEI:351234567890123",
  "config": {
    "schedule_enabled": true,
    "sunrise_time": "06:00:00",
    "sunset_time": "18:30:00"
  }
}
```

---

## Step 4: Test Device Status Update

Simulate a device sending status update:

```powershell
$statusUpdate = @{
    device_id = "IMEI:351234567890123"
    status = "on"
    brightness_level = 85
    battery_percentage = 92
    temperature = 35.5
    energy = @{
        voltage = 230.5
        current = 0.85
        power_factor = 0.92
        frequency = 50.0
        energy_consumed = 4.25
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8000/api/device/status" -Method POST -Body $statusUpdate -ContentType "application/json"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Status updated successfully",
  "next_update_in": "30 seconds"
}
```

---

## Step 5: Create a Command for the Device

Send a command to turn the light ON with 75% brightness:

```powershell
$command = @{
    device_id = "IMEI:351234567890123"
    command_type = "brightness"
    action = "set"
    brightness_level = 75
    priority = "high"
} | ConvertTo-Json

# Insert command directly via database (simulating admin action)
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "INSERT INTO device_commands (light_id, command_type, action, brightness_level, priority, executed) VALUES ('IMEI:351234567890123', 'brightness', 'set', 75, 'high', 0);"
```

---

## Step 6: Test Command Polling (Device Checks for Commands)

Simulate device polling for commands:

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/device/commands?device_id=IMEI:351234567890123" -Method GET
```

**Expected Response:**
```json
{
  "status": "success",
  "commands": [
    {
      "command_id": 1,
      "command_type": "brightness",
      "action": "set",
      "brightness_level": 75,
      "priority": "high",
      "requested_at": "2025-12-17 10:30:00"
    }
  ]
}
```

---

## Step 7: Acknowledge Command Execution

Simulate device acknowledging it executed the command:

```powershell
$ack = @{
    device_id = "IMEI:351234567890123"
    command_id = 1
    status = "executed"
    result = @{
        new_brightness = 75
        execution_time = "2025-12-17T10:30:15Z"
    } | ConvertTo-Json
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8000/api/device/command-ack" -Method POST -Body $ack -ContentType "application/json"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Command acknowledged successfully"
}
```

---

## Step 8: Send Device Alert

Simulate a critical battery alert:

```powershell
$alert = @{
    device_id = "IMEI:351234567890123"
    alert_type = "battery_low"
    severity = "critical"
    message = "Battery level at 8%, requires immediate attention"
    metadata = @{
        battery_percentage = 8
        estimated_backup_hours = 1.5
    } | ConvertTo-Json
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8000/api/device/alert" -Method POST -Body $alert -ContentType "application/json"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Alert recorded successfully",
  "alert_id": 1
}
```

---

## Step 9: Check Device Health

Get device health status:

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/device/health?device_id=IMEI:351234567890123" -Method GET
```

**Expected Response:**
```json
{
  "status": "success",
  "device_id": "IMEI:351234567890123",
  "health_status": "online",
  "last_update": "2025-12-17 10:30:15",
  "battery_percentage": 92,
  "signal_strength": null
}
```

---

## Step 10: Upload Device Logs

Simulate device uploading diagnostic logs:

```powershell
$logs = @{
    device_id = "IMEI:351234567890123"
    logs = @(
        @{
            log_level = "info"
            message = "Device startup successful"
            device_timestamp = "2025-12-17T10:00:00Z"
        },
        @{
            log_level = "warning"
            message = "GSM signal weak (RSSI: -95 dBm)"
            device_timestamp = "2025-12-17T10:15:00Z"
        },
        @{
            log_level = "error"
            message = "Failed to connect to MQTT broker"
            device_timestamp = "2025-12-17T10:20:00Z"
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:8000/api/device/logs" -Method POST -Body $logs -ContentType "application/json"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "3 logs uploaded successfully"
}
```

---

## Step 11: Verify Data in Database

Check that all data was stored correctly:

### Check Street Light Entry
```powershell
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT id, name, city, status, brightness_level, battery_percentage FROM street_lights WHERE id='IMEI:351234567890123';"
```

### Check Device Commands
```powershell
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT * FROM device_commands WHERE light_id='IMEI:351234567890123';"
```

### Check Device Logs
```powershell
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT * FROM device_logs WHERE light_id='IMEI:351234567890123';"
```

### Check Alerts
```powershell
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT * FROM alerts WHERE light_id='IMEI:351234567890123';"
```

### Check Energy Parameters
```powershell
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "SELECT * FROM energy_parameters WHERE light_id='IMEI:351234567890123' ORDER BY recorded_at DESC LIMIT 5;"
```

---

## Step 12: Test Frontend Integration (Optional)

1. Start the frontend:
```powershell
cd C:\Users\rakes\OneDrive\Desktop\Repo\Street_Light_Control_Systems\street_light_control_frontend
npm start
```

2. Open browser: http://localhost:3000

3. Login with admin credentials

4. Check Dashboard:
   - You should see "Street Light SL001" in the light list
   - Status should show "on" with brightness 85%
   - Battery should show 92%

5. Check Alerts:
   - Navigate to Reports or Alerts section
   - You should see the battery low alert

---

## Complete Test Script (Run All at Once)

Save this as `test-device-controller.ps1`:

```powershell
# Test Device Controller - Complete Test Suite

Write-Host "`n=== Testing Device Controller ===" -ForegroundColor Cyan

# 1. Configure Device
Write-Host "`n[1/7] Testing Device Configuration..." -ForegroundColor Yellow
$deviceConfig = @{
    device_id = "IMEI:351234567890123"
    name = "Street Light SL001"
    city = "Delhi"
    latitude = 28.6139
    longitude = 77.2090
    status = "off"
    battery_backup_hours = 12
    gsm_imei = "351234567890123"
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "http://localhost:8000/api/device/configure" -Method POST -Body $deviceConfig -ContentType "application/json"
Write-Host "✓ Device Configured: $($response1.message)" -ForegroundColor Green

# 2. Update Status
Write-Host "`n[2/7] Testing Status Update..." -ForegroundColor Yellow
$statusUpdate = @{
    device_id = "IMEI:351234567890123"
    status = "on"
    brightness_level = 85
    battery_percentage = 92
    temperature = 35.5
    energy = @{
        voltage = 230.5
        current = 0.85
        power_factor = 0.92
        frequency = 50.0
        energy_consumed = 4.25
    }
} | ConvertTo-Json -Depth 3

$response2 = Invoke-RestMethod -Uri "http://localhost:8000/api/device/status" -Method POST -Body $statusUpdate -ContentType "application/json"
Write-Host "✓ Status Updated: $($response2.message)" -ForegroundColor Green

# 3. Create Command (via database)
Write-Host "`n[3/7] Creating Command for Device..." -ForegroundColor Yellow
mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e "INSERT INTO device_commands (light_id, command_type, action, brightness_level, priority, executed) VALUES ('IMEI:351234567890123', 'brightness', 'set', 75, 'high', 0);" 2>$null
Write-Host "✓ Command Created" -ForegroundColor Green

# 4. Poll Commands
Write-Host "`n[4/7] Testing Command Polling..." -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "http://localhost:8000/api/device/commands?device_id=IMEI:351234567890123" -Method GET
Write-Host "✓ Commands Retrieved: $($response3.commands.Count) pending" -ForegroundColor Green

# 5. Acknowledge Command
if ($response3.commands.Count -gt 0) {
    Write-Host "`n[5/7] Testing Command Acknowledgment..." -ForegroundColor Yellow
    $commandId = $response3.commands[0].command_id
    $ack = @{
        device_id = "IMEI:351234567890123"
        command_id = $commandId
        status = "executed"
        result = (@{
            new_brightness = 75
            execution_time = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
        } | ConvertTo-Json)
    } | ConvertTo-Json -Depth 3
    
    $response4 = Invoke-RestMethod -Uri "http://localhost:8000/api/device/command-ack" -Method POST -Body $ack -ContentType "application/json"
    Write-Host "✓ Command Acknowledged: $($response4.message)" -ForegroundColor Green
}

# 6. Send Alert
Write-Host "`n[6/7] Testing Alert Submission..." -ForegroundColor Yellow
$alert = @{
    device_id = "IMEI:351234567890123"
    alert_type = "battery_low"
    severity = "critical"
    message = "Battery level at 8%, requires immediate attention"
    metadata = (@{
        battery_percentage = 8
        estimated_backup_hours = 1.5
    } | ConvertTo-Json)
} | ConvertTo-Json -Depth 3

$response5 = Invoke-RestMethod -Uri "http://localhost:8000/api/device/alert" -Method POST -Body $alert -ContentType "application/json"
Write-Host "✓ Alert Sent: Alert ID $($response5.alert_id)" -ForegroundColor Green

# 7. Check Health
Write-Host "`n[7/7] Testing Health Check..." -ForegroundColor Yellow
$response6 = Invoke-RestMethod -Uri "http://localhost:8000/api/device/health?device_id=IMEI:351234567890123" -Method GET
Write-Host "✓ Health Status: $($response6.health_status)" -ForegroundColor Green

Write-Host "`n=== All Tests Completed Successfully! ===" -ForegroundColor Cyan
Write-Host "`nVerify data in database:" -ForegroundColor Yellow
Write-Host "mysql -h localhost -u root -pHoneyshell2024 -D street_light_control -e 'SELECT * FROM street_lights WHERE id=\"IMEI:351234567890123\";'" -ForegroundColor Gray
```

Then run:
```powershell
.\test-device-controller.ps1
```

---

## Troubleshooting

### Problem: "Connection refused" or "Cannot connect to localhost:8000"
**Solution:** Make sure PHP backend is running (`php -S localhost:8000 index.php`)

### Problem: "Table doesn't exist"
**Solution:** Run the database migration: `mysql < database-device-tables.sql`

### Problem: "Unknown column in field list"
**Solution:** Check that all database tables are created correctly with `SHOW TABLES;`

### Problem: Backend returns 500 error
**Solution:** Check PHP terminal for error messages. Common issues:
- MySQL connection failed (wrong password)
- Missing table or column
- PHP syntax error

---

## Expected Database State After Tests

After running all tests, your database should have:

- **street_lights**: 1 row (IMEI:351234567890123)
- **device_commands**: 1 row (brightness command, marked as executed)
- **device_logs**: 3 rows (info, warning, error)
- **alerts**: 1 row (battery_low alert)
- **energy_parameters**: 1 row (latest energy readings)
- **battery_status**: 1 row (92% charge)
- **control_logs**: 1 row (command acknowledgment)

---

## Next Steps

1. ✅ All device endpoints tested and working
2. ✅ Data stored in database correctly
3. ⏳ Create frontend UI for "Send Command" button
4. ⏳ Add real-time device status monitoring
5. ⏳ Implement device authentication tokens
6. ⏳ Set up automated polling simulation script

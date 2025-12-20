# Device Functional & CCMS Communication Flow

## Overview
Street light devices communicate with the backend through a request-response model with periodic polling and status reporting. This document outlines the complete lifecycle from device installation to ongoing operation.

---

## 1. Device Installation & Configuration

### Objective
Register a new street light device with the backend system.

### Flow Diagram
```
Device Power-On
    ↓
Read Stored Config (if exists)
    ↓
Collect Data (GPS, IMEI, etc.)
    ↓
HTTP POST /device/{deviceId}/configure
    ↓
Success? → Store Config Locally, Start Polling
     ↓ No
Display Error Message → Retry after 5 min
```

### API Endpoint
```
POST /device/{deviceId}/configure
Host: localhost:8000/api
Content-Type: application/json
```

### Request Payload
```json
{
  "device_id": "IMEI:351234567890123",
  "device_type": "street_light_controller",
  "name": "Light SL001",
  "city": "Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "Main Road, Delhi",
  "status": "off",
  "battery_backup_hours": 12,
  "gsm_imei": "351234567890123",
  "gsm_signal_strength": 85,
  "communication_type": "GSM",
  "firmware_version": "v2.1.0",
  "timestamp": "2025-12-17T10:30:00Z"
}
```

### Success Response (200)
```json
{
  "status": "success",
  "message": "Device configured successfully",
  "light_id": "SL001",
  "config": {
    "schedule_enabled": true,
    "sunrise_time": "06:00:00",
    "sunset_time": "18:30:00",
    "brightness_level": 100,
    "auto_dimming": true
  },
  "server_timestamp": "2025-12-17T10:30:05Z"
}
```

### Error Response (400/500)
```json
{
  "status": "error",
  "code": "CONFIG_INVALID",
  "message": "GPS coordinates invalid or out of service area",
  "retry_after_seconds": 300
}
```

### Local Error Handling
- Display: `"Configuration Failed: GPS coordinates invalid. Retrying in 5 minutes..."`
- Log error locally with timestamp
- Retry every 5 minutes for up to 3 attempts
- If all attempts fail, store in queue for manual intervention

---

## 2. Periodic Status Updates

### Objective
Keep backend informed of device state changes and health metrics.

### Flow Diagram
```
Device Operating
    ↓
Every 30 seconds (or on state change)
    ↓
Collect Current Status:
  - Power state (on/off)
  - Brightness level
  - Temperature
  - Battery percentage
  - GSM signal strength
  - Error flags
    ↓
HTTP POST /device/{deviceId}/status
    ↓
Success? → Clear local queue
     ↓ No
Add to local queue, retry next cycle
```

### API Endpoint
```
POST /device/{deviceId}/status
Host: localhost:8000/api
Content-Type: application/json
Authorization: Bearer {device_token}
```

### Request Payload
```json
{
  "device_id": "IMEI:351234567890123",
  "light_id": "SL001",
  "timestamp": "2025-12-17T10:30:35Z",
  "status": {
    "power_state": "on",
    "brightness": 85,
    "temperature_celsius": 42.5,
    "battery_percentage": 95,
    "gsm_signal_strength": 82,
    "uptime_seconds": 864000,
    "error_flags": []
  },
  "energy": {
    "voltage": 230.5,
    "current": 0.26,
    "power_watts": 60,
    "frequency": 50,
    "cumulative_kwh": 1245.67
  }
}
```

### Success Response (200)
```json
{
  "status": "success",
  "message": "Status recorded",
  "next_update_seconds": 30,
  "server_timestamp": "2025-12-17T10:30:36Z"
}
```

### Update Frequency
- **Normal Operation**: Every 30 seconds
- **On State Change**: Immediately (on→off, off→on, error)
- **On High Temperature**: Every 10 seconds (if temp > 60°C)
- **On Low Battery**: Every 10 seconds (if battery < 20%)

### Offline Behavior
- Store up to 3 hours of readings in local cache
- Sync all cached data when connection restored
- Compress data before uploading (if cached)

---

## 3. Periodic Command Polling

### Objective
Check backend for user commands (ON/OFF, brightness changes, schedule updates).

### Flow Diagram
```
Device Operating
    ↓
Every 10 seconds (polling interval)
    ↓
HTTP GET /device/{deviceId}/commands
    ↓
Response: No pending commands
    ↓
Wait 10 seconds, poll again
     ↓ OR
Response: [ON, Brightness: 75]
    ↓
Execute command immediately
    ↓
Return status update
```

### API Endpoint (HTTP Polling)
```
GET /device/{deviceId}/commands
Host: localhost:8000/api
Authorization: Bearer {device_token}
```

### Success Response (200) - No Commands
```json
{
  "status": "ok",
  "commands": [],
  "server_timestamp": "2025-12-17T10:30:46Z"
}
```

### Success Response (200) - Pending Commands
```json
{
  "status": "ok",
  "commands": [
    {
      "command_id": "CMD_001",
      "command_type": "power_control",
      "action": "on",
      "priority": "high",
      "requested_at": "2025-12-17T10:30:40Z"
    },
    {
      "command_id": "CMD_002",
      "command_type": "brightness_control",
      "brightness_level": 75,
      "priority": "normal",
      "requested_at": "2025-12-17T10:30:41Z"
    },
    {
      "command_id": "CMD_003",
      "command_type": "schedule_update",
      "schedule": {
        "enabled": true,
        "sunrise_time": "06:30:00",
        "sunset_time": "18:00:00"
      },
      "priority": "low",
      "requested_at": "2025-12-17T10:30:42Z"
    }
  ],
  "server_timestamp": "2025-12-17T10:30:46Z"
}
```

### Command Execution & Acknowledgment
After executing each command, immediately acknowledge:

```
POST /device/{deviceId}/command-ack
Content-Type: application/json
```

```json
{
  "device_id": "IMEI:351234567890123",
  "command_id": "CMD_001",
  "status": "executed",
  "execution_timestamp": "2025-12-17T10:30:47Z",
  "result": {
    "new_state": "on",
    "actual_brightness": 100
  }
}
```

### Polling Intervals
- **Normal**: Every 10 seconds
- **Low Battery** (< 20%): Every 60 seconds (to save power)
- **Offline/No Connection**: Back off exponentially (10s → 30s → 60s → 300s)
- **User Priority Command**: Poll immediately + every 2 seconds until executed

---

## 4. MQTT Alternative (Optional, Faster)

### Benefit
Reduces latency from 10 seconds (polling) to ~100ms (push) for immediate control.

### Configuration
```json
{
  "mqtt_enabled": true,
  "mqtt_broker": "mqtt.streetlight.com",
  "mqtt_port": 1883,
  "mqtt_username": "device_SL001",
  "mqtt_password": "secure_token_xyz",
  "topics": {
    "subscribe": "devices/SL001/commands",
    "publish": "devices/SL001/status"
  }
}
```

### MQTT Command Topic
```
Topic: devices/{light_id}/commands
Message:
{
  "command_type": "power_control",
  "action": "on",
  "command_id": "CMD_001",
  "timestamp": "2025-12-17T10:30:40Z"
}
```

### MQTT Status Topic
```
Topic: devices/{light_id}/status
Message:
{
  "light_id": "SL001",
  "status": "on",
  "brightness": 85,
  "battery": 95,
  "timestamp": "2025-12-17T10:30:46Z"
}
```

### Fallback to HTTP
- If MQTT connection lost, automatically revert to HTTP polling
- Retry MQTT every 30 seconds
- Log failures for analysis

---

## 5. Complete Device Lifecycle State Machine

```
[POWER_ON]
    ↓
[INITIALIZING] ← Store config, load saved settings
    ↓
[CONFIGURING] ← POST /configure with device data
    ↓ Success
[READY] ← Connected, awaiting commands
    ├─ Every 30s: POST /status
    ├─ Every 10s: GET /commands (or MQTT subscribe)
    ├─ On change: Immediate POST /status + execute command
    ├─ On error: Log, retry with backoff
    └─ On command: Execute → POST /command-ack
    ↓ (repeated loop)
[OFFLINE] ← Lost connection
    ├─ Buffer status/commands locally
    ├─ Exponential backoff polling (10s → 300s)
    └─ On connection restored: Sync all buffered data
    ↓
[ERROR] ← Critical failure detected
    ├─ Set LED status (red)
    ├─ Continue polling for remote reset command
    └─ Log all details for technician
    ↓
[MAINTENANCE] ← Manual technician intervention
    ↓
[POWER_OFF]
```

---

## 6. Error Handling & Retry Logic

### HTTP Errors

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Clear queue, continue |
| 400 | Bad Request | Log error, fix payload, retry once |
| 401 | Unauthorized | Reconfigure device, request new token |
| 404 | Not Found | Device not registered, go to CONFIGURING state |
| 500 | Server Error | Wait 30s, then retry (max 3x) |
| Timeout | No response | Retry after 10s (max 5x), then mark offline |

### Local Error Queue
```
Queue Size: 100 entries (FIFO)
Entry Format:
{
  "timestamp": "...",
  "endpoint": "/status",
  "payload": {...},
  "retry_count": 0,
  "last_retry": "..."
}
```

### Retry Strategy
```
Attempt 1: Immediate
Attempt 2: After 5 seconds
Attempt 3: After 15 seconds
Attempt 4: After 30 seconds
Attempt 5+: Store locally, sync when online
```

---

## 7. Data Persistence & Offline Mode

### Local Storage (Device Flash)
```
Configuration:
  - Device ID, IMEI, GPS
  - Auth token
  - Current schedule
  - Firmware version
  (Size: ~2 KB, survives reboot)

Status Cache:
  - Last 3 hours of readings (30-sec interval)
  - Compression: JSON → GZIP (~30 KB → ~5 KB)
  (Size: ~10 MB max, oldest purged when full)

Command Queue:
  - Pending commands awaiting execution
  - Executed commands awaiting ack
  (Size: ~100 entries max)
```

### Sync on Reconnection
```
Priority Order:
1. Command acknowledgments (ensure server knows what was executed)
2. Critical alerts (battery low, temperature high)
3. Status updates (most recent state)
4. Cached readings (historical data)
5. Logs (debug info)

Compression: Enable gzip for payloads > 10 KB
```

---

## 8. Security & Authentication

### Device Token
```
Issued by server during /configure
Format: JWT with 7-day expiry
Refresh: Automatic on status update response
Invalidation: If device not heard from in 30 days
```

### Request Signature (Optional)
```
Header: X-Device-Signature
Value: HMAC-SHA256(device_secret, request_body)
Used for: Detect tampering, verify device authenticity
```

### TLS/HTTPS
```
All endpoints: HTTPS only
Certificate Pinning: Recommended for embedded devices
```

---

## 9. Monitoring & Alerting

### Device Health Metrics (Backend)

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Last Status | > 2 min | Device offline |
| Battery | < 10% | Critical low |
| Temperature | > 65°C | Overheating |
| GSM Signal | < 10 dBm | Poor connectivity |
| Error Rate | > 5/hour | Device malfunction |

### Dashboard Indicators
```
Green:   Device online, all metrics normal
Yellow:  Offline, low battery, or poor signal
Red:     Critical error, manual intervention needed
Gray:    Unconfigured or never seen
```

---

## 10. Example Implementation (Pseudocode)

### Device Main Loop
```python
class StreetLightDevice:
    def __init__(self):
        self.device_id = read_imei()
        self.config = load_config_from_flash()
        self.status_cache = []
        self.state = "INITIALIZING"
        self.last_status_update = 0
        self.last_command_check = 0
    
    def main_loop(self):
        while True:
            current_time = time.time()
            
            # Initialize
            if self.state == "INITIALIZING":
                self.configure_device()
                self.state = "READY"
            
            # Periodic status update (every 30s or on change)
            if current_time - self.last_status_update > 30 or self.status_changed():
                self.send_status()
                self.last_status_update = current_time
            
            # Periodic command check (every 10s)
            if current_time - self.last_command_check > 10:
                commands = self.get_commands()
                for cmd in commands:
                    self.execute_command(cmd)
                    self.acknowledge_command(cmd)
                self.last_command_check = current_time
            
            # Error handling
            if not self.is_connected():
                self.state = "OFFLINE"
                self.buffer_data()
            else:
                if self.state == "OFFLINE":
                    self.sync_buffered_data()
                self.state = "READY"
            
            time.sleep(1)  # Main loop tick
    
    def configure_device(self):
        payload = {
            "device_id": self.device_id,
            "latitude": self.read_gps()[0],
            "longitude": self.read_gps()[1],
            "status": self.read_power_status(),
            ...
        }
        response = http_post("/device/{}/configure".format(self.device_id), payload)
        if response.status == 200:
            self.config = response.config
            save_config_to_flash(self.config)
    
    def send_status(self):
        payload = {
            "light_id": self.config["light_id"],
            "status": self.read_power_status(),
            "brightness": self.read_brightness(),
            "battery": self.read_battery(),
            "timestamp": time.now()
        }
        try:
            response = http_post("/device/{}/status".format(self.device_id), payload)
            if response.status == 200:
                self.status_cache.clear()
        except:
            self.status_cache.append(payload)
    
    def get_commands(self):
        try:
            response = http_get("/device/{}/commands".format(self.device_id))
            if response.status == 200:
                return response.commands
        except:
            return []
    
    def execute_command(self, cmd):
        if cmd["type"] == "power_control":
            if cmd["action"] == "on":
                self.turn_on()
            else:
                self.turn_off()
        elif cmd["type"] == "brightness_control":
            self.set_brightness(cmd["brightness_level"])
        
        # Acknowledge
        http_post("/device/{}/command-ack".format(self.device_id), {
            "command_id": cmd["id"],
            "status": "executed",
            "timestamp": time.now()
        })
```

---

## 11. Summary Table

| Activity | Frequency | Timeout | Retry | Protocol |
|----------|-----------|---------|-------|----------|
| **Configure** | Once on power-on | 10s | 3x (5min interval) | HTTP POST |
| **Status Update** | Every 30s (or on change) | 5s | Queue + sync | HTTP POST |
| **Command Check** | Every 10s | 5s | Back off → 300s | HTTP GET / MQTT |
| **Command Ack** | Immediately after exec | 5s | Queue locally | HTTP POST |
| **Sync Offline Data** | On reconnection | 30s | Continue on next check | HTTP POST (bulk) |

---

## 12. API Endpoints Summary

```
POST   /device/{deviceId}/configure          → Register & get config
POST   /device/{deviceId}/status              → Send periodic updates
GET    /device/{deviceId}/commands            → Poll for commands
POST   /device/{deviceId}/command-ack         → Acknowledge command
POST   /device/{deviceId}/alert               → Send critical alert
POST   /device/{deviceId}/logs                → Upload device logs
GET    /device/{deviceId}/health              → Get health check
PUT    /device/{deviceId}/firmware            → Firmware update
```

---

## Backend Implementation Checklist

- [ ] POST /configure endpoint with device registration
- [ ] Status storage in `energy_parameters` table
- [ ] Command queue management
- [ ] Command acknowledgment tracking
- [ ] Offline data sync endpoint
- [ ] Device health monitoring
- [ ] Alert generation on missed updates
- [ ] MQTT broker integration (optional)
- [ ] Rate limiting (100 devices = ~10 API calls/sec)
- [ ] Data retention policy (30 days live, archive older)

---

## 13. AI Chatbot Admin Control System

### Overview
AI-powered chatbot with full admin privileges to control street lights through natural language commands. The chatbot automatically switches lights ON/OFF, adjusts brightness, manages schedules, and performs all admin operations.

### Key Features
- **Natural Language Processing**: Understands commands like "Turn on all lights in Delhi" or "Show me battery status"
- **Admin-Level Access**: Full control over all lights, schedules, alerts, and system settings
- **Automatic Actions**: AI monitors conditions and automatically switches lights based on time, sensors, and alerts
- **Multi-Intent Support**: Handles light control, status queries, scheduling, alerts, inspections, and maintenance

### Command Examples
```
"Turn on all lights" → Switches all lights to ON
"Set brightness to 75% for Delhi" → Adjusts brightness for city
"Show lights with low battery" → Filters and displays status
"Turn off lights at midnight" → Creates automatic schedule
"Which lights need maintenance?" → Queries maintenance flags
"Resolve alert #123" → Marks alert as resolved
```

### Architecture Components

#### 1. Backend API Endpoints
```
POST   /api/ai-chatbot/message              → Process natural language command
GET    /api/ai-chatbot/conversation         → Retrieve chat history
POST   /api/ai-chatbot/feedback             → User feedback on AI responses
GET    /api/ai-automation/logs              → View automatic actions log
POST   /api/ai-automation/toggle            → Enable/disable AI automation
```

#### 2. AI Service Integration
- **AI Model Options**: OpenAI GPT-4, Claude, Google Gemini, or local LLM (Llama 2, Mistral)
- **Intent Recognition**: Extracts action, target, and parameters from natural language
- **Entity Extraction**: Identifies light IDs, cities, wards, times, brightness levels
- **Response Generation**: Converts technical results to friendly natural language

#### 3. Automation Engine
```
Time-Based Triggers:
- Sunset/sunrise automation
- Scheduled ON/OFF times
- Time-of-day dimming

Sensor-Based Triggers:
- Ambient light detection
- Motion sensors (future)
- Weather conditions (future)

Alert-Based Triggers:
- Low battery auto-response
- Temperature warnings
- Connectivity issues
```

### Database Schema
```sql
-- AI conversation log
CREATE TABLE ai_chatbot_conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    message TEXT NOT NULL,
    intent_type VARCHAR(50),
    response TEXT NOT NULL,
    executed_action JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI automation actions log
CREATE TABLE ai_automation_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    light_id VARCHAR(100),
    action VARCHAR(20),
    reason VARCHAR(255),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result JSON
);
```

### Frontend Integration
- **Chat Interface**: Fixed position chatbot widget on dashboard
- **Real-time Responses**: WebSocket or polling for instant AI replies
- **Action Confirmation**: Shows executed actions with visual feedback
- **Quick Actions**: Pre-configured buttons for common commands

### Security & Access Control
- AI service authenticated with dedicated admin token
- All AI actions logged with user attribution
- Rate limiting to prevent abuse
- Command validation before execution

### Implementation Status
⏳ **Pending Implementation**:
- AI chatbot controller (PHP backend)
- AI service integration (OpenAI/Claude API)
- Chat UI component (React frontend)
- Automation cron job service
- Database schema for AI logs

📋 **Required for Deployment**:
- AI API key (OpenAI/Claude/Gemini)
- Cron job for automation (runs every 1-5 minutes)
- WebSocket server (optional, for real-time chat)

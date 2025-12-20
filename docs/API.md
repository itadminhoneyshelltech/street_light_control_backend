# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints except `/auth/register` and `/auth/login` require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "city": "Delhi",
  "role": "viewer"  // optional, default: "viewer"
}
```

**Response:** `201 Created`
```json
{
  "status": 201,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "city": "Delhi"
    }
  }
}
```

**Errors:**
- `400 Bad Request` - Missing fields
- `400 Bad Request` - User already exists

---

### 2. Login
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "city": "Delhi"
    }
  }
}
```

**Errors:**
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid credentials

---

## Light Control Endpoints

### 3. Get All Lights
**GET** `/lights/list?city=Delhi`

Retrieve all street lights. If no city specified, uses user's city.

**Query Parameters:**
- `city` (optional) - Filter by city

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Lights retrieved successfully",
  "data": [
    {
      "id": 1,
      "light_id": "SL001",
      "name": "Light 1 - Main Road",
      "city": "Delhi",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "Main Road, Delhi",
      "status": "off",
      "is_automatic": true,
      "brightness": 100,
      "last_status_change": "2025-12-16T10:30:00Z",
      "error_details": null
    }
  ]
}
```

**Errors:**
- `401 Unauthorized` - Invalid or missing token

---

### 4. Get Light Details
**GET** `/lights/detail?lightId=SL001`

Get details of a specific light including recent control logs.

**Query Parameters:**
- `lightId` (required) - Light ID

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Light details retrieved",
  "data": {
    "light": {
      "id": 1,
      "light_id": "SL001",
      "name": "Light 1 - Main Road",
      // ... full light object
    },
    "recentLogs": [
      {
        "id": 1,
        "light_id": "SL001",
        "action": "on",
        "performed_by": "admin@streetlight.com",
        "control_type": "manual",
        "previous_status": "off",
        "new_status": "on",
        "created_at": "2025-12-16T10:30:00Z"
      }
    ]
  }
}
```

**Errors:**
- `400 Bad Request` - Light ID not provided
- `404 Not Found` - Light not found
- `401 Unauthorized` - Invalid token

---

### 5. Get City Summary
**GET** `/lights/summary?city=Delhi`

Get statistics for all lights in a city.

**Query Parameters:**
- `city` (optional) - City name

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "City summary retrieved",
  "data": {
    "id": 1,
    "city": "Delhi",
    "total_lights": 100,
    "lights_on": 45,
    "lights_off": 50,
    "lights_in_error": 5,
    "last_updated": "2025-12-16T10:30:00Z"
  }
}
```

**Errors:**
- `404 Not Found` - No data for city
- `401 Unauthorized` - Invalid token

---

### 6. Get Lights for Map
**GET** `/lights/map?city=Delhi`

Get all lights with minimal data for map display.

**Query Parameters:**
- `city` (optional) - City name

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Map data retrieved",
  "data": [
    {
      "light_id": "SL001",
      "name": "Light 1 - Main Road",
      "location": {
        "latitude": 28.6139,
        "longitude": 77.2090
      },
      "status": "off"
    }
  ]
}
```

---

### 7. Control Light (On/Off)
**POST** `/lights/control`

Turn a light on or off. Requires `operator` or `admin` role.

**Request Body:**
```json
{
  "lightId": "SL001",
  "action": "on"  // "on" or "off"
}
```

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Light turned on",
  "data": {
    "light_id": "SL001",
    "status": "on",
    "is_automatic": false,
    "last_status_change": "2025-12-16T10:31:00Z"
  }
}
```

**Errors:**
- `400 Bad Request` - Missing lightId or action
- `403 Forbidden` - User doesn't have permission (viewers cannot control)
- `404 Not Found` - Light not found
- `401 Unauthorized` - Invalid token

---

### 8. Update Light Status (from Devices)
**POST** `/lights/update-status`

Update light status from IoT device/sensor. For system automatic updates.

**Request Body:**
```json
{
  "lightId": "SL001",
  "status": "error",  // "on", "off", or "error"
  "errorDetails": "Bulb failed"  // optional
}
```

**Response:** `200 OK`
```json
{
  "status": 200,
  "message": "Light status updated",
  "data": {
    "light_id": "SL001",
    "status": "error",
    "error_details": "Bulb failed",
    "last_status_change": "2025-12-16T10:32:00Z"
  }
}
```

**Errors:**
- `400 Bad Request` - Missing required fields
- `404 Not Found` - Light not found
- `401 Unauthorized` - Invalid token

---

## User Roles & Permissions

### Viewer
- View lights list and details
- View city statistics
- View map
- **Cannot**: Control lights

### Operator
- All Viewer permissions
- Control lights (on/off)
- View control history
- **Cannot**: Manage users

### Admin
- All permissions
- Manage users
- Full system control
- Access all logs

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently unlimited, ready for configuration:
- Plan: 1000 requests per hour per IP
- Burst: 100 requests per minute

---

## Examples

### Example: Full Login Flow

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "city": "Delhi"
  }'

# Response includes token

# 2. Use token to get lights
curl -X GET http://localhost:8000/api/lights/list \
  -H "Authorization: Bearer <token_from_response>"

# 3. Control a light
curl -X POST http://localhost:8000/api/lights/control \
  -H "Authorization: Bearer <token_from_response>" \
  -H "Content-Type: application/json" \
  -d '{
    "lightId": "SL001",
    "action": "on"
  }'
```

---

## Version
**API Version**: 1.0
**Last Updated**: December 2025

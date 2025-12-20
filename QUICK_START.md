# 🚦 Street Light Control - Quick Start Guide

## ✅ Everything is Working!

### System Status
- ✅ **Backend (PHP)**: Running on `http://localhost:8000/api`
- ✅ **Frontend (React)**: Running on `http://localhost:3001`
- ✅ **Database (MySQL)**: Connected and populated
- ✅ **Authentication**: JWT tokens working
- ✅ **Lights Data**: 5 sample lights in database

---

## 🎯 How to Use

### Step 1: Login
1. Go to **http://localhost:3001**
2. You'll see the login page with pre-filled credentials:
   - **Email**: `admin@streetlight.com`
   - **Password**: `admin123`
3. Click **Login**

### Step 2: View Dashboard
After login, you'll see:
- 📊 **Statistics**: Total lights, lights on/off, energy savings
- 🗺️ **Map View**: Geographic distribution of lights
- 💡 **Light Control**: Individual light controls
- 📈 **Reports**: Energy usage and performance data

### Step 3: Control Lights
1. Navigate to **"Control Lights"** section
2. You'll see 5 sample lights in Delhi:
   - SL001: Main Road
   - SL002: Park Avenue
   - SL003: Market Street
   - SL004: Hospital Road
   - SL005: School Lane
3. Click the button to turn lights **ON** or **OFF**

### Step 4: View Statistics
- The dashboard auto-fetches statistics every second
- Shows real-time counts and energy metrics
- Data updates as lights are controlled

---

## 🔧 Running the System

### Start Backend (PHP)
```bash
cd street_light_control_backend
php -S localhost:8000 index.php
```

### Start Frontend (React)
```bash
cd street_light_control_frontend
npm install --legacy-peer-deps
npx react-scripts start
# Or: npm start
```

---

## 🗄️ Database

### Database Name
```
street_light_control
```

### Sample Admin User
```
Email: admin@streetlight.com
Password: admin123
Role: admin
City: Delhi
```

### Tables Created
- ✅ users (authentication)
- ✅ street_lights (device registry)
- ✅ city_summary (statistics)
- ✅ control_logs (audit trail)
- ✅ device_commands (command queue)
- ✅ device_logs (diagnostics)
- ✅ firmware_versions (OTA updates)
- ✅ device_health_log (health tracking)
- ✅ energy_parameters (power tracking)
- ✅ battery_status (backup status)
- ✅ alerts (issue tracking)
- ✅ schedules (automation)
- ✅ smart_meters (energy monitoring)
- ✅ gsm_communication_log (network history)

---

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/login
POST /api/auth/register
```

### Lights
```
GET  /api/lights/list              - Get all lights
GET  /api/lights/summary           - Get city statistics
GET  /api/lights/detail/:lightId   - Get light details
GET  /api/lights/map               - Get lights for map
POST /api/lights/control           - Control light (ON/OFF)
```

### Device Communication
```
POST /api/device/configure         - Register device
POST /api/device/status            - Update device status
GET  /api/device/commands          - Get pending commands
POST /api/device/command-ack       - Acknowledge command
POST /api/device/alert             - Send alert
GET  /api/device/health            - Get health status
```

### Testing
Visit **http://localhost:8000/TEST_API_FLOW.html** for interactive API testing.

---

## 🧪 Testing Checklist

### Frontend
- [ ] Login with admin credentials
- [ ] See statistics on dashboard
- [ ] View lights in control section
- [ ] Turn lights ON/OFF
- [ ] See status update in real-time
- [ ] View map with light locations
- [ ] Check reports and energy savings

### Backend API
- [ ] GET /api - API documentation
- [ ] POST /api/auth/login - Login flow
- [ ] GET /api/lights/list - Get lights (requires auth)
- [ ] GET /api/lights/summary - Get statistics (requires auth)
- [ ] POST /api/lights/control - Control lights (requires admin)
- [ ] POST /api/device/configure - Device registration (no auth)
- [ ] POST /api/device/status - Update device status (no auth)

### Database
- [ ] Users table has admin account
- [ ] Street lights table has 5 sample lights
- [ ] Control logs record all light control actions
- [ ] City summary shows correct counts
- [ ] Device tables accept new records

---

## 📱 Key Features Implemented

### ✅ Authentication
- JWT token-based auth
- Role-based access control (admin/operator/viewer)
- Persistent login with localStorage
- Auto-logout on 401

### ✅ Light Management
- View all lights status
- Control lights (ON/OFF)
- Real-time statistics
- Map visualization
- City-based filtering

### ✅ Device Communication
- Device registration
- Status updates
- Command queue
- Log storage
- Health tracking
- Firmware version management

### ✅ Energy Monitoring
- Energy parameter tracking
- Battery status monitoring
- Power consumption logging
- Smart meter integration
- GSM communication logs

### ✅ System Features
- Control logs (audit trail)
- Alert management
- Scheduled automation
- City summary statistics
- Reports and analytics

---

## 🚀 Next Steps

### To Deploy
1. Set production environment variables
2. Configure MySQL backups
3. Set up CORS properly for production domain
4. Enable SSL/HTTPS
5. Configure nginx/Apache reverse proxy
6. Set up monitoring and logging

### To Extend
1. Add more cities
2. Integrate IoT device manufacturer APIs
3. Add advanced scheduling rules
4. Implement mobile app (React Native)
5. Add predictive analytics
6. Integrate with SMS/Email alerts

---

## 📞 Default Credentials

**Admin Account**
- Email: `admin@streetlight.com`
- Password: `admin123`

**Test API URL**
- `http://localhost:8000/TEST_API_FLOW.html`

**Frontend**
- `http://localhost:3001`

**Backend API**
- `http://localhost:8000/api`

---

## 🎓 Learning Resources

### Database Documentation
- [DATABASE_SIMPLE_GUIDE.md](DATABASE_SIMPLE_GUIDE.md) - Easy explanation
- [DATABASE_VISUAL_GUIDE.md](DATABASE_VISUAL_GUIDE.md) - Visual workflows
- [DATABASE_QUICK_REFERENCE.md](DATABASE_QUICK_REFERENCE.md) - Quick lookup
- [DATABASE_TABLES_COMPLETE_GUIDE.md](DATABASE_TABLES_COMPLETE_GUIDE.md) - Full technical

### API Testing
- [TEST_API_FLOW.html](street_light_control_backend/TEST_API_FLOW.html) - Interactive tester

### Architecture
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [docs/API.md](docs/API.md) - API documentation

---

## ✨ Status Summary

| Component | Status | Port | URL |
|-----------|--------|------|-----|
| Backend | ✅ Running | 8000 | http://localhost:8000/api |
| Frontend | ✅ Running | 3001 | http://localhost:3001 |
| Database | ✅ Connected | 3306 | street_light_control |
| API Tests | ✅ Ready | 8000 | http://localhost:8000/TEST_API_FLOW.html |

---

## 🎉 You're All Set!

The system is fully functional. Go to **http://localhost:3001** and start controlling lights!

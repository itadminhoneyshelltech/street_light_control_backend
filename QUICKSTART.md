# QUICK START GUIDE

## 🚀 Fast Setup (5-10 minutes)

### Prerequisites Check
```bash
# Check PHP version
php -v  # Should be 7.4+

# Check MySQL
mysql --version  # Should be 5.7+

# Check Node.js
node -v  # Should be 16+
npm -v   # Should be 8+
```

---

## 📦 Backend Setup (PHP + MySQL)

### Step 1: Create Database
```bash
# Open MySQL
mysql -u root -p

# Inside MySQL
CREATE DATABASE street_light_control;
USE street_light_control;
SOURCE backend/database.sql;
EXIT;
```

### Step 2: Configure Backend
```bash
cd backend
# Edit config/Config.php or create .env file
# Ensure DB credentials match your MySQL setup
```

### Step 3: Start Backend Server
```bash
php -S localhost:8000
```

✅ Backend ready at: `http://localhost:8000/api`

**Test it:**
```bash
curl http://localhost:8000/api/health
```

---

## 🎨 Frontend Setup (React)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Configure
```bash
cp .env.example .env
# Edit .env - set REACT_APP_API_URL=http://localhost:8000/api
```

### Step 3: Start Dev Server
```bash
npm start
```

✅ Frontend ready at: `http://localhost:3000`

**Login with test account:**
- Email: `admin@streetlight.com`
- Password: (check database.sql for the password you set)

---

## 📱 Mobile Setup (React Native) - Optional

### Step 1: Install Dependencies
```bash
cd mobile
npm install
npx pod-install ios  # If on macOS
```

### Step 2: Configure API
Edit `mobile/src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://192.168.1.x:8000/api';
// Replace with your PC's IP address
```

### Step 3: Run on Device/Emulator

**Android:**
```bash
npm run android
```

**iOS (macOS only):**
```bash
npm run ios
```

---

## 📋 First Steps After Starting

### 1. Login
- Go to `http://localhost:3000`
- Use admin credentials or register new account

### 2. Add Test Lights
Database already has 5 sample lights in Delhi. To add more:

```bash
# Connect to MySQL
mysql -u root -p street_light_control

# Insert a new light
INSERT INTO street_lights (light_id, name, city, latitude, longitude, address, status)
VALUES ('SL006', 'Light 6 - Test', 'Delhi', 28.6180, 77.2140, 'Test Road, Delhi', 'off');

# Update city summary
UPDATE city_summary SET total_lights = 6 WHERE city = 'Delhi';
```

### 3. Test Control Features
- Turn lights on/off (if you're admin/operator)
- View statistics
- Check map (with Google Maps API key)

---

## 🔑 Credentials

### Admin Account (Pre-configured)
```
Email: admin@streetlight.com
Password: (default hash in database.sql)
Role: Admin
City: Delhi
```

### Create New Account
1. Click "Register" on login page
2. Fill form with your details
3. Select your city
4. Create account

---

## 🛠️ Environment Variables

### Backend (Optional, edit config/Config.php)
```
DB_HOST=localhost
DB_NAME=street_light_control
DB_USER=root
DB_PASS=
JWT_SECRET=your-secret-key
```

### Frontend (.env file)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

---

## 📊 Database Sample Data

The `database.sql` includes:
- 1 Admin user
- 5 Sample street lights in Delhi with GPS coordinates
- Proper indexes for performance

---

## 🐛 Common Issues & Fixes

### Backend won't start
```bash
# Check if port 8000 is in use
# Try different port:
php -S localhost:8001

# Or kill process using 8000:
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -i :8000
```

### Frontend can't connect to backend
1. Verify backend is running: `curl http://localhost:8000/api/health`
2. Check REACT_APP_API_URL in `.env`
3. Check browser console for CORS errors

### Database connection failed
```bash
# Test MySQL connection
mysql -u root -p -e "SELECT 1;"

# Check credentials in Config.php
# Default user: root, password: empty
```

### Map not showing
1. Get Google Maps API key from https://console.cloud.google.com
2. Add to `.env`: `REACT_APP_GOOGLE_MAPS_API_KEY=your-key`
3. Enable Maps JavaScript API in console

---

## 📚 Next Steps

1. **Read Documentation**
   - [README.md](../README.md) - Full documentation
   - [ARCHITECTURE.md](ARCHITECTURE.md) - System design
   - [API.md](API.md) - API endpoints

2. **Customize**
   - Add your city and lights to database
   - Modify UI colors in CSS files
   - Configure role permissions

3. **Deploy**
   - Configure production database
   - Set secure JWT_SECRET
   - Deploy frontend to hosting
   - Deploy backend to server

4. **Integrate Devices**
   - Connect IoT devices to `/lights/update-status` endpoint
   - Implement automatic on/off based on sunrise/sunset
   - Add sensors for real-time status

---

## 💡 Key Features

✅ **Instant Setup** - Everything works with default settings
✅ **Sample Data** - Pre-loaded for testing
✅ **Responsive** - Works on desktop, tablet, mobile
✅ **Production Ready** - Follow [ARCHITECTURE.md](ARCHITECTURE.md) for deployment
✅ **Extensible** - Easy to add features

---

## 📞 Testing API

### Quick API Test
```bash
# Using curl or Postman

# 1. Register
POST http://localhost:8000/api/auth/register
{
  "name": "Test",
  "email": "test@test.com",
  "password": "password123",
  "city": "Delhi"
}

# 2. Login
POST http://localhost:8000/api/auth/login
{
  "email": "test@test.com",
  "password": "password123"
}

# Copy the token from response

# 3. Get lights (use token in Authorization header)
GET http://localhost:8000/api/lights/list
Header: Authorization: Bearer <token>
```

---

**Stuck?** Check the comprehensive documentation in `/docs/` folder!

**Last Updated**: December 2025

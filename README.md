# Street Light Control System - Complete Setup Guide

## Project Overview

A professional, responsive street light control system with:
- **Frontend**: React + TypeScript (Web & Mobile-ready)
- **Backend**: PHP with MySQL
- **Mobile**: React Native (iOS & Android)
- **Features**: Real-time control, Google Maps integration, Role-based access

---

## 📁 Project Structure

```
Street_Light_Control_Systems/
├── backend/                    # PHP backend
│   ├── config/                 # Configuration files
│   │   ├── Config.php          # App settings
│   │   └── Database.php        # DB connection
│   ├── core/                   # Core classes
│   │   ├── Response.php        # API response handler
│   │   ├── JWT.php             # Token management
│   │   └── Router.php          # URL routing
│   ├── models/                 # Data models
│   │   ├── User.php
│   │   ├── StreetLight.php
│   │   ├── ControlLog.php
│   │   └── CitySummary.php
│   ├── controllers/            # Business logic
│   │   ├── AuthController.php
│   │   └── LightController.php
│   ├── middleware/             # Middleware
│   │   └── Auth.php
│   ├── index.php               # Entry point
│   ├── database.sql            # SQL schema
│   └── .htaccess               # Apache config
│
├── frontend/                   # React web app
│   ├── src/
│   │   ├── pages/              # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Statistics.tsx
│   │   │   ├── LightControl.tsx
│   │   │   └── MapView.tsx
│   │   ├── services/           # API services
│   │   │   └── api.ts
│   │   ├── store/              # State management
│   │   │   └── authStore.ts
│   │   ├── styles/             # CSS files
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   │   └── index.html
│   └── package.json
│
├── mobile/                     # React Native app
│   ├── src/
│   │   ├── screens/            # Screen components
│   │   │   └── Dashboard.tsx
│   │   ├── store/              # State management
│   │   │   └── authStore.ts
│   │   └── services/           # API services
│   └── package.json
│
└── docs/                       # Documentation
```

---

## 🚀 Backend Setup (PHP + MySQL)

### Prerequisites
- **PHP 7.4+** with extensions: mysqli, mbstring, json
- **MySQL 5.7+** or **MariaDB**
- **Apache/Nginx** with mod_rewrite enabled
- **cURL** (for API testing)

### Step 1: Database Setup

```bash
# Connect to MySQL
mysql -u root -p

# Create database and import schema
CREATE DATABASE street_light_control;
USE street_light_control;
SOURCE backend/database.sql;
```

### Step 2: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_NAME=street_light_control
DB_USER=root
DB_PASS=your_password
DB_PORT=3306
JWT_SECRET=your-secret-key-change-in-production
API_URL=http://localhost:8000/api
FRONTEND_URL=http://localhost:3000
```

### Step 3: Run PHP Server

```bash
cd backend
php -S localhost:8000
```

The backend API will be available at: `http://localhost:8000/api`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

#### Street Lights
- `GET /api/lights/list` - Get all lights
- `GET /api/lights/detail?lightId=SL001` - Get light details
- `GET /api/lights/summary` - Get city summary
- `GET /api/lights/map` - Get lights for map
- `POST /api/lights/control` - Turn light on/off
- `POST /api/lights/update-status` - Update light status (from devices)

---

## 🎨 Frontend Setup (React + TypeScript)

### Prerequisites
- **Node.js 16+**
- **npm** or **yarn**

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Step 3: Start Development Server

```bash
npm start
```

Frontend will be available at: `http://localhost:3000`

### Features

✅ **Responsive Design** - Works on desktop, tablet, and mobile
✅ **Real-time Updates** - Socket.io integration (ready)
✅ **Google Maps** - View all lights on map with status colors
✅ **Role-Based Access** - Admin, Operator, Viewer roles
✅ **Statistics Dashboard** - City-wide light statistics
✅ **Manual Control** - Turn lights on/off (operator/admin only)
✅ **Light Details** - View history and error logs

---

## 📱 Mobile Setup (React Native)

### Prerequisites
- **Node.js 16+**
- **Android Studio** & SDK (for Android)
- **Xcode** (for iOS on macOS)
- **React Native CLI**

### Step 1: Install Dependencies

```bash
cd mobile
npm install
npx pod-install ios  # For iOS
```

### Step 2: Configure API

Edit `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://your-backend-ip:8000/api';
```

### Step 3: Run on Android

```bash
npm run android
```

### Step 4: Run on iOS

```bash
npm run ios
```

### Shared Code

Mobile and web share the same:
- ✅ API services
- ✅ State management (Zustand)
- ✅ Business logic
- ✅ Authentication

Only UI components differ (React vs React Native)

---

## 🔐 Authentication & Authorization

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | View, Control, Manage Users, Full Statistics |
| **Operator** | View, Control, Limited Statistics |
| **Viewer** | View Only, No Control |

### JWT Token Flow

1. User registers/logs in
2. Server validates credentials
3. Returns JWT token + user data
4. Client stores token in localStorage (web) or AsyncStorage (mobile)
5. Token included in every API request header

---

## 📊 Database Schema

### Users Table
```sql
- id (INT, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- role (ENUM: admin, operator, viewer)
- city (VARCHAR)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Street Lights Table
```sql
- id (INT, PK)
- light_id (VARCHAR, UNIQUE)
- name (VARCHAR)
- city (VARCHAR)
- latitude, longitude (DECIMAL)
- address (TEXT)
- status (ENUM: on, off, error)
- is_automatic (BOOLEAN)
- brightness (INT: 0-100)
- error_details (TEXT)
- energy_consumption (FLOAT)
- last_status_change (TIMESTAMP)
```

### Control Logs Table
```sql
- id (INT, PK)
- light_id (VARCHAR, FK)
- action (ENUM: on, off, brightness_change, mode_change)
- performed_by (VARCHAR)
- user_id (INT, FK)
- control_type (ENUM: manual, automatic)
- previous_status (VARCHAR)
- new_status (VARCHAR)
- reason (TEXT)
- created_at (TIMESTAMP)
```

### City Summary Table
```sql
- id (INT, PK)
- city (VARCHAR, UNIQUE)
- total_lights (INT)
- lights_on (INT)
- lights_off (INT)
- lights_in_error (INT)
- last_updated (TIMESTAMP)
```

---

## 🔌 API Integration

### Example: Login

**Request:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@streetlight.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "status": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@streetlight.com",
      "role": "admin",
      "city": "Delhi"
    }
  }
}
```

### Example: Control Light

**Request:**
```bash
curl -X POST http://localhost:8000/api/lights/control \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "lightId": "SL001",
    "action": "on"
  }'
```

---

## 🛠️ Development Workflow

### Making Changes

1. **Backend Changes**: Edit PHP files in `/backend`
   - No build required, changes apply immediately
   - Clear error logs if needed

2. **Frontend Changes**: Edit React files in `/frontend`
   - Hot reload enabled during development
   - Check browser console for errors

3. **Mobile Changes**: Edit files in `/mobile`
   - Rebuild and redeploy to device/emulator

### Testing

**Test Admin User:**
```
Email: admin@streetlight.com
Password: (set in database.sql)
Role: admin
```

---

## 📦 Production Deployment

### Backend (PHP)

1. **Move to production server**
```bash
scp -r backend/* user@server:/var/www/html/api/
```

2. **Configure permissions**
```bash
chmod 755 /var/www/html/api
chmod 755 /var/www/html/api/logs
```

3. **Set environment variables**
```bash
export JWT_SECRET="production-secret"
export DB_PASS="production-db-password"
```

### Frontend (React)

1. **Build for production**
```bash
cd frontend
npm run build
```

2. **Deploy to CDN/Server**
```bash
scp -r build/* user@server:/var/www/html/
```

### Mobile (React Native)

1. **Build APK (Android)**
```bash
cd mobile
npm run android -- --release
```

2. **Build IPA (iOS)**
```bash
cd mobile
npm run ios -- --configuration Release
```

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

**JWT Token Error**
- Verify `JWT_SECRET` is set
- Check token hasn't expired (24 hours)
- Clear localStorage and re-login

### Frontend Issues

**API Connection Failed**
- Check backend is running
- Verify `REACT_APP_API_URL` in `.env`
- Check CORS configuration in backend

**Map Not Displaying**
- Verify Google Maps API key in `.env`
- Check API key has Maps API enabled
- Verify location coordinates are valid

---

## 📚 Additional Resources

- [PHP Documentation](https://www.php.net/manual/)
- [React Documentation](https://react.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Google Maps API](https://developers.google.com/maps)

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 👥 Support

For issues or questions, please refer to the documentation or contact the development team.

**Last Updated**: December 2025
**Version**: 1.0.0

# Local Development Setup Guide

## Prerequisites
- **Node.js** 18+ (for frontend)
- **PHP** 8.3+ (for backend)
- **MySQL** 5.7+ (database)
- **Git**

## Quick Start

### 1. Create Local Environment Files

#### Frontend Local Dev (`.env.development.local`)
Create file: `street_light_control_frontend/.env.development.local`
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyB5lyoc8b4AX84itcmk9yAa_r_-qlDkzyA
REACT_APP_MAP_PLACEHOLDER_URL=/map-sample.html
```

#### Backend Local Dev (`.env.local`)
Create file: `street_light_control_backend/.env.local`
```bash
PORT=8000
JWT_SECRET=dev-secret-change-in-production
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

DB_HOST=localhost
DB_NAME=street_light_control
DB_USER=root
DB_PASS=Honeyshell2024
DB_PORT=3306

# API base
API_URL=http://localhost:8000/api

# OpenAI API Configuration (optional)
OPENAI_API_KEY=
```

---

## Running Locally

### Terminal 1: Start Backend (PHP)

```powershell
cd street_light_control_backend

# Run PHP development server
php -S localhost:8000
```

✅ Backend runs at: `http://localhost:8000`  
✅ API at: `http://localhost:8000/api`

---

### Terminal 2: Start Frontend (React)

```powershell
cd street_light_control_frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm start
```

✅ Frontend runs at: `http://localhost:3000`

---

## Testing the Setup

### Quick Connectivity Test
```powershell
# Check backend is running
curl http://localhost:8000/api/health

# Should return something like:
# {"status":"Backend server is running"}
```

### Test API Endpoint
```powershell
# Get city summary
curl "http://localhost:8000/api/lights/summary?city=1"
```

---

## Database Setup

### Check Database Connection
```bash
mysql -h localhost -u root -p street_light_control
```

### Run Migrations (if needed)
```powershell
cd street_light_control_backend

# Run filter columns migration
php add-filter-columns.php

# Or run complete database setup
php database.sql  # Import if using fresh database
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 8000 already in use | Change to another port: `php -S localhost:8001` |
| Port 3000 already in use | Frontend will auto-use 3001, 3002, etc. |
| MySQL connection refused | Ensure MySQL is running: `mysqld` or `services.msc` |
| Frontend can't reach backend | Check `.env.development.local` has `REACT_APP_API_URL=http://localhost:8000/api` |
| CORS errors | Backend `Config.php` has localhost URLs in `ALLOWED_ORIGINS` |

---

## File Locations

```
street_light_control_frontend/
├── .env                          # Production env (do NOT use locally)
├── .env.development.local        # ← USE THIS for local dev
└── .env.local                    # Alternate local file

street_light_control_backend/
├── .env_global                   # Production env (do NOT use locally)
├── .env.local                    # ← USE THIS for local dev (create it)
└── config/Config.php             # Fallback defaults
```

---

## Stop Local Servers

### Frontend
Press `Ctrl+C` in the terminal running `npm start`

### Backend
Press `Ctrl+C` in the terminal running `php -S localhost:8000`

---

## Production vs Local

| Setting | Local | Production |
|---------|-------|-----------|
| Frontend URL | `http://localhost:3000` | `https://streetlight.honeyshelltech.com` |
| Backend URL | `http://localhost:8000/api` | `https://streetlightapi.honeyshelltech.com/api` |
| DB Host | `localhost` | Production server IP |
| Node ENV | `development` | `production` |

---

## Notes

- **Local** env files (`.env.local`, `.env.development.local`) override production `.env` files
- Always use local env files for development
- Never commit credentials to git (they're in `.gitignore`)
- Google Maps API key works on localhost with `http://localhost:*` restriction in API settings

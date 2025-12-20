# 🚀 QUICK START GUIDE - LOCAL & PRODUCTION

## 📋 Files Overview

| File | Purpose |
|------|---------|
| `START_LOCAL.bat` / `.ps1` | Start local development servers |
| `BUILD_FOR_PRODUCTION.bat` / `.ps1` | Build for Hostinger deployment |
| `HOSTINGER_DEPLOYMENT_GUIDE.md` | Complete deployment instructions |

---

## 🏠 LOCAL DEVELOPMENT

### Quick Start (Easiest Way)
```powershell
# Double-click or run:
.\START_LOCAL.ps1
```

This automatically:
- ✅ Sets LOCAL environment files
- ✅ Starts MySQL service
- ✅ Starts Backend (PHP) on http://localhost:8000
- ✅ Starts Frontend (React) on http://localhost:3000

### Manual Start
```powershell
# Terminal 1 - Backend
cd street_light_control_backend
php -S localhost:8000

# Terminal 2 - Frontend  
cd street_light_control_frontend
npm start
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Login: `admin@streetlight.com` / `admin123`

---

## 🌐 PRODUCTION DEPLOYMENT (Hostinger)

### Step 1: Build Production Files
```powershell
# Double-click or run:
.\BUILD_FOR_PRODUCTION.ps1
```

This automatically:
- ✅ Sets PRODUCTION environment files
- ✅ Installs dependencies
- ✅ Builds optimized React bundle in `build/` folder

### Step 2: Upload to Hostinger

**Frontend:**
1. Upload all files from `street_light_control_frontend/build/` to `/public_html/`
2. Upload `.htaccess` from frontend folder to `/public_html/`

**Backend:**
1. Create subdomain `streetlightapi.honeyshelltech.com` → `/public_html/api/`
2. Upload `street_light_control_backend/` contents to `/public_html/api/`
3. Rename `.env_global` to `.env` on server

**Database:**
1. Go to Hostinger phpMyAdmin
2. Select `u798810928_street_light` database
3. Import `database.sql`

### Step 3: Test Production
- Frontend: https://streetlight.honeyshelltech.com
- Backend: https://streetlightapi.honeyshelltech.com/api/health

---

## 📂 Environment Files (DO NOT MODIFY MANUALLY)

Scripts automatically manage these:

### Backend
- **Local:** `.env.local` → `localhost:8000`, database: `street_light_control`
- **Production:** `.env_global` → Hostinger, database: `u798810928_street_light`

### Frontend
- **Local:** `.env.local` → http://localhost:8000/api
- **Production:** `.env` → https://streetlightapi.honeyshelltech.com/api

---

## 🔄 Switching Environments

The system uses **different environment files** for local and production:

| Environment | Command | Environment Files Used |
|------------|---------|----------------------|
| Local Dev | `START_LOCAL.ps1` | `.env.local` |
| Production Build | `BUILD_FOR_PRODUCTION.ps1` | `.env`, `.env_global` |

**Your code stays the same** - only environment variables change!

---

## ✅ What's Configured

### Local Development
- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:3000  
- ✅ Database: MySQL local (`street_light_control`)
- ✅ Hot reload enabled
- ✅ Debug mode on

### Production (Hostinger)
- ✅ Frontend: https://streetlight.honeyshelltech.com
- ✅ Backend: https://streetlightapi.honeyshelltech.com
- ✅ Database: Hostinger MySQL (`u798810928_street_light`)
- ✅ Optimized build
- ✅ HTTPS/SSL enabled
- ✅ Production mode

---

## 🐛 Troubleshooting

### Local Issues

**MySQL not connecting:**
```powershell
Start-Service MySQL80
```

**Port 8000 already in use:**
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Production Issues

**API not working:**
- Check `.env` file exists in `/public_html/api/`
- Verify `.htaccess` uploaded correctly
- Check database credentials

**CORS errors:**
- Verify `.htaccess` has CORS headers
- Clear browser cache

**500 Error:**
- Check PHP error logs in Hostinger panel
- Verify file permissions (755 for folders, 644 for files)

---

## 📞 Need More Help?

See complete guide: [HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md)

---

## 🎉 Summary

**Run Locally:**
```powershell
.\START_LOCAL.ps1
```

**Deploy to Hostinger:**
```powershell
.\BUILD_FOR_PRODUCTION.ps1
# Then upload build/ folder to Hostinger
```

**That's it!** No code changes needed between environments! 🚀

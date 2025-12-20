# 🚀 Complete Hostinger Deployment Guide

## 📋 Overview

This guide will help you deploy both **Frontend** (React) and **Backend** (PHP) to Hostinger without disturbing your local development environment.

---

## 🔧 Environment Configuration

### ✅ LOCAL Development
- Uses `.env.local` files
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Database: Local MySQL (`street_light_control`)

### ✅ PRODUCTION (Hostinger)
- Uses `.env` and `.env_global` files
- Backend: `https://streetlightapi.honeyshelltech.com`
- Frontend: `https://streetlight.honeyshelltech.com`
- Database: Hostinger MySQL (`u798810928_street_light`)

---

## 🏠 Running LOCALLY (Development)

### Option 1: Using Scripts (Easiest)
```powershell
# Windows PowerShell
.\START_LOCAL.ps1

# Or use batch file
.\START_LOCAL.bat
```

### Option 2: Manual Start
```powershell
# Terminal 1 - Backend
cd street_light_control_backend
php -S localhost:8000

# Terminal 2 - Frontend
cd street_light_control_frontend
npm start
```

**Access:**
- Backend API: http://localhost:8000/api
- Frontend: http://localhost:3000
- Login: admin@streetlight.com / admin123

---

## 🌐 Deploying to HOSTINGER

### Step 1: Build Production Files

Run the build script:
```powershell
# Windows PowerShell
.\BUILD_FOR_PRODUCTION.ps1

# Or use batch file
.\BUILD_FOR_PRODUCTION.bat
```

This creates optimized files in `street_light_control_frontend/build/`

### Step 2: Upload Frontend to Hostinger

**Via File Manager:**
1. Login to Hostinger Control Panel
2. Go to **Files → File Manager**
3. Navigate to `public_html/` folder
4. Upload ALL files from `street_light_control_frontend/build/` to `public_html/`

**Via FTP (Recommended):**
```bash
# Using FileZilla or WinSCP
Host: ftp.yourdomain.com
Username: your-hostinger-username
Password: your-hostinger-password
Port: 21

# Upload contents of 'build' folder to public_html/
```

### Step 3: Upload Backend to Hostinger

**Create API subdomain:**
1. In Hostinger Panel: **Domains → Subdomains**
2. Create subdomain: `streetlightapi.honeyshelltech.com`
3. Point it to folder: `/public_html/api/`

**Upload Backend:**
1. Upload entire `street_light_control_backend/` folder to `/public_html/api/`
2. Make sure `.env_global` is renamed to `.env` on server
3. Verify folder structure:
```
/public_html/api/
├── config/
├── controllers/
├── core/
├── models/
├── middleware/
├── .env (from .env_global)
├── .htaccess
└── index.php
```

### Step 4: Configure Database on Hostinger

**Create Database:**
1. Hostinger Panel: **Databases → MySQL Databases**
2. Database Name: `u798810928_street_light` (already exists)
3. Username: `u798810928_street_light`
4. Password: `Honeyshell2024`

**Import Database:**
1. Go to **phpMyAdmin**
2. Select database `u798810928_street_light`
3. Click **Import** tab
4. Upload `street_light_control_backend/database.sql`
5. Click **Go** to execute

### Step 5: Configure .htaccess Files

**Frontend .htaccess** (`public_html/.htaccess`):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable CORS
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

**Backend .htaccess** (`public_html/api/.htaccess`):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>

# Enable CORS
<IfModule mod_headers.c>
  Header always set Access-Control-Allow-Origin "*"
  Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
  Header always set Access-Control-Allow-Credentials "true"
</IfModule>

# Handle OPTIONS requests
<IfModule mod_rewrite.c>
  RewriteCond %{REQUEST_METHOD} OPTIONS
  RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

### Step 6: Set File Permissions

```bash
# Via SSH or File Manager
chmod 755 api/
chmod 644 api/index.php
chmod 600 api/.env
chmod 755 api/logs/
```

### Step 7: Verify SSL Certificate

**Enable HTTPS:**
1. Hostinger Panel: **Security → SSL**
2. Enable SSL for both domains:
   - `streetlight.honeyshelltech.com`
   - `streetlightapi.honeyshelltech.com`

### Step 8: Test Production Deployment

**Test Backend API:**
```bash
curl https://streetlightapi.honeyshelltech.com/api/health
# Should return: {"status":"Backend server is running"}
```

**Test Frontend:**
1. Visit: https://streetlight.honeyshelltech.com
2. Login with: admin@streetlight.com / admin123
3. Check all features work

---

## 🔄 Switching Between Environments

### Run Local Development
```powershell
.\START_LOCAL.ps1
```
This automatically:
- Copies `.env.local` files
- Starts local MySQL
- Runs PHP server on port 8000
- Runs React dev server on port 3000

### Build for Production
```powershell
.\BUILD_FOR_PRODUCTION.ps1
```
This automatically:
- Copies production `.env` files
- Builds optimized React bundle
- Ready for Hostinger upload

---

## 📁 File Structure on Hostinger

```
public_html/
├── api/                          # Backend (streetlightapi.honeyshelltech.com)
│   ├── config/
│   ├── controllers/
│   ├── core/
│   ├── models/
│   ├── middleware/
│   ├── .env                      # Production config
│   ├── .htaccess
│   └── index.php
├── index.html                    # Frontend (streetlight.honeyshelltech.com)
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── asset-manifest.json
└── .htaccess
```

---

## ✅ Environment Files Summary

### Backend
| File | Purpose | Database |
|------|---------|----------|
| `.env.local` | Local development | `street_light_control` |
| `.env_global` | Production (Hostinger) | `u798810928_street_light` |

### Frontend
| File | Purpose | API URL |
|------|---------|---------|
| `.env.local` | Local development | `http://localhost:8000/api` |
| `.env` | Production (Hostinger) | `https://streetlightapi.honeyshelltech.com/api` |

---

## 🐛 Troubleshooting

### Local Development Issues

**MySQL Connection Error:**
```powershell
# Start MySQL service
Start-Service MySQL80

# Or check if running
Get-Service MySQL*
```

**Port Already in Use:**
```powershell
# Kill processes on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Production Issues

**500 Internal Server Error:**
- Check `.htaccess` syntax
- Verify `.env` file exists with correct values
- Check PHP error logs in Hostinger panel

**CORS Errors:**
- Update `.htaccess` with CORS headers (see Step 5)
- Verify `FRONTEND_URL` in backend `.env`

**Database Connection Failed:**
- Verify credentials in `.env`
- Use `localhost` as `DB_HOST` (not `127.0.0.1`)
- Check phpMyAdmin access

**Frontend Shows Blank Page:**
- Clear browser cache
- Check browser console for errors
- Verify `REACT_APP_API_URL` in `.env`

---

## 📞 Quick Commands Reference

```powershell
# LOCAL DEVELOPMENT
.\START_LOCAL.ps1                 # Start both servers
cd street_light_control_backend   # Backend only
php -S localhost:8000             # Run backend
cd street_light_control_frontend  # Frontend only
npm start                         # Run frontend

# PRODUCTION BUILD
.\BUILD_FOR_PRODUCTION.ps1        # Build for Hostinger

# TESTING
curl http://localhost:8000/api/health              # Test local backend
curl https://streetlightapi.honeyshelltech.com/api/health  # Test production backend
```

---

## 📝 Deployment Checklist

**Before Deployment:**
- [ ] All code tested locally
- [ ] Database schema updated
- [ ] Environment variables configured
- [ ] Production build created

**Upload to Hostinger:**
- [ ] Frontend files uploaded to `public_html/`
- [ ] Backend files uploaded to `public_html/api/`
- [ ] Database imported to phpMyAdmin
- [ ] `.htaccess` files configured
- [ ] SSL certificates enabled

**Post-Deployment:**
- [ ] Test backend API endpoints
- [ ] Test frontend loading
- [ ] Test user authentication
- [ ] Test all CRUD operations
- [ ] Verify Google Maps integration
- [ ] Check responsive design

---

## 🎉 Success!

Your system is now running in **DUAL MODE**:
- 🏠 **LOCAL**: Development with hot-reload
- 🌐 **PRODUCTION**: Optimized Hostinger deployment

No code changes needed - just use the scripts to switch between environments!

**Frontend Production:** https://streetlight.honeyshelltech.com  
**Backend Production:** https://streetlightapi.honeyshelltech.com/api  
**Login:** admin@streetlight.com / admin123

# Street Light Control System - Quick Start

## Backend Setup (PHP + MySQL)

### 1. Start the Backend Server

From the backend directory, run:
```powershell
& "C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000 index.php
```

Or simply double-click `start-server.bat` in the backend folder.

**Backend will be available at:** `http://localhost:8000/api`

### 2. Test the API

Open in browser: http://localhost:8000/api/health

Or test with PowerShell:
```powershell
Invoke-RestMethod http://localhost:8000/api/health
```

---

## Frontend Setup (React)

### 1. Ensure .env file exists

The `.env` file should already be created with:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyB5lyoc8b4AX84itcmk9yAa_r_-qlDkzyA
```

### 2. Start the Frontend

```powershell
cd frontend
npm start
```

**Frontend will open at:** `http://localhost:3000`

---

## Default Login Credentials

Check `backend/database.sql` for the admin credentials:
- Email: `admin@streetlight.com`  
- Password: `admin123` (or check the hashed password in the SQL file)

---

## Common Issues

**Problem:** `php: command not found`  
**Solution:** Use the full PHP path shown above, or add PHP to your PATH

**Problem:** Backend not responding  
**Solution:** Make sure you're in the backend directory when starting the server

**Problem:** Frontend can't connect to API  
**Solution:** Verify `.env` has correct `REACT_APP_API_URL=http://localhost:8000/api`

---

## Need Help?

1. Backend logs appear in the terminal where you started the PHP server
2. Frontend errors appear in browser DevTools Console (F12)
3. Check that MySQL is running and database is created

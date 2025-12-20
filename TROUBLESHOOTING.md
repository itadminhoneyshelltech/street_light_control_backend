# Troubleshooting Guide

## Problem: "After registration, login screen appears but nothing happens"

### Solution Steps:

1. **Check Browser Console (MOST IMPORTANT)**
   - Press F12 in your browser
   - Go to Console tab
   - Look for error messages
   - Common errors:
     - `Network Error` = Backend not running
     - `CORS error` = Backend needs restart
     - `401 Unauthorized` = Wrong credentials

2. **Verify Both Servers Are Running**
   
   **Backend Check:**
   - Open: http://localhost:8000/api/health
   - Should show: `{"status":"Backend server is running"}`
   - If not, start backend:
     ```powershell
     cd C:\Users\rakes\OneDrive\Desktop\Repo\Street_Light_Control_Systems\backend
     & "C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000 index.php
     ```

   **Frontend Check:**
   - Should be running on http://localhost:3000
   - If not:
     ```powershell
     cd C:\Users\rakes\OneDrive\Desktop\Repo\Street_Light_Control_Systems\frontend
     npm start
     ```

3. **Test Registration with Alerts**
   - I've added alert() popups to show:
     - Success: "Registration successful! Redirecting to dashboard..."
     - Errors: Will show the specific error message
   - Watch browser console for detailed logs

4. **Manual Test**
   - After registration fails, try these credentials on login:
     - Email: admin@streetlight.com
     - Password: admin123

5. **Database Issue?**
   - Make sure MySQL is running
   - Check if database `street_light_control` exists:
     ```sql
     mysql -u root -p
     SHOW DATABASES;
     USE street_light_control;
     SHOW TABLES;
     ```

## Easy Start Method

Run this PowerShell script (double-click or right-click → Run with PowerShell):
```
START_SERVERS.ps1
```

This will:
- Start the backend automatically
- Wait for it to be ready
- Start the frontend
- Show you both URLs

## Common Errors and Fixes

### Error: "Network request failed"
**Cause:** Backend not running or wrong port  
**Fix:** Start backend server, verify it's on port 8000

### Error: "CORS policy"
**Cause:** Backend CORS headers not set correctly  
**Fix:** Restart backend server

### Error: "Invalid credentials"
**Cause:** User doesn't exist in database  
**Fix:** Register a new user or check database has sample data

### Nothing happens, no errors
**Cause:** JavaScript error preventing execution  
**Fix:** Check browser console (F12) for red errors

## Quick Reset

If everything seems broken:

1. Stop all servers (close terminal windows)
2. Open PowerShell in project root
3. Run:
   ```powershell
   .\START_SERVERS.ps1
   ```
4. Wait for both servers to start
5. Open http://localhost:3000
6. Try registration again

## Still Not Working?

Check these files for detailed logs:
- Browser Console (F12 → Console tab)
- Backend Terminal (where PHP server is running)
- Network Tab (F12 → Network → Look for `/auth/register` or `/auth/login`)

Share the error messages from these locations for help.

# 🚀 DEPLOYMENT QUICK START

## Two Simple Commands - That's All You Need!

### 🏠 Run Locally (Development)
```powershell
.\START_LOCAL.ps1
```
Opens: http://localhost:3000

### 🌐 Deploy to Hostinger (Production)
```powershell
.\BUILD_FOR_PRODUCTION.ps1
```
Then upload `build/` folder to Hostinger.

---

## 📖 Documentation

| Guide | What's Inside |
|-------|---------------|
| **[DEPLOYMENT_VISUAL_GUIDE.md](./DEPLOYMENT_VISUAL_GUIDE.md)** | 🎨 Visual diagrams, full explanation |
| **[QUICK_DEPLOYMENT_GUIDE.md](./QUICK_DEPLOYMENT_GUIDE.md)** | ⚡ Quick reference, commands only |
| **[HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md)** | 📘 Complete step-by-step for Hostinger |
| **[DEPLOYMENT_SETUP_COMPLETE.md](./DEPLOYMENT_SETUP_COMPLETE.md)** | ✅ What was configured, checklist |

---

## ✅ What's Configured

✅ **Dual-mode operation**: Local dev + Production  
✅ **No code changes needed** between environments  
✅ **Automatic environment switching** via scripts  
✅ **Separate databases**: Local vs Production  
✅ **Complete Hostinger deployment** ready  

---

## 🎯 Environment Setup

### 🏠 LOCAL
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Database: `street_light_control` (local MySQL)

### 🌐 PRODUCTION
- Backend: https://streetlightapi.honeyshelltech.com
- Frontend: https://streetlight.honeyshelltech.com
- Database: `u798810928_street_light` (Hostinger MySQL)

---

## 🔧 Files Created

### Scripts (Just Run These!)
- `START_LOCAL.ps1` / `.bat` - Start local development
- `BUILD_FOR_PRODUCTION.ps1` / `.bat` - Build for deployment

### Configuration
- Backend: `.env.local` (local) + `.env_global` (production)
- Frontend: `.env.local` (local) + `.env` (production)
- `.htaccess` files for both (Apache config)

### Documentation
- 4 comprehensive guides (see table above)

---

## 🎓 How It Works

### Local Development
```
START_LOCAL.ps1 → Copies .env.local files → Starts servers → Ready!
```

### Production Deployment
```
BUILD_FOR_PRODUCTION.ps1 → Copies production .env → Builds → Upload to Hostinger
```

**Same code works everywhere!** Only environment variables change.

---

## 🏁 Get Started Now!

### Step 1: Test Locally
```powershell
.\START_LOCAL.ps1
```

### Step 2: When Ready, Deploy
```powershell
.\BUILD_FOR_PRODUCTION.ps1
# Upload to Hostinger
```

---

## 💡 Need Help?

**Quick answer?** → [QUICK_DEPLOYMENT_GUIDE.md](./QUICK_DEPLOYMENT_GUIDE.md)  
**Visual guide?** → [DEPLOYMENT_VISUAL_GUIDE.md](./DEPLOYMENT_VISUAL_GUIDE.md)  
**Complete steps?** → [HOSTINGER_DEPLOYMENT_GUIDE.md](./HOSTINGER_DEPLOYMENT_GUIDE.md)  

---

**Login Credentials:**  
Email: `admin@streetlight.com`  
Password: `admin123`

---

## ⚡ That's It!

**Everything is configured. Just run the scripts! 🚀**

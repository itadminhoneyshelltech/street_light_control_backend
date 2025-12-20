# 🚦 Street Light Control System - Complete

A professional, enterprise-ready street light automation system with web and mobile interfaces.

## 📑 Documentation Index

Start here:

### For Quick Setup (5-10 minutes)
👉 **[QUICKSTART.md](QUICKSTART.md)** - Fast setup guide

### For Complete Information
- **[README.md](README.md)** - Full documentation (setup, deployment, troubleshooting)
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Feature overview & completion status

### For Developers
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design & security
- **[FRONTEND.md](docs/FRONTEND.md)** - React components & structure
- **[API.md](docs/API.md)** - API endpoints & examples

---

## 🎯 Key Features

✅ **Backend**: PHP + MySQL REST API
✅ **Frontend**: React 18 + TypeScript (Responsive)
✅ **Mobile**: React Native (Shared codebase)
✅ **Authentication**: JWT + Role-based Access (Admin, Operator, Viewer)
✅ **Map Integration**: Google Maps with status-colored markers
✅ **Statistics**: Real-time city-wide light statistics
✅ **Control**: Manual on/off control with audit logging
✅ **Responsive**: Desktop, tablet, mobile optimized
✅ **Professional UI**: Modern design with smooth animations

---

## 📁 Project Structure

```
backend/
├── config/          # Configuration & database
├── core/            # Response, JWT, Router
├── models/          # User, StreetLight, ControlLog, CitySummary
├── controllers/     # AuthController, LightController
├── middleware/      # Authentication middleware
├── index.php        # API entry point
└── database.sql     # SQL schema

frontend/
├── src/
│   ├── pages/       # Login, Register, Dashboard
│   ├── components/  # Navbar, Statistics, LightControl, MapView
│   ├── services/    # API client
│   ├── store/       # Zustand auth store
│   ├── styles/      # Responsive CSS
│   └── App.tsx      # Root component
└── public/

mobile/
├── src/
│   ├── screens/     # Dashboard screen
│   ├── store/       # Auth store (shared)
│   └── services/    # API services (shared)
└── package.json

docs/
├── ARCHITECTURE.md  # Technical details
├── FRONTEND.md      # Component guide
└── API.md          # Endpoint documentation
```

---

## 🚀 Quick Start

### Backend Setup (PHP + MySQL)
```bash
# 1. Create database
mysql -u root -p
CREATE DATABASE street_light_control;
USE street_light_control;
SOURCE backend/database.sql;

# 2. Start server
cd backend
php -S localhost:8000
```

### Frontend Setup (React)
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Configure environment
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:8000/api

# 3. Start dev server
npm start
```

### Mobile Setup (React Native)
```bash
cd mobile
npm install
npm run android  # or npm run ios
```

✅ **Everything works out-of-the-box with sample data!**

---

## 👥 Demo Credentials

**Admin Account (Pre-configured)**
- Email: `admin@streetlight.com`
- Password: (check database.sql)
- Role: Admin
- City: Delhi

**Or register a new account** on the registration page.

---

## 📊 What's Included

### Backend (PHP)
- ✅ 4 database tables (Users, StreetLights, ControlLogs, CitySummary)
- ✅ 8 API endpoints (auth + light management)
- ✅ JWT authentication & role-based access
- ✅ Audit logging for all control actions
- ✅ CORS configuration
- ✅ Error handling & validation

### Frontend (React)
- ✅ 3 tabs: Overview, Control Lights, Map View
- ✅ Statistics dashboard with real-time counts
- ✅ Light control interface (on/off buttons)
- ✅ Google Maps with color-coded markers
- ✅ Role-based UI (viewers see view-only UI)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Professional CSS styling

### Mobile (React Native)
- ✅ Dashboard screen
- ✅ Statistics display
- ✅ Shared API services with web
- ✅ Authentication & token management
- ✅ Touch-optimized UI

### Documentation
- ✅ 5 comprehensive guides
- ✅ API documentation
- ✅ Architecture details
- ✅ Setup instructions
- ✅ Troubleshooting guide

---

## 🔐 Security

✅ JWT token authentication (24-hour expiration)
✅ Password hashing with bcrypt
✅ Role-based access control (RBAC)
✅ SQL injection prevention (prepared statements)
✅ CORS protection
✅ Audit logging of all actions
✅ Input validation (server-side)

---

## 📱 Responsive Design

Optimized for all screen sizes:
- **Desktop** (>1024px): 4-column grids
- **Tablet** (768-1024px): 2-column grids, horizontal tabs
- **Mobile** (<768px): 1-column stack, mobile-optimized

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [README.md](README.md) | Complete setup & deployment guide |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute fast setup |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Features & completion status |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & security |
| [FRONTEND.md](docs/FRONTEND.md) | Component structure |
| [API.md](docs/API.md) | Endpoint documentation |

---

## 🛠️ Tech Stack

**Backend**
- PHP 7.4+
- MySQL 5.7+
- JWT for auth
- RESTful API

**Frontend**
- React 18.2
- TypeScript 5.1
- Zustand (state)
- Axios (HTTP)
- Google Maps API

**Mobile**
- React Native 0.72
- React Navigation
- AsyncStorage
- React Native Maps

---

## 🚢 Ready for Production

- ✅ Proper error handling
- ✅ Security best practices implemented
- ✅ Database optimization (indexed columns)
- ✅ Scalable architecture
- ✅ Environment configuration
- ✅ Comprehensive documentation
- ✅ Sample data for testing
- ✅ Production deployment guide

---

## 📖 Next Steps

1. **Read QUICKSTART.md** - Get running in 5 minutes
2. **Check sample data** - Modify `/backend/database.sql`
3. **Add your city** - Insert your location & lights
4. **Configure Google Maps** - Add API key for maps
5. **Deploy** - Follow README.md deployment section

---

## 🤝 Support

For issues or questions, refer to:
- Comprehensive documentation in `/docs/`
- Troubleshooting section in README.md
- QUICKSTART.md for common issues
- Code comments for implementation details

---

## 📄 License

Provided for educational and commercial use.

---

## ✨ Highlights

🎯 **Feature Complete** - All requirements implemented
🏗️ **Enterprise Ready** - Production-grade architecture
📱 **Full Stack** - Web, mobile, and backend
🔐 **Secure** - Authentication, authorization, audit logs
🎨 **Beautiful** - Professional UI with smooth animations
📚 **Documented** - 5 comprehensive guides
🚀 **Scalable** - Ready for production deployment

---

**Version**: 1.0
**Status**: 🟢 PRODUCTION READY
**Last Updated**: December 2025

👉 **[START HERE: QUICKSTART.md](QUICKSTART.md)**

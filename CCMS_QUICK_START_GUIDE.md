# CCMS Complete Implementation Guide
## Centralized Control & Monitoring System for Street Light Management
### Compliant with IS 16444 Smart Energy Meter Specification

---

## 📋 Quick Start

### Prerequisites
- PHP 8.3+
- MySQL 8.0+
- Node.js 16+
- React 18+
- Google Maps API Key

---

## 🗄️ DATABASE SETUP

### 1. Create Complete CCMS Schema

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE street_light_ccms;
USE street_light_ccms;

# Import complete schema
SOURCE street_light_control_backend/database-ccms-complete.sql;
```

### 2. Verify Table Creation

```bash
php street_light_control_backend/verify-database-setup.php
```

---

## 🔌 BACKEND API SETUP

### 1. Configure Routes

Update `street_light_control_backend/routes/api.php`:

```php
<?php

// Geographic Management
$router->get('/cities', 'CityController@list');
$router->get('/zones', 'ZoneController@list');
$router->get('/wards', 'WardController@list');

// Feeder Panel Management
$router->get('/feeder-panels/list', 'FeederPanelController@list');
$router->get('/feeder-panels/:id/status', 'FeederPanelController@getStatus');
$router->post('/feeder-panels/:id/control', 'FeederPanelController@control');
$router->get('/feeder-panels/:id/energy', 'FeederPanelController@getEnergyData');
$router->get('/feeder-panels/:id/faults', 'FeederPanelController@getFaults');
$router->post('/feeder-panels/:id/maintenance', 'FeederPanelController@createMaintenanceRequest');

// Smart Meter Data
$router->get('/smart-meters/list', 'SmartMeterController@list');
$router->get('/smart-meters/:id/readings', 'SmartMeterController@getReadings');
$router->get('/smart-meters/:id/parameters', 'SmartMeterController@getParameters');

// Energy Monitoring
$router->get('/energy/realtime', 'EnergyController@getRealtime');
$router->get('/energy/history', 'EnergyController@getHistory');
$router->get('/energy/analysis', 'EnergyController@getAnalysis');

// Alerts
$router->get('/alerts/active', 'AlertController@getActive');
$router->get('/alerts/history', 'AlertController@getHistory');
$router->post('/alerts/:id/acknowledge', 'AlertController@acknowledge');
$router->post('/alerts/threshold-settings', 'AlertController@updateThresholds');

// Reports
$router->get('/reports/energy-saving', 'ReportsController@getEnergySavingReport');
$router->get('/reports/lamp-failure', 'ReportsController@getLampFailureReport');
$router->get('/reports/uptime', 'ReportsController@getUptimeReport');
$router->get('/reports/maintenance', 'ReportsController@getMaintenanceReport');
$router->get('/reports/contractor-performance', 'ReportsController@getContractorPerformanceReport');
$router->get('/reports/asset-inventory', 'ReportsController@getAssetInventoryReport');

// User Management
$router->get('/users/roles', 'UserController@getRoles');
$router->post('/users/:id/assign-role', 'UserController@assignRole');
$router->get('/users/access-log', 'UserController@getAccessLog');

// Maintenance & Assets
$router->get('/maintenance/requests', 'MaintenanceController@list');
$router->post('/maintenance/request', 'MaintenanceController@create');
$router->post('/maintenance/:id/assign', 'MaintenanceController@assign');
$router->post('/maintenance/:id/complete', 'MaintenanceController@complete');

$router->get('/assets/inventory', 'AssetController@list');
$router->post('/assets/update-status', 'AssetController@updateStatus');

// Contractor Management
$router->get('/contractors/list', 'ContractorController@list');
$router->get('/contractors/:id/performance', 'ContractorController@getPerformance');

// Dashboard
$router->get('/dashboard/city-snapshot', 'DashboardController@getCitySnapshot');
$router->get('/dashboard/energy-snapshot', 'DashboardController@getEnergySnapshot');

// GIS & Mapping
$router->get('/gis/map-data', 'GISController@getMapData');
$router->get('/gis/zone-data', 'GISController@getZoneData');

?>
```

### 2. Create Controllers

Copy provided controllers to `street_light_control_backend/controllers/`:
- `FeederPanelController.php` - ✅ Provided
- `ReportsController.php` - ✅ Provided
- Need to create:
  - `SmartMeterController.php`
  - `EnergyController.php`
  - `AlertController.php`
  - `DashboardController.php`
  - `GISController.php`
  - `UserController.php`
  - `MaintenanceController.php`
  - `AssetController.php`
  - `ContractorController.php`

---

## 🎨 FRONTEND SETUP

### 1. Update Dashboard Component

Update `street_light_control_frontend/src/pages/Dashboard.tsx`:

```tsx
import { CCMSDashboard } from '../components/CCMSDashboard';

export const Dashboard: React.FC = () => {
  // ... existing code ...
  
  return (
    <div className="dashboard">
      {/* ... navbar ... */}
      
      {activeTab === 'ccms' && <CCMSDashboard />}
      
      {/* ... rest ... */}
    </div>
  );
};
```

### 2. Add CCMS Route

Update `street_light_control_frontend/src/App.tsx`:

```tsx
import { CCMSDashboard } from './components/CCMSDashboard';

const routes = [
  { path: '/dashboard/ccms', component: CCMSDashboard },
  // ... other routes ...
];
```

### 3. Import Styles

Ensure CSS file is properly imported:
```tsx
import '../styles/CCMSDashboard.css';
```

---

## 📊 CORE FEATURES CHECKLIST

### Phase 1: Foundation (Week 1-2) ✅
- [x] Database schema with all CCMS tables
- [x] Feeder panel management APIs
- [x] Reports generation engine
- [x] Main dashboard component
- [ ] Smart meter integration APIs
- [ ] Real-time energy data APIs

### Phase 2: Monitoring (Week 3) 🔄
- [ ] Real-time energy monitoring
- [ ] Fault detection & alerts
- [ ] SMS/Push notification system
- [ ] Alert threshold management

### Phase 3: Control & Scheduling (Week 4) 📅
- [ ] Schedule management APIs
- [ ] Remote ON/OFF control
- [ ] Sunrise/Sunset automation
- [ ] Manual override modes

### Phase 4: Reporting (Week 5) 📈
- [ ] Energy saving reports
- [ ] Lamp failure reports
- [ ] Uptime percentage tracking
- [ ] Asset inventory management

### Phase 5: Administration (Week 6) 👥
- [ ] User role management
- [ ] Permission-based access control
- [ ] Audit logging
- [ ] Contractor performance tracking

### Phase 6: Mobile (Week 7) 📱
- [ ] React Native mobile app
- [ ] Real-time push notifications
- [ ] Remote control on-demand
- [ ] Report viewing

### Phase 7: Deployment (Week 8) 🚀
- [ ] Self-healing mechanism
- [ ] Data backup & recovery
- [ ] Performance optimization
- [ ] Security hardening

---

## ⚡ KEY ENDPOINTS SUMMARY

### City & Geographic
```
GET  /api/cities
GET  /api/zones?city_id=1
GET  /api/wards?zone_id=1
```

### Feeder Panels
```
GET  /api/feeder-panels/list?city_id=1&zone_id=1
GET  /api/feeder-panels/{id}/status
POST /api/feeder-panels/{id}/control
     { action: 'on'|'off'|'schedule', brightness: 100 }
GET  /api/feeder-panels/{id}/energy
GET  /api/feeder-panels/{id}/faults
```

### Energy Monitoring
```
GET  /api/smart-meters/list
GET  /api/smart-meters/{id}/readings
GET  /api/energy/realtime?panel_id=1
GET  /api/energy/history?panel_id=1&days=7
```

### Alerts
```
GET  /api/alerts/active
GET  /api/alerts/history?panel_id=1&days=30
POST /api/alerts/{id}/acknowledge
POST /api/alerts/threshold-settings
     { voltage_min: 200, voltage_max: 280, ... }
```

### Reports
```
GET  /api/reports/energy-saving?city_id=1&start_date=2024-01-01&end_date=2024-12-31
GET  /api/reports/lamp-failure?city_id=1
GET  /api/reports/uptime?city_id=1&zone_id=1
GET  /api/reports/maintenance?city_id=1&status=completed
GET  /api/reports/contractor-performance?city_id=1
GET  /api/reports/asset-inventory?city_id=1
```

### Maintenance & Assets
```
GET  /api/maintenance/requests?city_id=1&status=open
POST /api/maintenance/request
     { feeder_panel_id: 1, description: '...', priority: 'high' }
POST /api/maintenance/{id}/assign { contractor_id: 1 }
POST /api/maintenance/{id}/complete

GET  /api/assets/inventory?city_id=1&asset_type=led_luminaire
POST /api/assets/update-status { asset_id: 1, status: 'faulty' }
```

### Dashboard
```
GET  /api/dashboard/city-snapshot?city_id=1
GET  /api/dashboard/energy-snapshot?city_id=1&days=7
```

---

## 🔐 USER ROLES & PERMISSIONS

### 1. Super Admin
- Full access to all features
- User management
- System configuration
- Audit logs

### 2. City Administrator
- City-level control
- Zone & ward management
- Report generation
- Alert management

### 3. Zone Operator
- Zone-level monitoring
- Real-time control
- Alert acknowledgment
- Maintenance assignment

### 4. Field Technician
- Maintenance task assignment
- Device status updates
- Fault documentation
- Work completion

### 5. Viewer / Read-Only
- Dashboard access
- Report viewing
- Alert viewing
- No control permissions

---

## 🔔 ALERT CONFIGURATION

### Alert Types (Per Specification)

```php
$alertTypes = [
    'phase_voltage_high' => ['threshold' => 280, 'severity' => 'warning'],
    'phase_voltage_low' => ['threshold' => 200, 'severity' => 'warning'],
    'phase_current_high' => ['threshold' => 80, 'severity' => 'critical'],
    'outgoing_mcb_trip' => ['severity' => 'critical'],
    'theft_alert' => ['severity' => 'critical'],
    'group_failure' => ['severity' => 'warning'],
    'leakage_to_ground' => ['severity' => 'critical'],
    'no_output_supply' => ['severity' => 'critical'],
    'door_open' => ['severity' => 'info'],
    'door_tamper' => ['severity' => 'critical'],
    'led_failure' => ['severity' => 'warning'],
    'communication_loss' => ['severity' => 'warning'],
];
```

### SMS Recipients (Up to 5 Per Alert)

Configure in `alert_recipients` table:
```sql
INSERT INTO alert_recipients (city_id, phone_number, recipient_name, recipient_role)
VALUES 
  (1, '+91-XXXXX', 'Operator Name', 'operator'),
  (1, '+91-XXXXX', 'Supervisor', 'supervisor'),
  (1, '+91-XXXXX', 'Manager', 'manager');
```

---

## 📈 DATA ARCHIVAL & BACKUP

### Data Retention Policy
- **Real-time data**: Last 15 minutes (rolling)
- **Hourly aggregates**: Last 30 days
- **Daily reports**: 24 months (730 days)
- **Monthly summaries**: Full contract period

### Backup Strategy
- **Automated daily backups**: Mirror imaging of HDDs
- **Off-site backup**: Weekly
- **RPO (Recovery Point Objective)**: 1 hour
- **RTO (Recovery Time Objective)**: 4 hours
- **UPS battery backup**: 12+ hours minimum

---

## 🛡️ SECURITY CHECKLIST

- [ ] SSL/TLS encryption for all APIs
- [ ] JWT tokens for authentication
- [ ] Role-based access control (RBAC)
- [ ] Input validation & SQL injection prevention
- [ ] Rate limiting on critical endpoints
- [ ] Audit logging for all operations
- [ ] Secure password hashing (bcrypt)
- [ ] CSRF token protection
- [ ] XSS prevention
- [ ] Data encryption at rest
- [ ] Regular security audits
- [ ] Penetration testing

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Database backups configured
- [ ] UPS system installed (12+ hours)
- [ ] Air conditioning operational
- [ ] Firewall configured
- [ ] SSL certificates installed
- [ ] Load balancer configured (for scalability)
- [ ] Logging & monitoring active
- [ ] Alerting system configured
- [ ] Disaster recovery plan tested
- [ ] User training completed
- [ ] Documentation reviewed
- [ ] Go-live approval obtained

---

## 📞 SUPPORT & MAINTENANCE

### Routine Maintenance Tasks
1. **Daily**: Monitor system health, check alerts
2. **Weekly**: Review reports, check backups
3. **Monthly**: Performance review, security audit
4. **Quarterly**: User role review, permission audit
5. **Annually**: Meter calibration, system audit

### Self-Healing Mechanism
- System monitors component health continuously
- Automatic failover for database connections
- Automatic retry for failed API calls
- Cache invalidation on data changes
- Service restart on critical failures

---

## 📚 ADDITIONAL RESOURCES

- IS 16444 Part-I & Part-2: Smart Energy Meter Specification
- GSM Modem Integration Guide
- Google Maps API Documentation
- Smart Meter Data Format Specification
- Contractor Manual
- User Training Materials

---

## ✅ VERIFICATION STEPS

After deployment, verify:

1. **Database**: All tables created
```bash
mysql> SHOW TABLES IN street_light_ccms;
```

2. **APIs**: All endpoints responding
```bash
curl http://localhost:8000/api/dashboard/city-snapshot?city_id=1
```

3. **Frontend**: Dashboard loading
```
http://localhost:3000/dashboard/ccms
```

4. **Monitoring**: Real-time updates working
```
Check console logs for data refresh events
```

5. **Alerts**: Notifications triggering
```
Submit a fault event and verify SMS/notifications
```

---

## 🎯 SUCCESS METRICS

- System uptime: > 99.5%
- Average response time: < 500ms
- Alert delivery time: < 2 minutes
- Data accuracy: 99.9%+
- User adoption: 90%+
- Cost savings: 15-25% vs baseline

---

**Last Updated**: December 18, 2025
**Version**: 1.0
**Status**: Ready for Implementation

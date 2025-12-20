# Architecture & Technical Details

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Web Browser       Mobile App (Android/iOS)                  │
│  (React)           (React Native)                            │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/HTTP
┌──────────────────────┴──────────────────────────────────────┐
│              API Layer (PHP REST API)                        │
├─────────────────────────────────────────────────────────────┤
│  • Authentication (JWT)                                      │
│  • Authorization (Role-Based Access Control)                │
│  • Request Validation                                        │
│  • Response Formatting                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│          Business Logic Layer (Controllers)                  │
├─────────────────────────────────────────────────────────────┤
│  • AuthController  (User authentication)                     │
│  • LightController (Light management)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│           Data Access Layer (Models)                         │
├─────────────────────────────────────────────────────────────┤
│  • User model                                                │
│  • StreetLight model                                         │
│  • ControlLog model                                          │
│  • CitySummary model                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│              Database Layer (MySQL)                          │
├─────────────────────────────────────────────────────────────┤
│  • users table                                               │
│  • street_lights table                                       │
│  • control_logs table                                        │
│  • city_summary table                                        │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

### 1. Authentication
- **JWT Tokens**: 24-hour expiration
- **Password Hashing**: bcrypt algorithm
- **Secure Storage**: Token in localStorage (web) / AsyncStorage (mobile)

### 2. Authorization
- **Role-Based Access Control (RBAC)**
  - Admin: Full system control
  - Operator: View + Control lights
  - Viewer: Read-only access
- **Endpoint Protection**: Authorization middleware checks user role

### 3. Data Protection
- **Input Validation**: All inputs validated server-side
- **Prepared Statements**: Prevents SQL injection
- **CORS**: Restricted to known domains
- **Sensitive Data**: Passwords never exposed in responses

## Performance Optimization

### Frontend
- **Code Splitting**: Lazy load routes
- **State Management**: Zustand (lightweight)
- **Responsive Design**: CSS Grid & Flexbox
- **Caching**: API responses cached locally
- **Icons**: Lucide React (lightweight SVG)

### Backend
- **Database Indexing**: On frequently queried columns
  - `users.email`
  - `street_lights.city`
  - `street_lights.light_id`
  - `control_logs.light_id`
- **Query Optimization**: JOIN queries for related data
- **Pagination**: Ready for large datasets

### Mobile
- **Shared Services**: Web and mobile share API layer
- **AsyncStorage**: Persistent token storage
- **Network State**: Detect and handle offline mode

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Easy to run multiple PHP-FPM instances
- **Load Balancing**: Route requests across multiple servers
- **Database Replication**: Master-slave MySQL setup

### Vertical Scaling
- **Caching Layer**: Redis for session/data caching
- **Database Optimization**: Connection pooling
- **CDN Integration**: For static assets

## Real-Time Features (Future Enhancement)

WebSocket support ready via:
```php
// Backend can be extended with WebSocket library
// Socket.io integration for real-time notifications
```

Frontend prepared for:
```typescript
// socket.io-client already included in dependencies
// Can implement real-time light status updates
```

## API Response Format

### Success Response
```json
{
  "status": 200,
  "message": "Operation successful",
  "data": {
    // Actual data
  }
}
```

### Error Response
```json
{
  "status": 400,
  "message": "Error occurred",
  "error": "Descriptive error message"
}
```

## Frontend Component Architecture

```
App (Root)
├── BrowserRouter
│   └── Routes
│       ├── /login → Login Component
│       ├── /register → Register Component
│       └── /dashboard → Dashboard
│           ├── Navbar
│           ├── Sidebar (Tab Navigation)
│           └── Main Content
│               ├── Statistics Component
│               ├── LightControl Component
│               └── MapView Component
```

## State Management Flow

```
User Action
    ↓
React Component Handler
    ↓
API Service Call
    ↓
Zustand Store Update
    ↓
Component Re-render
    ↓
Updated UI
```

## Database Relationships

```
users (1) ──────── (N) control_logs
                        │
                        └─── (N:1) ──── (1) street_lights

street_lights (1) ──────── (N) control_logs

city_summary ←─── (Aggregated from street_lights)
```

## Error Handling

### Frontend
- Try-catch blocks for API calls
- User-friendly error messages
- Network error detection
- Token expiration handling

### Backend
- Exception handling in controllers
- Validation error messages
- Database error logging
- Graceful error responses

## Testing Strategy

### Backend (PHP)
```bash
# PHPUnit ready structure
tests/
├── Controllers/
├── Models/
└── Integration/
```

### Frontend (React)
```bash
# Jest & React Testing Library ready
src/__tests__/
├── components/
├── pages/
├── services/
└── hooks/
```

### Mobile (React Native)
```bash
# React Native Testing Library ready
mobile/__tests__/
├── screens/
├── components/
└── services/
```

## Deployment Checklist

- [ ] Database credentials configured
- [ ] JWT secret key changed
- [ ] API URL updated to production
- [ ] CORS origins configured
- [ ] Environment variables set
- [ ] SSL/TLS certificates installed
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] API rate limiting configured
- [ ] Monitoring setup (optional)

---

**Document Version**: 1.0
**Last Updated**: December 2025

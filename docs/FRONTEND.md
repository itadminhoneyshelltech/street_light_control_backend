# Frontend Components & Structure

## Component Hierarchy

```
App.tsx (Root)
│
├── Router Configuration
│   ├── /login
│   ├── /register
│   └── /dashboard
│
└── Dashboard.tsx (Protected)
    ├── Navbar.tsx
    │   ├── App Title
    │   ├── User Info Display
    │   └── Logout Button
    │
    ├── Sidebar (Tab Navigation)
    │   ├── Overview Tab
    │   ├── Control Lights Tab
    │   └── Map View Tab
    │
    └── Main Content Area (Dynamic)
        ├── Statistics.tsx (Overview Tab)
        │   ├── StatCard (Total)
        │   ├── StatCard (On)
        │   ├── StatCard (Off)
        │   └── StatCard (Error)
        │
        ├── LightControl.tsx (Control Tab)
        │   ├── Light Card (On)
        │   ├── Light Card (Off)
        │   ├── Light Card (Error)
        │   └── Control Buttons
        │
        └── MapView.tsx (Map Tab)
            ├── Google Maps Integration
            ├── Markers (Color-coded)
            ├── Map Legend
            └── Info Windows
```

## State Management Flow

```
User Action
    ↓
┌─────────────────────────────────┐
│  React Component Handler        │
│  (onClick, onChange, etc.)      │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  API Service Call (axios)       │
│  (lightService.controlLight)    │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Backend Processing             │
│  (PHP Controller)               │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Database Update                │
│  (MySQL)                        │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Response to Frontend           │
│  (JSON)                         │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Zustand Store Update           │
│  (useAuthStore, etc.)           │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Component Re-render            │
│  (React Hook Dependency Array)  │
└──────────────┬──────────────────┘
               ↓
┌─────────────────────────────────┐
│  Updated UI Display             │
└─────────────────────────────────┘
```

## Responsive Design Strategy

```
Desktop (>1024px)
┌─────────────────────────────────┐
│           Navbar                │
├──────────┬──────────────────────┤
│ Sidebar  │   Main Content       │
│ 250px    │   (Responsive Grid)  │
│          │                      │
│   Grid   │   Stats: 4 columns   │
│   1 col  │   Lights: 4 columns  │
│          │   Maps: Full width   │
└──────────┴──────────────────────┘

Tablet (768px - 1024px)
┌──────────────────────────────────┐
│         Navbar                   │
├──────────────────────────────────┤
│     Horizontal Sidebar           │
├──────────────────────────────────┤
│    Main Content (2 columns)      │
│    Stats: 2 columns              │
│    Lights: 2 columns             │
└──────────────────────────────────┘

Mobile (<768px)
┌──────────────────┐
│     Navbar       │
├──────────────────┤
│ Horizontal Tabs  │
├──────────────────┤
│  1 Column Grid   │
│  Stacked Stats   │
│  Full Width Maps │
└──────────────────┘
```

## CSS Architecture

```
styles/
├── index.css
│   ├── Global Reset & Variables
│   ├── Typography
│   ├── Button Styles
│   └── Form Elements
│
├── Auth.css
│   ├── Auth Container
│   ├── Auth Box
│   └── Auth Form
│
├── Navbar.css
│   ├── Navbar Styling
│   └── User Menu
│
├── Dashboard.css
│   ├── Dashboard Layout
│   ├── Sidebar Navigation
│   └── Responsive Grid
│
├── Statistics.css
│   ├── StatCard Styling
│   ├── Color Variants
│   └── Grid Layout
│
├── LightControl.css
│   ├── Light Card Styling
│   ├── Status Badges
│   ├── Control Buttons
│   └── Grid Layout
│
└── MapView.css
    ├── Map Container
    ├── Legend Styling
    └── Info Window
```

## Component Props Interface

```typescript
// LightControl Component
interface LightControlProps {
  city?: string;
}

// Light Object
interface Light {
  _id: string;
  lightId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'on' | 'off' | 'error';
  lastStatusChange: string;
  errorDetails?: string;
}

// Statistics
interface Statistics {
  totalLights: number;
  lightsOn: number;
  lightsOff: number;
  lightsInError: number;
}

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}
```

## API Integration Points

```
Frontend Components
        ↓
authService (auth.ts)
  ├── register()
  └── login()
        ↓
lightService (api.ts)
  ├── getLights()
  ├── getLightDetail()
  ├── getCitySummary()
  ├── getLightsForMap()
  ├── controlLight()
  └── updateLightStatus()
        ↓
axios (HTTP Client)
        ↓
Backend API (PHP)
```

## Component Communication

```
Parent: Dashboard
├── Child: Navbar
│   └── Prop: user info
│   └── Event: logout
│
├── Child: Sidebar (Tab Buttons)
│   └── State: activeTab
│   └── Handler: setActiveTab()
│
└── Child: Content Components
    ├── Statistics
    │   └── Props: city
    │   └── Fetches: getCitySummary()
    │
    ├── LightControl
    │   └── Props: city
    │   └── Fetches: getLights()
    │   └── Action: controlLight()
    │
    └── MapView
        └── Props: city
        └── Fetches: getLightsForMap()
        └── Displays: Google Map
```

## Error Handling Flow

```
User Action
    ↓
Try Block
    ├── API Call
    └── Success
        └── Update State
            └── Re-render
    ├── Error Caught
        └── setError()
            └── Display Error Message
                └── Log to Console
            └── Reset State
```

## Performance Optimization

```
Code Splitting
├── Route-based (lazy loading)
│   ├── Login page
│   ├── Register page
│   └── Dashboard page
│
└── Component-based
    ├── LightControl (large list)
    └── MapView (heavy component)

Memoization
├── useMemo() for expensive calculations
└── React.memo() for component optimization

State Updates
├── Batched updates (React 18)
├── Selective updates (only changed lights)
└── Zustand for global state
```

---

**Last Updated**: December 2025
**Component Version**: 1.0

# Google Maps API Key Setup Guide

## Issue
Error: `can't access property "np", I is undefined`

This error indicates the Google Maps API key is either:
1. Invalid or expired
2. Missing required API enablements
3. Has IP/domain restrictions that block localhost

## Solution Steps

### 1. Verify/Create API Key
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one
- Go to **Credentials** → **Create Credentials** → **API Key**

### 2. Enable Required APIs
Go to **APIs & Services** → **Library** and enable:
- ✅ **Maps JavaScript API**
- ✅ **Maps Embed API** (optional)
- ✅ **Places API** (for location search)
- ✅ **Geocoding API** (for location conversion)

### 3. Restrict API Key (Recommended)
Go to **Credentials** → Click your API Key → **Application restrictions**:
- Choose: **HTTP referrers (web sites)**
- Add:
  - `http://localhost:*`
  - `http://localhost:3000/*`
  - `http://192.168.*.*`

### 4. Test API Key
Visit in browser: (replace YOUR_KEY with actual key)
```
https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places,geometry&callback=initMap
```

Should NOT show "RefererNotAllowedMapError" or other errors.

### 5. Add to .env
```
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_KEY_HERE
```

### 6. Restart Frontend
```powershell
npm start
```

### 7. Verify in Browser Console
Should show: `✅ Google Maps script loaded successfully`

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `can't access property "np"` | APIs not enabled or invalid key | Enable APIs in Cloud Console |
| `RefererNotAllowedMapError` | Domain not whitelisted | Add `http://localhost:*` to restrictions |
| `INVALID_REQUEST` | Missing parameters | Ensure `mapContainerClassName="map"` with CSS height |
| `API_NOT_ACTIVATED` | Maps JavaScript API disabled | Enable it in APIs & Services |

## Debug Steps
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Check for API load messages
4. Check **Network** tab for failed requests to maps.googleapis.com

## API Pricing Note
- Free tier includes $200/month credit
- Street Light project should stay within free tier
- Monitor usage at [Google Cloud Billing](https://console.cloud.google.com/billing)

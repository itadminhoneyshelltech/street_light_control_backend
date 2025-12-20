# 📱 Mobile App - How to Run

## Quick Start (Choose One)

### Option 1: Android Device/Emulator
```bash
cd mobile
npm install --legacy-peer-deps
npm run start    # Terminal 1 (keep open)
# Open NEW terminal:
npm run android
```

### Option 2: iOS Device/Simulator
```bash
cd mobile
npm install --legacy-peer-deps
npm run start    # Terminal 1 (keep open)
# Open NEW terminal:
npm run ios
```

### Option 3: Development Server
```bash
cd mobile
npm install --legacy-peer-deps
npm run start
```

---

## 📋 Prerequisites

### Required Software
- **Node.js** 16+ ([nodejs.org](https://nodejs.org))
- **npm** 8+ (comes with Node.js)
- **React Native CLI** (installed via npm)

### For Android
- **Android Studio** ([developer.android.com](https://developer.android.com/studio))
- **JDK 11+** (Java Development Kit)
- **Android SDK** (API level 28+)
- **Emulator** or Android phone (USB debugging enabled)

### For iOS
- **Xcode 14+** ([App Store](https://apps.apple.com/us/app/xcode/id497799835))
- **CocoaPods** (dependency manager)
- **iOS simulator** or iPhone (macOS only)

---

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies
```bash
cd mobile
npm install --legacy-peer-deps
```

**What it does**: 
- Downloads all required packages from package.json
- Uses `--legacy-peer-deps` flag to resolve dependency conflicts
- Creates `node_modules` folder (~500MB)

### Step 2: Configure Backend URL
Edit: `mobile/src/screens/InspectionScreen.tsx`

Find line ~20:
```typescript
const API_URL = 'http://localhost:8000/api';
```

Change to your backend IP:
```typescript
const API_URL = 'http://192.168.1.100:8000/api';  // Your backend server IP
```

### Step 3: Start Metro Bundler (Required)
```bash
cd mobile
npm run start
```

**Keep this terminal open** - it bundles your React Native code

### Step 4: Run on Device/Emulator

#### For Android:
```bash
# In a NEW terminal window
cd mobile
npm run android
```

**Or manually:**
1. Open Android Studio
2. Create/start an emulator
3. Run `npm run android`

#### For iOS:
```bash
# In a NEW terminal window
cd mobile
npm run ios
```

**Or manually:**
1. Run `npm run ios` to start iOS simulator
2. The app will build and launch automatically

---

## 🔧 Configuration

### Backend Connection
```typescript
// File: mobile/src/screens/InspectionScreen.tsx
const API_URL = 'http://YOUR_BACKEND_IP:8000/api';
```

**Examples:**
- Local: `http://localhost:8000/api`
- Same network: `http://192.168.x.x:8000/api`
- Production: `https://api.yourdomain.com/api`

### API Key
```typescript
// File: mobile/src/screens/InspectionScreen.tsx
const API_KEY = 'your-jwt-token-here';  // Will be set from login
```

---

## 📱 Running on Different Platforms

### Android Emulator
```bash
# Terminal 1
cd mobile
npm run start

# Terminal 2
npm run android
```

**Emulator setup** (one time):
1. Open Android Studio
2. Tools → Device Manager
3. Create Virtual Device (Pixel 4, Android 12+)
4. Start the emulator

### iOS Simulator
```bash
# Terminal 1
cd mobile
npm run start

# Terminal 2
npm run ios
```

**Simulator setup** (automatic, macOS only)

### Physical Android Phone
1. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging ON
2. Connect via USB
3. Run:
   ```bash
   npm run android
   ```

### Physical iPhone
1. Use Xcode to provision device
2. Run:
   ```bash
   npm run ios
   ```

---

## 🎯 App Features

Once running, you can:

### 1. **Start Inspection**
   - Tap "Start Inspection" button
   - Creates new inspection record

### 2. **Capture Photo**
   - Tap camera icon
   - Take photo of street light
   - Photo uploaded to backend

### 3. **Record GPS**
   - Tap GPS button
   - Records your location
   - Sent to backend

### 4. **Select Light Status**
   - ON (light is working)
   - OFF (light is not working)
   - ERROR (light has issues)

### 5. **Enter Details**
   - Ward number
   - Brightness level
   - Additional notes

### 6. **Complete Inspection**
   - Tap "Complete" button
   - Data saved to server
   - Ready for next inspection

---

## 🐛 Troubleshooting

### Error: "Metro Bundler not running"
```bash
# Make sure Metro is running in first terminal
cd mobile
npm run start
```

### Error: "Android SDK not found"
```bash
# Set ANDROID_HOME environment variable
# Windows: 
set ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\Sdk

# macOS/Linux:
export ANDROID_HOME=$HOME/Library/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
```

### Error: "Could not connect to development server"
1. Check backend is running: `php -S localhost:8000`
2. Update API URL to correct IP
3. Ensure phone/emulator on same network

### Error: "Connection refused to backend"
```bash
# Check backend is running
curl http://localhost:8000/api/health

# If not running, start it:
cd street_light_control_backend
php -S localhost:8000
```

### Error: "Camera permission denied"
```bash
# Grant permissions manually:
# Android: Settings → Apps → InspectionApp → Permissions → Camera/Location
# iOS: Settings → App → Camera/Location → Allow
```

### App crashes on start
1. Check console: `npm run start`
2. Look for error messages
3. Verify API_URL is correct
4. Rebuild: `npm run android` or `npm run ios`

---

## 📊 Development Tools

### View Logs
```bash
# Android
adb logcat

# iOS
open ~/Library/Logs/CoreSimulator/
```

### Debug App
1. Shake device (or Cmd+D on iOS, Ctrl+M on Android)
2. Select "Debug JS Remotely"
3. Chrome DevTools opens
4. Use console/debugger

### Reload App
- Press `R` in Metro Bundler terminal
- Or shake device and select "Reload"

### Access Redux DevTools
```bash
# Metro Bundler will show state changes
# Check terminal for Zustand store updates
```

---

## ✅ Verification

### Check App is Running
1. Open app on device/emulator
2. See "🔦 Light Inspection" header
3. Tap "Start Inspection"
4. Check backend logs for incoming request

### Test Full Flow
1. **Start** → See inspection created
2. **Photo** → See photo uploaded
3. **GPS** → See coordinates recorded
4. **Status** → Select light status
5. **Complete** → See data saved

### Verify Backend Connection
```bash
# Check if requests reach backend
curl http://localhost:8000/api/inspection/stats

# Should return inspection statistics
```

---

## 📝 Common Tasks

### Change Backend Server
Edit `mobile/src/screens/InspectionScreen.tsx`:
```typescript
const API_URL = 'http://NEW_SERVER_IP:8000/api';
```

### Change App Title
Edit `mobile/app.json`:
```json
{
  "name": "Street Light Inspection",
  "displayName": "🔦 Light Inspection"
}
```

### Update Dependencies
```bash
cd mobile
npm update
```

### Clean Build Cache
```bash
# Android
cd mobile/android
./gradlew clean

# iOS
cd mobile/ios
rm -rf Pods
pod install
```

---

## 🚀 Deployment

### Build APK (Android Release)
```bash
cd mobile/android
./gradlew assembleRelease
# APK at: mobile/android/app/build/outputs/apk/release/
```

### Build IPA (iOS Release)
```bash
# Use Xcode
open mobile/ios/StreetLightControlMobile.xcworkspace
# Then: Product → Archive
```

### Deploy to App Store
- iOS: Use App Store Connect
- Android: Use Google Play Console

---

## 📞 Support

### Documentation
- **Quick Start**: [INSPECTION_QUICK_START.md](../INSPECTION_QUICK_START.md)
- **Complete Guide**: [INSPECTION_FEATURE_GUIDE.md](../INSPECTION_FEATURE_GUIDE.md)
- **API Reference**: [CCMS_API_DOCUMENTATION.md](../CCMS_API_DOCUMENTATION.md)

### Logs Location
- Android: `adb logcat | grep "InspectionScreen"`
- iOS: Console.app → Process → Your app

### Test API
- Browser: `http://localhost:8000/TEST_INSPECTION_FLOW.html`
- Command: `curl http://localhost:8000/api/health`

---

## ⚡ Quick Commands Reference

```bash
# Setup
npm install                    # Install dependencies
npm run start                 # Start Metro Bundler

# Run
npm run android               # Run on Android device/emulator
npm run ios                   # Run on iOS simulator

# Development
npm run lint                  # Check code style
npm test                      # Run tests

# Clean
rm -rf node_modules          # Remove dependencies (Windows: rmdir /s node_modules)
npm install                  # Reinstall from scratch
```

---

## ✨ Status

**Mobile App**: ✅ Ready to run
**Backend**: ✅ Must be running on localhost:8000
**Database**: ✅ Must have inspection tables
**Permissions**: ✅ Camera + Location required

---

**Let me know if you get stuck on any step!** 🚀

---

*Last Updated: December 17, 2025*
*Mobile App Version: 1.0.0*
*React Native: 0.72.0*

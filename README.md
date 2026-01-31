# 🛡️ My Safety App (SafeTY)

[![Netlify Status](https://api.netlify.com/api/v1/badges/536df11d-2485-4f2a-b9c4-42e04c10bbc6/deploy-status)](https://app.netlify.com/projects/my-safety-codecraft/deploys)

A sophisticated, production-ready personal safety application designed for mobile and web. **SafeTY** uses advanced browser APIs to provide real-time protection through voice, sound, and location monitoring.

## 🚀 Key Features

-   **🎙️ Multilingual Voice Commands**: Supports 21 languages (including 13 Indian regional languages). Triggers emergency protocols via "Help" keywords.
-   **😱 Scream Detection**: Real-time audio analysis (Web Audio API) to detect screams and activate emergency responses automatically.
-   **📍 Smart Location Tracking**: Monitors distance from a "Home" base; alerts user and contacts if safety thresholds (2km) are exceeded.
-   **📞 Sequential Calling System**: Automatically dials up to 5 emergency contacts in sequence until a connection is made.
-   **📱 Android APK Ready**: Fully configured with Capacitor for native mobile performance and hardware-level permissions.
-   **✨ Premium UI**: Modern Glassmorphism design with responsive dashboards for both Desktop and Mobile.

## 📁 Project Structure

-   `index.html`: Landing and entry point.
-   `dashboard.html` / `dashboard-mobile.html`: Feature-rich user interfaces.
-   `js/`: Core logic (Voice, Scream, Location, Permissions).
-   `css/`: Modular styling for all safety components.
-   `docs/`: Comprehensive technical documentation and guides.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+).
-   **Mobile**: Capacitor (Android native bridge).
-   **Backend**: Firebase (Auth & Firestore).
-   **Hosting**: Netlify / GitHub Pages.

## 📖 Documentation

Detailed technical guides have been moved to the `docs/archive/` directory:
-   `QUICK_START.md`: 5-minute deployment guide.
-   `FIREBASE_CONFIG_GUIDE.md`: Step-by-step database setup.
-   `V2_ANDROID_PLAN.md`: Mobile development and APK details.

---
*SafeTY - Making the world safer, one command at a time.* 💪

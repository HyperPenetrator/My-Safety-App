# 🛡️ My Safety App

A personal safety companion web app with emergency SOS, voice commands, and offline support.

![Version](https://img.shields.io/badge/version-2.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Status](https://img.shields.io/badge/status-active-success)

## 🚀 Features

- **🚨 Emergency SOS** - Sequential calling with 3-second activation
- **📞 Emergency Contacts** - Store up to 5 trusted contacts
- **🎤 Voice Commands** - 20+ languages with custom keywords
- **📍 Location Tracking** - Real-time GPS sharing
- **🌐 Offline Support** - Works without internet
- **📱 Unified Design** - Identical mobile and desktop experience

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/HyperPenetrator/My-Safety-App.git
cd My-Safety-App

# Start local server
npx http-server -p 8080

# Open in browser
http://localhost:8080
```

## 🔧 Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**
4. Update `firebase-config.js` with your credentials

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    // ... rest of config
};
```

## 📱 Pages

| Page | URL | Purpose |
|------|-----|---------|
| Landing | `index.html` | Welcome page |
| Auth | `auth.html` | Login/Register |
| Dashboard (Desktop) | `dashboard.html` | Main interface |
| Dashboard (Mobile) | `dashboard-mobile.html` | Mobile optimized |
| Permissions | `permissions.html` | Grant permissions |

## 🎯 Key Features

### Unified UX Parity
Desktop and mobile share identical structure with fluid scaling (375px - 1920px).

### Offline Mode
- Automatic data caching
- Network status indicator
- Works without Firebase

### Emergency System
- Hold SOS button 3 seconds
- Sequential contact calling
- Automatic country code detection

## 📖 Documentation

- [Changelog](docs/v2.0/CHANGELOG.md) - Version history
- [Testing Manual](docs/v2.0/TESTING_MANUAL.md) - Test procedures
- [Permissions Guide](docs/v2.0/PERMISSIONS_VERIFICATION.md)
- [Session Analysis](docs/v2.0/SESSION_ANALYSIS.md) - Development details

## 🚀 Deploy

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

### GitHub Pages
Enable in repository settings → Pages → Branch: main

## 🌐 Browser Support

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+

## 👥 Team

**CodeCraft Development Team**

- [Kasturi Kashyap](https://github.com/Kaz-yap) - Team Leader
- [Hrishikesh Dutta](https://github.com/HyperPenetrator) - Developer
- [Arnab Kumar Kashyap](https://github.com/arnabkashyap) - Developer
- [Shashwati Shivam Nath](https://github.com/shivamshashwati6) - Developer

## 📄 License

MIT License - see LICENSE file

## 🗺️ Roadmap

**v2.1** - PWA, Push Notifications  
**v2.2** - Video Calling, Live Streaming  
**v3.0** - AI Detection, Wearables

---

**Built with ❤️ for safety** • v2.0.0 • © 2024 CodeCraft

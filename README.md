# 🛡️ My Safety App

A comprehensive personal safety companion web application with emergency SOS features, voice commands, and offline support.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## 🌟 Features

### Core Safety Features
- **🚨 Emergency SOS System**: Quick access emergency button with sequential contact calling
- **📞 Emergency Contacts**: Store up to 5 trusted contacts with one-tap calling
- **📍 Location Tracking**: Real-time GPS location sharing with emergency contacts
- **🎤 Voice Commands**: Hands-free emergency activation with customizable keywords
- **🔊 Scream Detection**: AI-powered audio monitoring for distress sounds
- **🔋 Battery Alerts**: Automatic notifications to contacts when battery is low

### User Experience
- **📱 Unified Design**: 1:1 parity between mobile and desktop interfaces
- **🎨 Fluid Scaling**: Responsive design from 375px (mobile) to 1920px+ (desktop)
- **🌐 Offline Support**: Full functionality without internet connection
- **💾 Local Caching**: Automatic data persistence for offline access
- **⚡ Real-time Sync**: Seamless data synchronization when online

### Technical Features
- **🔥 Firebase Integration**: Cloud Firestore for data storage
- **🔐 Authentication**: Secure Firebase Authentication
- **🎯 PWA Ready**: Progressive Web App capabilities
- **📊 Performance**: Optimized for low-end devices
- **🌍 Multi-language**: Voice commands in 20+ languages

---

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 14+ required
node --version

# npm or yarn
npm --version
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/HyperPenetrator/My-Safety-App.git
cd My-Safety-App
```

2. **Set up Firebase**
- Create a Firebase project at https://console.firebase.google.com
- Enable Authentication (Email/Password)
- Enable Firestore Database
- Copy your Firebase config to `firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. **Run locally**
```bash
# Using http-server (recommended)
npx http-server -p 8080

# OR using Python
python -m http.server 8080

# OR using Node.js
npx serve
```

4. **Open in browser**
```
http://localhost:8080
```

---

## 📱 Application Structure

### Pages

| Page | Purpose | URL |
|------|---------|-----|
| **Landing** | Welcome page | `index.html` |
| **Authentication** | Login/Register | `auth.html` |
| **Dashboard (Desktop)** | Main interface (fluid layout) | `dashboard.html` |
| **Dashboard (Mobile)** | Mobile-optimized version | `dashboard-mobile.html` |
| **Permissions** | Permission management | `permissions.html` |

### File Organization
```
My-Safety-App/
├── index.html              # Landing page
├── auth.html               # Authentication
├── dashboard.html          # Desktop dashboard (unified)
├── dashboard-mobile.html   # Mobile dashboard
├── permissions.html        # Permissions setup
├── firebase-config.js      # Firebase configuration
├── mobile-detector.js      # Device detection
│
├── css/
│   ├── dashboard.css           # Desktop styles
│   ├── mobile-dashboard.css    # Mobile styles
│   ├── fluid-scaling.css       # ⭐ NEW: Responsive scaling
│   ├── offline-indicator.css   # ⭐ NEW: Offline banner
│   ├── emergency-calls.css     # SOS button styles
│   ├── permissions.css         # Permission UI
│   ├── voice-commands.css      # Voice interface
│   └── credits.css             # Team credits
│
└── js/
    ├── mobile-dashboard.js      # Dashboard logic
    ├── emergency-calls.js       # ⭐ UPDATED: Offline support
    ├── offline-detector.js      # ⭐ NEW: Network monitoring
    ├── permissions.js           # Permission manager
    ├── contacts-manager.js      # Contact handling
    ├── voice-command-manager.js # Voice recognition
    ├── location-tracking.js     # GPS tracking
    └── battery.js               # Battery monitoring
```

---

## 🎯 Key Features Explained

### 1. Unified Desktop-Mobile Experience

The app now uses a **single structural design** across all devices:

**Before:**
- Desktop: Sidebar navigation
- Mobile: Bottom navigation
- Different layouts = maintenance overhead

**After:**
- Desktop: Fluidly scaled mobile layout
- Mobile: Original optimized layout
- Identical DOM structure = zero layout shift

**Implementation:**
```css
/* Fluid typography */
:root {
    --fluid-base: clamp(16px, 1rem + 0.5vw, 22px);
    --container-width: clamp(375px, 90vw, 1200px);
}

/* Responsive spacing */
.sos-button {
    padding: clamp(1.5rem, 3vw, 2.5rem);
    border-radius: clamp(12px, 1.5vw, 20px);
}
```

### 2. Offline Mode Support

**How it works:**
1. **Detection**: `navigator.onLine` monitors network status
2. **Caching**: Data saved to `localStorage` on successful loads
3. **Fallback**: Cached data used when offline
4. **Visual Feedback**: Red banner shows offline status

**Cached Data:**
- Emergency contacts
- User profile information
- Custom voice keywords
- App preferences

**Code Example:**
```javascript
// Auto-cache on successful load
async function loadContacts() {
    const contacts = await firebase.firestore()...;
    localStorage.setItem('cached_contacts', JSON.stringify(contacts));
}

// Fallback when offline
if (!navigator.onLine) {
    const cached = localStorage.getItem('cached_contacts');
    return JSON.parse(cached);
}
```

### 3. Emergency Call System

**Sequential Calling:**
1. User presses SOS button (hold 3 seconds)
2. Countdown starts (3 seconds to cancel)
3. Calls first contact automatically
4. After 5 seconds, prompts to call next contact
5. Repeats for all emergency contacts (up to 3)

**Features:**
- ✅ Direct `tel:` protocol links
- ✅ Automatic country code detection (+91 for India)
- ✅ Fallback to copy-to-clipboard
- ✅ Call logging with timestamps
- ✅ Offline capability with cached contacts

### 4. Voice Commands

**Supported Languages:**
- English (US, UK, India)
- Hindi, Tamil, Telugu, Kannada, Malayalam
- Bengali, Marathi, Gujarati, Punjabi
- Spanish, French, German, Portuguese
- Japanese, Chinese, Arabic

**Default Keywords:**
- "Help"
- "Emergency"
- "SOS"
- Custom keywords (user-defined)

**How to use:**
1. Enable voice commands in Safety Tools
2. Grant microphone permission
3. Say any trigger keyword
4. Emergency sequence starts automatically

---

## 🔧 Configuration

### Firebase Setup

1. **Authentication Rules:**
```javascript
// Allow authenticated users
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

2. **Database Structure:**
```json
{
  "users": {
    "{userId}": {
      "name": "User Name",
      "email": "user@example.com",
      "emergencyContacts": [
        {
          "id": "contact_001",
          "name": "Contact Name",
          "phone": "+911234567890",
          "relation": "family",
          "email": "contact@example.com"
        }
      ],
      "safetyMode": {
        "enabled": true,
        "voiceCommandsEnabled": true,
        "screamDetectionEnabled": false
      },
      "voiceKeywords": ["help", "emergency"],
      "lastUpdated": Timestamp
    }
  }
}
```

### Permissions Required

| Permission | Purpose | Required |
|------------|---------|----------|
| **Location** | GPS tracking for emergency | ✅ Yes |
| **Microphone** | Voice commands & scream detection | ✅ Yes |
| **Contacts** | Quick contact import | ❌ Optional |
| **Notifications** | Battery alerts | ❌ Optional |

---

## 🧪 Testing

### Manual Testing Checklist

**Responsive Design:**
- [ ] Open on mobile device (actual hardware)
- [ ] Test on tablet (iPad, Android tablet)
- [ ] Test on desktop (1920x1080, 2560x1440)
- [ ] Resize browser window from 375px to 1920px
- [ ] Verify no layout jumps or broken elements

**Offline Functionality:**
1. Load app while online
2. Add emergency contacts
3. Open DevTools → Network → Set to "Offline"
4. Refresh page
5. Verify:
   - [ ] Offline banner appears
   - [ ] Cached contacts load
   - [ ] SOS button works
   - [ ] Voice commands work

**Emergency System:**
- [ ] Add 3 emergency contacts
- [ ] Press and hold SOS button
- [ ] Verify countdown (3 seconds)
- [ ] Confirm first contact call initiates
- [ ] Test cancel functionality
- [ ] Verify sequential calling

**Voice Commands:**
- [ ] Enable voice commands
- [ ] Grant microphone permission
- [ ] Say "Help" clearly
- [ ] Verify emergency activation
- [ ] Test custom keywords
- [ ] Test different languages

### Automated Testing (TODO)

```bash
# Unit tests (to be implemented)
npm test

# E2E tests (to be implemented)
npm run test:e2e
```

---

## 📊 Browser Support

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| **Chrome** | ✅ 90+ | ✅ 90+ | Recommended |
| **Firefox** | ✅ 88+ | ✅ 88+ | Full support |
| **Safari** | ✅ 14+ | ✅ 14+ | Voice commands limited |
| **Edge** | ✅ 90+ | ✅ 90+ | Full support |
| **Opera** | ✅ 76+ | ✅ 76+ | Full support |
| **Samsung Internet** | ⚠️ | ✅ 14+ | Mobile only |

**Required Features:**
- JavaScript ES6+
- LocalStorage
- Geolocation API
- Media Devices API (for voice)
- Service Workers (for PWA)

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

### GitHub Pages

```bash
# Enable GitHub Pages in repository settings
# Select branch: main
# Folder: / (root)
```

**Live URL:** `https://username.github.io/My-Safety-App`

---

## 🎓 Development

### Adding New Features

1. **Create feature branch**
```bash
git checkout -b feature/new-feature
```

2. **Follow file structure**
```
css/feature-name.css
js/feature-name.js
```

3. **Import in HTML**
```html
<link rel="stylesheet" href="css/feature-name.css">
<script src="js/feature-name.js"></script>
```

4. **Test thoroughly**
```bash
# Test offline
# Test different screen sizes
# Check console for errors
```

5. **Commit and push**
```bash
git add .
git commit -m "feat: Add new feature description"
git push origin feature/new-feature
```

### Code Style

**JavaScript:**
- Use `const`/`let`, avoid `var`
- Async/await over promises
- Descriptive function names
- Comment complex logic

**CSS:**
- Use CSS variables for theming
- Mobile-first approach
- Use `clamp()` for fluid sizing
- Avoid `!important`

**HTML:**
- Semantic HTML5 elements
- ARIA labels for accessibility
- Unique IDs for elements
- SEO-friendly meta tags

---

## 👥 Team

**CodeCraft Development Team**

| Member | Role | GitHub |
|--------|------|--------|
| **Kasturi Kashyap** | Team Leader | [@Kaz-yap](https://github.com/Kaz-yap) |
| **Hrishikesh Dutta** | Developer | [@HyperPenetrator](https://github.com/HyperPenetrator) |
| **Arnab Kumar Kashyap** | Developer | [@arnabkashyap](https://github.com/arnabkashyap) |
| **Shashwati Shivam Nath** | Developer | [@shivamshashwati6](https://github.com/shivamshashwati6) |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Google Fonts (Inter) for typography
- Web Speech API for voice recognition
- Geolocation API for location tracking

---

## 📞 Support

**Issues:** https://github.com/HyperPenetrator/My-Safety-App/issues  
**Discussions:** https://github.com/HyperPenetrator/My-Safety-App/discussions

---

## 🗺️ Roadmap

### Version 2.1 (Planned)
- [ ] PWA with service workers
- [ ] Push notifications
- [ ] Shared safety network
- [ ] Incident reporting history

### Version 2.2 (Future)
- [ ] Video calling integration
- [ ] Live location streaming
- [ ] Group safety features
- [ ] Emergency responder API

### Version 3.0 (Vision)
- [ ] AI-powered threat detection
- [ ] Wearable device integration
- [ ] Community safety platform
- [ ] Cross-platform mobile apps

---

**Built with ❤️ for safety and security**  
*Version 2.0.0 • © 2024 CodeCraft*

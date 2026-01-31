# ✅ My Safety V2 - Feature Verification Checklist

Please verify these features one by one on your devices.

## 📱 Mobile Experience (Test on Android Phone)

### 1. Navigation & Routing
- [ ] **Auto-Switch**: Open `https://my-safety-codecraft.netlify.app`. It should automatically load the **Mobile Dashboard** (bottom nav).
- [ ] **Switch to Desktop**: Tap Menu → "Switch to Desktop View". It should load the desktop dashboard.
- [ ] **Switch Back**: On the desktop view (on phone), open sidebar → "Switch to Mobile App". It should go back to mobile view.

### 2. Emergency SOS
- [ ] **SOS Button**: Tap and hold the large red SOS button.
- [ ] **Countdown**: Verify 3-second countdown.
- [ ] **Call Sequence**: It should try to call your first emergency contact.
- [ ] **Cancel**: Try canceling the countdown before it completes.

### 3. Contacts System
- [ ] **Add Contact (Import)**: Tap "Add Contacts". It should open your phone's contact picker.
- [ ] **Manual Fallback**: If import fails or is cancelled, it should ask for name/phone manually.
- [ ] **Quick Call**: Tap an added contact card. It should confirm then call.

### 4. Permissions
- [ ] **Quick Actions**: Tap "Permissions" card.
- [ ] **Grant All**: Tap "Grant All Permissions". Verify Location and Microphone turn green.

### 5. PWA & Offline
- [ ] **Install**: In Chrome menu, tap "Add to Home screen". Open the installed app.
- [ ] **Offline**: Turn off WiFi/Data. Open the app. It should load from cache.

---

## 💻 Desktop Experience (Test on PC)

### 1. Dashboard
- [ ] **Load**: Open `https://my-safety-codecraft.netlify.app`. It should load the **Desktop Dashboard** (sidebar).
- [ ] **Switch Button**: Check sidebar bottom for "Switch to Mobile App" button. Click it to verify it switches.

### 2. Contacts Import
- [ ] **Import Button**: Go to Contacts section → "Import Contacts".
- [ ] **Behavior**: On PC, it might say "Not Supported" or "Manual Only" (expected behavior), or show a file picker if supported by browser.

### 3. Permissions
- [ ] **Grant**: Go to Permissions section. Click "Request Location". Allow in browser.
- [ ] **Status**: Verify status changes to "Granted".

---

## 🛠 Troubleshooting

- **Switch not working?** Clear browser cache/cookies to reset preferences.
- **Contacts not importing?** Ensure you are on HTTPS (Netlify URL).
- **Location failed?** Ensure GPS is on and browser has permission.

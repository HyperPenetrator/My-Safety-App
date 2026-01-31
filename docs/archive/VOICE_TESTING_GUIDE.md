# 🎙️ Voice Command Testing Guide

I have implemented a **Web Speech API** based voice command system that works directly in the browser.

## ⚠️ Important Prerequisites
1.  **HTTPS Only**: Voice recognition requires HTTPS (Netlify provides this). It will **not** work on `http://localhost` if you are testing on a mobile device via LAN, unless you use USB debugging.
2.  **Permission**: You **MUST** allow Microphone access when prompted.
3.  **Android Support**: Works best on **Chrome for Android**.
4.  **iOS Support**: Works on **Safari** (ensure "Siri & Search" settings don't conflict, though Web Speech is standard).

---

## 🧪 Testing Steps

### Step 1: Activate Voice Mode
1.  Open the Dashboard (Desktop or Mobile).
2.  **Desktop**: Toggle "Voice Commands" ON.
3.  **Mobile**: It activates automatically if you enabled it previously, OR you can see the "Listening..." indicator below the logo.
    *   *Note: On mobile, you might need to enable it via Desktop first to save the preference, as we haven't added a dedicated mobile toggle yet.*

### Step 2: Verify "Listening" State
- Look for the **Red Light / Pulse** indicator.
- On Mobile: Below the "My Safety" logo.
- On Desktop: Inside the Voice Commands card.

### Step 3: Speak the Magic Words
Say any of these clearly:
- 🗣️ **"HELP"**
- 🗣️ **"EMERGENCY"**
- 🗣️ **"SAVE ME"**
- 🗣️ **"BACHAO"** (Hindi)

### Step 4: Confirm Action
- The **Red SOS Countdown** should immediately appear.
- The app will vibrate (on phone).
- It will start calling your contacts after 3 seconds.

---

## 🔧 Troubleshooting

**"Microphone Permission Denied"**
- Click the Lock icon in the address bar -> Reset Permissions -> Reload.

**"Network Error"**
- Web Speech API requires an internet connection on some devices (cloud processing). Ensure you are online.

**"Not Hearing Me"**
- Move to a quiet area.
- Speak clearly and firmly.
- Ensure no other app is using the mic (like a phone call).

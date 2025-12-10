# Testing Voice Commands on Mobile Device

## Prerequisites
- **Device**: Physical mobile phone (Android/iOS)
- **Browser**: Chrome (Android) or Safari (iOS)
- **Network**: Connected to internet
- **Contacts**: At least 1 emergency contact added

---

## Step-by-Step Testing

### 1. Access the Mobile Dashboard

1. Open your mobile browser
2. Navigate to: `https://your-netlify-url.netlify.app/dashboard-mobile.html`
3. Login if prompted
4. You should see the Home view with SOS button

### 2. Navigate to Safety View

1. Tap the **bottom navigation bar**
2. Tap the **"Safety" shield icon** (3rd icon)
3. You should see "Safety Tools" page
4. Find the **"Voice Commands"** card

### 3. Enable Voice Commands

1. **Tap the toggle switch** on the Voice Commands card (right side)
2. Browser will ask: **"Allow microphone access?"**
3. **Tap "Allow"**

**Expected Console Output:**
```
✓ Voice commands enabled on mobile
Voice monitoring active...
```

**Expected UI Changes:**
- Toggle switches to ON (blue/green)
- Header shows: **"Listening..."** indicator
- Keyword input section becomes visible

### 4. Test Voice Trigger

1. **Say clearly**: **"HELP"**
2. Wait 1-2 seconds

**Expected Console Output:**
```
Heard: help
🚨 EMERGENCY COMMAND DETECTED: help
🚨 Voice Command: Emergency Trigger Activated!
✓ Emergency Call System found, starting sequence...
✅ Loaded 1 emergency contacts: ["Contact Name"]
```

**Expected UI:**
- Red emergency modal appears
- Shows: "🚨 EMERGENCY CALL SEQUENCE"
- Countdown from 3
- Your contact(s) listed
- "Cancel Emergency" button

### 5. Test Other Keywords

Try saying:
- **"Emergency"**
- **"Stop"**
- **"Alert"**
- **"Bachao"** (Hindi)

All should trigger the same emergency sequence.

### 6. Add Custom Keyword (Mobile)

1. In the Voice Commands card (if toggle is ON)
2. Type a custom word in the input: e.g., **"danger"**
3. Tap **"Add"** button
4. Say your custom word
5. Should trigger emergency

---

## Troubleshooting

### ❌ "Voice recognition not supported"
**Cause**: Using unsupported browser (Firefox, Opera)  
**Fix**: Use Chrome on Android or Safari on iOS

### ❌ Toggle won't turn ON
**Cause**: Microphone permission denied  
**Fix**: 
1. Go to browser Settings
2. Site permissions
3. Enable Microphone for your site
4. Refresh page

### ❌ Voice not recognized
**Possible Causes:**
- Background noise too loud
- Speaking too softly
- Internet connection slow (voice processing needs network)

**Fix:**
- Move to quiet area
- Speak clearly and louder
- Check internet connection

### ❌ "Listening..." never appears
**Cause**: Voice manager not initialized  
**Fix**: 
1. Check console for errors
2. Refresh the page
3. Verify `voice-command-manager.js` loaded

### ❌ Emergency modal shows 0 contacts
**Cause**: Contacts not saved or read incorrectly  
**Fix**:
1. Go to Contacts view
2. Add at least 1 contact
3. Verify it appears in the list
4. Try voice command again

---

## Success Indicators

✅ **Toggle turns ON** without errors  
✅ **Header shows "Listening..."**  
✅ **Console shows "Heard: [word]"** when speaking  
✅ **Emergency modal appears** when saying trigger words  
✅ **Contacts are listed** in the modal  
✅ **Phone dialer opens** after countdown  

---

## Important Notes

### Browser Compatibility
- ✅ **Chrome (Android)** - Full support
- ✅ **Safari (iOS)** - Full support
- ❌ **Firefox Mobile** - Limited/No support
- ❌ **Samsung Internet** - May not support

### Privacy
- Voice recognition uses **Google Web Speech API**
- Audio is sent to Google servers for processing
- No audio is stored by our app

### Battery Impact
- Voice recognition runs continuously when enabled
- Will drain battery faster
- Disable when not needed

### Background Operation
- Most mobile browsers **stop voice recognition** when app is backgrounded
- Must keep app in foreground for voice commands to work
- Consider enabling "Keep screen on" in Settings

---

## Demo Video Script

1. **Show home screen**: "This is the My Safety app"
2. **Navigate to Safety**: "I'm going to the Safety tab"
3. **Toggle ON**: "Enabling voice commands... granting permission"
4. **Show indicator**: "See, it says 'Listening...'"
5. **Say HELP**: "Now I'll say HELP"
6. **Show modal**: "Emergency sequence activated! Contacts shown!"
7. **Cancel**: "I can cancel or let it call"

---

## Quick Test Checklist

- [ ] Mobile browser opened
- [ ] Logged in to app
- [ ] Navigated to Safety view
- [ ] Voice toggle switched ON
- [ ] Microphone permission granted
- [ ] Header shows "Listening..."
- [ ] Said "HELP" out loud
- [ ] Console shows "Heard: help"
- [ ] Emergency modal appeared
- [ ] Contact(s) listed in modal
- [ ] Countdown started
- [ ] Can cancel or wait for call

**If all checked ✅ = Voice Commands Working!** 🎉

# Emergency System Testing Guide

## Pre-Test Setup

1. **Login** to the app (Mobile or Desktop)
2. **Add at least 1 emergency contact**:
   - Mobile: Click "Add Contacts" button
   - Desktop: Go to "Emergency Contacts" section
3. **Open Browser Console** (F12 → Console tab)

---

## Test 1: SOS Button (Mobile)

### Steps:
1. Go to Mobile dashboard (`dashboard-mobile.html`)
2. Find the big red "EMERGENCY SOS" button
3. Click/Touch it

### Expected Console Output:
```
🚨 SOS Button Pressed!
✓ Emergency Call System found, starting sequence...
Contacts not loaded, fetching now...
✅ Loaded 1 emergency contacts: ["Contact Name"]
```

### Expected UI:
- Red modal appears with "🚨 EMERGENCY CALL SEQUENCE"
- Countdown from 3 seconds
- Contact list shows your added contact(s)
- "Cancel Emergency" button available

### Success Criteria:
✅ Modal appears  
✅ Countdown runs  
✅ Contact name displayed  
✅ After countdown, phone dialer opens with contact's number

---

## Test 2: Voice Command "Help"

### Steps:
1. Enable Voice Commands (toggle ON)
2. Grant microphone permission
3. Say **"HELP"** clearly

### Expected Console Output:
```
Heard: help
🚨 EMERGENCY COMMAND DETECTED: help
🚨 Voice Command: Emergency Trigger Activated!
✓ Emergency Call System found, starting sequence...
✅ Loaded 1 emergency contacts: ["Contact Name"]
```

### Expected UI:
- Same emergency modal as Test 1
- Countdown and contacts displayed

### Success Criteria:
✅ Voice recognition detects "help"  
✅ Emergency sequence starts  
✅ Modal appears with contacts

---

## Test 3: Scream Detection

### Steps:
1. Enable Scream Detection (toggle ON)
2. Grant microphone permission
3. Make a loud, high-pitched sound (or shout)

### Expected Console Output:
```
🚨 SCREAM EMERGENCY TRIGGERED 🚨
Volume: 180.34, Frequency: 2500.12 Hz
```

### Expected UI:
- Emergency modal appears
- Contacts displayed
- Voice commands auto-enabled

### Success Criteria:
✅ Loud sound detected  
✅ Emergency sequence starts  
✅ Modal shows contacts

---

## Test 4: No Contacts Scenario

### Steps:
1. **Remove all emergency contacts** (in Firestore or UI)
2. Click SOS button OR say "Help"

### Expected Console Output:
```
✅ Loaded 0 emergency contacts: []
No emergency contacts found in user document
```

### Expected UI:
- Alert appears: "⚠️ NO EMERGENCY CONTACTS FOUND"
- Offers to navigate to contacts page
- If accepted, navigates to Add Contacts section

### Success Criteria:
✅ System detects 0 contacts  
✅ User-friendly error message  
✅ Offers solution (add contacts)

---

## Troubleshooting

### Issue: "Emergency system not initialized"
**Cause**: Script load order problem  
**Fix**: Refresh page, check console for script errors

### Issue: Contact count always 0
**Cause**: Firestore data structure mismatch (FIXED)  
**Check**: Open Firestore console, verify `emergencyContacts` exists as array

### Issue: Voice commands not recognized
**Cause**: Microphone permission denied or unsupported browser  
**Fix**: Use Chrome/Edge, grant mic permission

### Issue: Modal doesn't appear
**Cause**: CSS not loaded or modal creation error  
**Check**: Console for errors, verify `emergency-calls.css` loaded

---

## Success Confirmation

All 4 tests should pass. The critical flow is:

1. **Trigger** (SOS/Voice/Scream) → 
2. **Load Contacts** (from Firestore array) → 
3. **Show Modal** (with contacts listed) → 
4. **Countdown** (3 seconds) → 
5. **Initiate Call** (tel: link opens phone dialer)

If any step fails, check the console output for specific error messages.

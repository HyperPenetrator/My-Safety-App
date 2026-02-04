# Testing Manual

## Overview
This document provides step-by-step testing procedures for My Safety App v2.0.0.

---

## 🧪 Test Categories

### 1. Responsive Design Testing

#### Desktop Testing (1920x1080)
**Steps:**
1. Open http://localhost:8080/dashboard.html in Chrome
2. Press F12 to open DevTools
3. Set viewport to 1920x1080
4. Navigate through all sections: Home, Contacts, Safety, Profile
5. Verify no horizontal scrollbar appears
6. Check that text is readable (not too large)

**Expected Results:**
- ✅ Content centered with max-width of 1200px
- ✅ Bottom navigation visible and functional
- ✅ Hamburger menu opens side drawer
- ✅ All cards and buttons properly sized

#### Tablet Testing (768x1024)
**Steps:**
1. Set DevTools viewport to 768x1024
2. Refresh page
3. Navigate through all sections

**Expected Results:**
- ✅ Layout scales down proportionally
- ✅ Touch targets remain > 44px
- ✅ Text remains readable

#### Mobile Testing (375x667)
**Steps:**
1. Set DevTools viewport to 375x667 (iPhone SE)
2. Refresh page
3. Test all interactions

**Expected Results:**
- ✅ Bottom nav fits perfectly
- ✅ SOS button fills available width
- ✅ Contact cards stack vertically
- ✅ No content overflow

#### Fluid Scaling Test
**Steps:**
1. Start at 375px width
2. Slowly drag viewport to 1920px
3. Observe elements scaling

**Expected Results:**
- ✅ Font sizes scale smoothly (no jumps)
- ✅ Spacing increases proportionally
- ✅ No layout shifts or reflows
- ✅ Images/icons scale appropriately

**Pass Criteria:** Zero layout shifts detected

---

### 2. Offline Mode Testing

#### Initial Setup
**Steps:**
1. Ensure internet connection is active
2. Open http://localhost:8080/dashboard-mobile.html
3. Log in with your account
4. Add 2-3 emergency contacts
5. Verify contacts appear in Home view

#### Test Offline Detection
**Steps:**
1. Open DevTools (F12)
2. Go to Network tab
3. Change throttling from "No throttling" to "Offline"
4. Wait 1-2 seconds

**Expected Results:**
- ✅ Red banner appears at top: "You're offline - Using cached data"
- ✅ Console shows: "⚠️ Device is OFFLINE"
- ✅ Body gets class "offline-mode"
- ✅ Header shifts down by 50px

#### Test Cached Data Loading
**Steps:**
1. While still offline, refresh the page (F5)
2. Observe console logs
3. Check if contacts appear

**Expected Results:**
- ✅ Console shows: "✓ Using cached contacts from previous session"
- ✅ Emergency contacts visible in Quick Call section
- ✅ Profile name and email display correctly
- ✅ No Firebase errors (handled gracefully)

#### Test SOS Offline
**Steps:**
1. While offline, click and hold SOS button
2. Observe countdown and modal

**Expected Results:**
- ✅ Emergency modal appears
- ✅ Cached contacts listed
- ✅ Countdown proceeds (3, 2, 1)
- ✅ Call attempts use cached phone numbers
- ✅ No Firebase calls attempted

#### Test Online Recovery
**Steps:**
1. Change Network throttling back to "No throttling"
2. Wait 1-2 seconds

**Expected Results:**
- ✅ Red banner disappears
- ✅ Console shows: "✅ Device is ONLINE"
- ✅ Body class "offline-mode" removed
- ✅ Header returns to original position
- ✅ Firebase reconnects automatically

**Pass Criteria:** App functions 100% offline with cached data

---

### 3. Emergency Call System

#### Setup
**Prerequisites:**
- 3 emergency contacts added
- Phone numbers in format: +911234567890 or 1234567890

#### Test SOS Button
**Steps:**
1. Navigate to Home view
2. Press and hold the red SOS button
3. Count to 3 seconds
4. Release

**Expected Results:**
- ✅ Button scales down (0.95) on touch
- ✅ Modal appears with "🚨 EMERGENCY CALL SEQUENCE"
- ✅ Countdown shows: 3, 2, 1, 0
- ✅ After countdown, first contact is called
- ✅ Phone dialer opens with correct number

#### Test Cancel Emergency
**Steps:**
1. Press SOS button
2. Wait 1 second
3. Click "Cancel Emergency" button

**Expected Results:**
- ✅ Modal closes immediately
- ✅ No calls are made
- ✅ Toast shows: "Emergency call sequence cancelled"

#### Test Sequential Calling
**Steps:**
1. Press SOS button and wait for countdown
2. Allow first call to attempt
3. Wait 5 seconds
4. Confirm dialog: "Call next contact?"
5. Click OK

**Expected Results:**
- ✅ First contact status shows "✓ Called"
- ✅ Second contact status shows "📞 Calling..."
- ✅ Phone dialer opens for second contact
- ✅ Process repeats for all contacts
- ✅ Final message: "All Emergency Contacts Called"

#### Test Quick Call (from Home)
**Steps:**
1. Navigate to Home view
2. Click on a contact card in "Quick Call" section

**Expected Results:**
- ✅ Phone dialer opens immediately
- ✅ Correct phone number populated
- ✅ No countdown or modal

**Pass Criteria:** All contacts called successfully in sequence

---

### 4. Voice Commands

#### Check Browser Support
**Steps:**
1. Open Console
2. Type: `'webkitSpeechRecognition' in window`
3. Check result

**Expected Results:**
- ✅ Returns `true` in Chrome/Edge
- ⚠️ Returns `false` in Firefox (not supported)

#### Enable Voice Commands
**Steps:**
1. Navigate to Safety view
2. Toggle "Voice Commands" switch
3. Allow microphone permission if prompted

**Expected Results:**
- ✅ Toggle turns green
- ✅ Microphone permission granted
- ✅ Settings section expands
- ✅ Console: "✓ Voice commands enabled on mobile"
- ✅ Voice indicator appears in header

#### Test Default Keywords
**Steps:**
1. Ensure voice commands enabled
2. Say clearly: "Help"
3. Wait 1 second

**Expected Results:**
- ✅ Voice indicator pulses (shows listening)
- ✅ Keyword recognized (console log)
- ✅ Emergency SOS sequence starts
- ✅ Modal appears with countdown

#### Test Custom Keywords
**Steps:**
1. Navigate to Safety view
2. Scroll to "Help Keywords" section
3. Type custom keyword (e.g., "danger") in input
4. Click "+" button
5. Say custom keyword

**Expected Results:**
- ✅ Keyword added to tags list
- ✅ Keyword saved to Firebase
- ✅ Saying keyword triggers emergency

#### Test Language Support
**Steps:**
1. Navigate to Safety view (Desktop version)
2. Find "Voice Language" dropdown
3. Select "हिन्दी (Hindi)"
4. Say: "मदद" (madad = help in Hindi)

**Expected Results:**
- ✅ Language changes
- ✅ Recognition works in hindi
- ✅ Emergency triggered

**Pass Criteria:** Voice triggers emergency 90%+ of the time

---

### 5. Permission Management

#### Test Location Permission
**Steps:**
1. Navigate to Permissions section
2. Click "Grant Location Access" button
3. Allow permission in browser prompt
4. Wait for location detection

**Expected Results:**
- ✅ Status changes from "Pending" to "Granted"
- ✅ Badge turns green
- ✅ Current location displays (city, coordinates)
- ✅ Overview stat updates: "Granted" in green

#### Test Microphone Permission
**Steps:**
1. Click "Grant Microphone Access"
2. Allow permission
3. Check status

**Expected Results:**
- ✅ Status changes to "Granted"
- ✅ Microphone becomes available for voice commands
- ✅ Waveform icon appears when speaking

#### Test Permission Persistence
**Steps:**
1. Grant all permissions
2. Refresh page
3. Check permission status

**Expected Results:**
- ✅ All permissions remain "Granted"
- ✅ No need to re-authorize

**Pass Criteria:** All 4 permissions requestable and persistent

---

### 6. Data Persistence

#### Test Contact Sync
**Steps:**
1. Add emergency contact
2. Refresh page
3. Navigate to Contacts view

**Expected Results:**
- ✅ Contact still present
- ✅ No duplicate entries
- ✅ Contact data unchanged (name, phone, relation)

#### Test Safety Mode Persistence
**Steps:**
1. Toggle Safety Mode ON
2. Refresh page
3. Check toggle state

**Expected Results:**
- ✅ Toggle remains ON
- ✅ Status shows "Active"
- ✅ Color remains green

#### Test Voice Keywords Sync
**Steps:**
1. Add 3 custom keywords
2. Refresh page
3. Navigate to Safety view

**Expected Results:**
- ✅ All 3 keywords present
- ✅ Keywords trigger emergency when spoken

---

### 7. Edge Cases

#### Test No Contacts
**Steps:**
1. Delete all emergency contacts
2. Press SOS button

**Expected Results:**
- ✅ Alert shows: "NO EMERGENCY CONTACTS FOUND"
- ✅ Option to add contacts
- ✅ No errors in console

#### Test Invalid Phone Numbers
**Steps:**
1. Add contact with number: "abcdefgh"
2. Try to call via SOS

**Expected Results:**
- ✅ Number sanitized (non-digits removed)
- ✅ If no valid digits, error shown
- ✅ Option to copy to clipboard

#### Test Slow Network
**Steps:**
1. Set Network throttling to "Slow 3G"
2. Add new contact
3. Observe behavior

**Expected Results:**
- ✅ Loading indicator appears
- ✅ Contact saves eventually
- ✅ No timeout errors
- ✅ User feedback provided

#### Test Concurrent SOS
**Steps:**
1. Press SOS button
2. While modal is open, press SOS again

**Expected Results:**
- ✅ Second press ignored
- ✅ Console: "Emergency sequence already active"
- ✅ No duplicate calls

---

## 📊 Test Results Template

Create a test report using this format:

```markdown
# Test Report - My Safety App v2.0.0

**Date:** [Date]
**Tester:** [Name]
**Browser:** Chrome 120.0
**OS:** Windows 11

## Test Results

| Category | Test Case | Status | Notes |
|----------|-----------|--------|-------|
| Responsive | Desktop 1920px | ✅ Pass | No issues |
| Responsive | Mobile 375px | ✅ Pass | Perfect fit |
| Responsive | Fluid Scaling | ✅ Pass | Smooth transitions |
| Offline | Offline Detection | ✅ Pass | Banner appears |
| Offline | Cached Data Load | ✅ Pass | All data loaded |
| Offline | SOS Offline | ✅ Pass | Works perfectly |
| Emergency | SOS Button | ✅ Pass | Calls initiated |
| Emergency | Cancel | ✅ Pass | Cancels correctly |
| Emergency | Sequential Call | ✅ Pass | All 3 contacts called |
| Voice | Default Keywords | ⚠️ Partial | 80% accuracy |
| Voice | Custom Keywords | ✅ Pass | Works well |
| Voice | Hindi Language | ✅ Pass | Recognized |
| Permissions | Location | ✅ Pass | Granted successfully |
| Permissions | Microphone | ✅ Pass | Granted successfully |
| Data | Contact Sync | ✅ Pass | Persisted across refresh |
| Data | Safety Mode | ✅ Pass | State maintained |
| Edge Cases | No Contacts | ✅ Pass | Handled gracefully |
| Edge Cases | Invalid Phone | ✅ Pass | Sanitized correctly |

## Summary
- **Total Tests:** 20
- **Passed:** 19
- **Failed:** 0
- **Partial:** 1

## Issues Found
1. Voice recognition accuracy ~80% in noisy environment
   - Severity: Low
   - Workaround: Use manual SOS button

## Recommendations
1. Add visual feedback for voice recognition
2. Increase voice sensitivity settings
3. Add retry mechanism for failed calls
```

---

## 🚀 Automated Testing (Future)

```javascript
// Example test structure (to be implemented)

describe('Emergency Call System', () => {
  it('should open dialer when SOS pressed', () => {
    cy.visit('/dashboard.html');
    cy.get('#sosButton').click({ duration: 3000 });
    cy.get('.emergency-modal').should('be.visible');
  });

  it('should use cached contacts offline', () => {
    cy.visit('/dashboard.html');
    cy.window().then(win => win.navigator.onLine = false);
    cy.reload();
    cy.get('.contact-card').should('have.length.greaterThan', 0);
  });
});
```

---

**Testing Complete!** ✅

Report all bugs to: https://github.com/HyperPenetrator/My-Safety-App/issues

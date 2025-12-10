# 🛠️ Mobile Dashboard Troubleshooting Guide

## 🚨 Problem: "Buttons Not Working"

**Symptoms:**
- Tapping "Add Contacts" does nothing.
- Tapping "Permissions" or "Location" cards does nothing.
- Tapping "Home", "Contacts" bottom nav does nothing.
- SOS button might behave erratically.

**Root Cause:**
Modern security policies (Content Security Policy or **CSP**) often block **inline event handlers** (like `onclick="..."`) to prevent Cross-Site Scripting (XSS) attacks. Even if we allow `'unsafe-inline'`, some browsers (especially mobile Safari/Chrome) or extensions might block them or they simply fail to reference the function if the script loaded late.

**Solution Applied:**
We have refactored the code to use **JavaScript Event Listeners** instead of inline HTML attributes.
- **Old (Blocked):** `<button onclick="addContact()">`
- **New (Working):** `<button id="addContactBtn">` + `document.getElementById('addContactBtn').addEventListener('click', addContact)`

---

## 📱 Mobile-Specific Issues & Workarounds

### 1. Touch vs. Click Support
- **Issue:** Mobile browsers have a 300ms delay on `click` events, or sometimes ignore them if they interpret the tap as a scroll or zoom.
- **Fix:** We use `addEventListener` which binds correctly to the browser's touch/click logic. For the SOS button, we also listen for `touchstart` and `touchend` for immediate response.

### 2. CSP Headers (Netlify)
- **Issue:** Strict headers like `script-src 'self'` can block external scripts if not whitelisted.
- **Fix:** We updated `_headers` to whitelist:
  - `accounts.google.com` (for Google Auth)
  - `apis.google.com`
  - `firebaseapp.com`
  
### 3. Z-Index / Overlays
- **Issue:** Sometimes invisible overlays (like a loading spinner that is `opacity: 0` but still `display: block`) cover buttons.
- **Fix:** Ensure all modals/overlays have `pointer-events: none` when hidden, or `display: none`. We verified `loadingOverlay` uses `.hidden { display: none; }`.

---

## 🧪 How to Verify the Fix

1. **Clear Cache:** Mobile browsers cache aggressively.
   - iOS: Settings > Safari > Clear History and Website Data.
   - Android Chrome: Menu > Settings > Privacy > Clear Browsing Data.
2. **Reload Page:** Refresh the dashboard.
3. **Test Buttons:**
   - Tap "Add Contacts" -> Should prompt imports or manual entry.
   - Tap "Permissions" -> Should attempt to toggle/show permission requests.
   - Tap "Menu" -> Should open side drawer.

## 📞 Support
If buttons still fail, check the **Web Console** (requires connecting phone to PC):
- Look for `ReferenceError: addContact is not defined` (Script load order issue).
- Look for `CSP constraint violation` (Header issue).

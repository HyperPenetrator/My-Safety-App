# 🔧 Vercel Deployment Troubleshooting

## Issue: 404 Errors for CSS/JS Files

### Problem:
Console shows:
```
Failed to load resource: the server responded with a status of 404 ()
```

### Common Causes:

1. **Incorrect file paths in HTML**
2. **Case-sensitive URLs** (local works, Vercel doesn't)
3. **Files not committed to Git**
4. **Build output directory mismatch**

### Fix Steps:

#### Step 1: Verify Files Exist in Git

```bash
# Run in terminal
git ls-files | grep css
git ls-files | grep js
```

Expected output should include:
```
css/dashboard.css
css/mobile-dashboard.css
css/offline-indicator.css
css/fluid-scaling.css
js/mobile-dashboard.js
js/emergency-calls.js
js/offline-detector.js
```

#### Step 2: Check HTML File Paths

All paths should be relative and lowercase:

**✅ CORRECT:**
```html
<link rel="stylesheet" href="css/mobile-dashboard.css">
<script src="js/offline-detector.js"></script>
```

**❌ WRONG:**
```html
<link rel="stylesheet" href="/css/Mobile-Dashboard.css">
<script src="./JS/offline-detector.js"></script>
```

#### Step 3: Verify in Vercel

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" → Latest deployment
3. Click "..." → "View Source"
4. Check if files are present in the deployment

#### Step 4: Clear Vercel Cache

```bash
# In your project directory
git commit --allow-empty -m "trigger rebuild"
git push origin main
```

Or in Vercel Dashboard:
1. Project → Settings
2. Scroll to bottom
3. Click "Clear Build Cache"
4. Redeploy

### Testing 404 Errors:

Open browser DevTools (F12) → Network tab:

**Look for:**
- Red entries (404 errors)
- Check the Request URL
- Compare with actual file path

**Fix:**
- Update HTML `<link>` or `<script>` tags
- Ensure file exists in git
- Push changes

---

## Issue: Responsive Design Issues

### Problem:
Layout breaks on different screen sizes

### Fix:

#### Ensure Viewport Meta Tag:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

#### Verify Fluid Scaling CSS is Loaded:

```html
<!-- In dashboard.html and dashboard-mobile.html -->
<link rel="stylesheet" href="css/fluid-scaling.css">
```

#### Test Responsive Breakpoints:

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl + Shift + M)
3. Test these widths:
   - 375px (mobile)
   - 768px (tablet)
   - 1920px (desktop)

---

## Issue: Offline Indicator Not Showing

### Fix:

1. Verify files are in git:
```bash
git ls-files | grep offline
```

Should show:
```
css/offline-indicator.css
js/offline-detector.js
```

2. Ensure HTML imports:
```html
<link rel="stylesheet" href="css/offline-indicator.css">
<script src="js/offline-detector.js"></script>
```

3. Test offline mode:
   - DevTools → Network → Offline
   - Red banner should appear at top

---

## Quick Diagnostic Script

Run this in browser console (F12):

```javascript
console.log("=== DIAGNOSTIC REPORT ===");

// 1. Check Firebase
console.log("Firebase loaded:", typeof firebase !== 'undefined');
if (typeof firebase !== 'undefined') {
    console.log("Auth available:", typeof firebase.auth !== 'undefined');
}

// 2. Check scripts
console.log("\nLoaded Scripts:");
document.querySelectorAll('script').forEach(s => {
    if (s.src) console.log(s.src);
});

// 3. Check stylesheets
console.log("\nLoaded Stylesheets:");
document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
    console.log(l.href);
});

// 4. Check offline detector
console.log("\nOffline Detector:", typeof updateOnlineStatus !== 'undefined');

// 5. Check network
console.log("\nOnline Status:", navigator.onLine);

// 6. Check errors
console.log("\nCheck Network tab for 404 errors!");
```

---

## Complete Redeployment Checklist

If all else fails, do a fresh deploy:

- [ ] Commit all files to git
- [ ] Push to GitHub
- [ ] Delete Vercel project
- [ ] Re-import from GitHub
- [ ] Leave ALL build settings empty
- [ ] Deploy
- [ ] Add Firebase authorized domains
- [ ] Test authentication
- [ ] Test offline mode
- [ ] Test responsive design

---

**Most issues are solved by:**
1. Ensuring files are committed to git
2. Using correct relative file paths
3. Adding Vercel domain to Firebase

Good luck! 🚀

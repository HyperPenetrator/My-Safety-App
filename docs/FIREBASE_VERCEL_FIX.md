# 🔥 Firebase Configuration Guide for Vercel Deployment

## Issue: "This domain is not authorized for OAuth operations"

### Quick Fix (5 minutes):

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com
   - Select your project: **my-safety-e362d**

2. **Add Authorized Domains:**
   - Click **Authentication** (left sidebar)
   - Click **Settings** tab (top)
   - Scroll to **Authorized domains**
   - Click **Add domain** button

3. **Add These Domains (one by one):**
   ```
   my-safety-gn2vv1q1x-hrishikesh-duttas-projects.vercel.app
   my-safety-app-me94.vercel.app
   localhost
   127.0.0.1
   ```

4. **Wildcard for All Vercel Deployments (Optional):**
   ```
   *.vercel.app
   ```

5. **Click Save**

### Verify Firebase Config:

Check that your `firebase-config.js` matches Firebase Console:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyAWJBPVodBfR7h7x7nMY0ZxGnt7f6tIoaU",
    authDomain: "my-safety-e362d.firebaseapp.com",
    projectId: "my-safety-e362d",
    storageBucket: "my-safety-e362d.firebasestorage.app",
    messagingSenderId: "286418003868",
    appId: "1:286418003868:web:39eb14fe3e5f92f20f8a59"
};
```

### Update Firestore Rules:

1. Go to **Firestore Database** → **Rules**
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### Test After Fix:

1. Clear browser cache (Ctrl + Shift + R)
2. Visit your Vercel URL
3. Try to register/login
4. Should work without Firebase error

---

**This is the #1 issue causing authentication to fail!**

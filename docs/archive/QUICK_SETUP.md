# 🚀 Quick Setup Guide - SafeTY Authentication

## ⚡ 5-Minute Setup

### Step 1: Create Firebase Project (2 minutes)

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Click **"Add project"** or select existing project
3. Enter project name: `SafeTY` (or your choice)
4. Disable Google Analytics (optional, can enable later)
5. Click **"Create project"**

### Step 2: Enable Authentication (1 minute)

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Google"**:
   - Click on Google
   - Toggle "Enable"
   - Click "Save"
5. Enable **"Email/Password"**:
   - Click on Email/Password
   - Toggle "Enable" (first option only)
   - Click "Save"

### Step 3: Enable Firestore (1 minute)

1. In Firebase Console, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location (closest to your users)
5. Click **"Enable"**

### Step 4: Get Configuration (1 minute)

1. In Firebase Console, click the **gear icon** (⚙️) → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **web icon** (`</>`) to add a web app
4. Enter app nickname: `SafeTY Web`
5. Check **"Also set up Firebase Hosting"** (optional)
6. Click **"Register app"**
7. **Copy the configuration object** that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "safety-xxxxx.firebaseapp.com",
  projectId: "safety-xxxxx",
  storageBucket: "safety-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### Step 5: Update Your Code (30 seconds)

1. Open `firebase-config.js` in your code editor
2. Replace the placeholder values with your actual config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",           // ← Paste here
    authDomain: "your-project.firebaseapp.com", // ← Paste here
    projectId: "your-project-id",            // ← Paste here
    storageBucket: "your-project.appspot.com", // ← Paste here
    messagingSenderId: "123456789012",       // ← Paste here
    appId: "1:123456789012:web:abcdef",      // ← Paste here
    measurementId: "G-XXXXXXXXXX"            // ← Paste here
};
```

3. Save the file

### Step 6: Test It! (30 seconds)

1. Open `auth.html` in your browser
2. Click **"Continue with Google"**
3. Sign in with your Google account
4. You should be redirected to `dashboard.html`
5. Check Firebase Console → Authentication → Users to see your account!

---

## ✅ That's It!

Your authentication system is now fully functional! 🎉

---

## 🔧 Optional: Set Up Security Rules

For production, update your Firestore security rules:

1. In Firebase Console → **Firestore Database** → **Rules**
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

---

## 🌐 Optional: Add Your Domain (For Production)

1. In Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Click **"Add domain"**
3. Enter your production domain (e.g., `safety-app.com`)
4. Click **"Add"**

---

## 🐛 Troubleshooting

### "Firebase not initialized" error
- Check that you've updated `firebase-config.js` with your actual credentials
- Make sure all values are in quotes

### Google Sign-In popup blocked
- Allow popups in your browser
- Try again

### "User not found" when signing in
- If using Google: Make sure you clicked "Sign Up" first (or the system will auto-create your account)
- If using Email: Make sure you registered first

### Can't see users in Firestore
- Go to Firestore Database → Data
- Look for the `users` collection
- It's created automatically when first user signs up

---

## 📚 Need More Help?

- **Detailed docs**: See `AUTH_README.md`
- **Firebase docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Check console**: Open browser DevTools (F12) to see error messages

---

## 🎯 Next Steps

Once authentication works:
1. ✅ Test both Google and Email sign-in
2. ✅ Verify user profiles in Firestore
3. ✅ Update dashboard.html to show user info
4. ✅ Add password reset functionality
5. ✅ Set up production security rules
6. ✅ Deploy to hosting platform

---

**Happy coding! 🚀**

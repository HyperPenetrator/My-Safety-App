# 🔒 Security Setup Guide

To fully secure your application and prevent data leaks, please follow these critical steps.

## 1. Enable Google Sign-In (Required)
You must enable Google Auth in the Firebase Console for the button to work.
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **My-Safety**
3. Navigate to **Authentication** (left sidebar)
4. Click **Sign-in method** tab
5. Click **Add new provider** -> **Google**
6. Toggle **Enable**
7. Enter a support email and click **Save**.

## 2. Deploy Security Rules (Prevents Data Leaks)
I have created strict database rules in `firestore.rules`.
To deploy them:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database** -> **Rules** tab
3. Paste the contents of `firestore.rules` (from your project folder)
4. Click **Publish**

**This ensures User A can NEVER see User B's data.**

## 3. Restrict API Keys (Critical)
To prevent others from stealing your API key:
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Click on the **Browser key** (auto-created by Firebase)
4. Under **Application restrictions**, select **HTTP referrers (web sites)**
5. Add your domains:
   - `my-safety-codecraft.netlify.app`
   - `localhost` (for testing)
6. Click **Save**.

## 4. Setup Content Security Policy (Optional but Recommended)
For Netlify, add a `_headers` file with strict policies (I can add this if you request).

---

### ✅ What is now secured?
- **Sessions**: Users remain logged in securely (Local Persistence).
- **Database**: 100% segregated data access (Security Rules).
- **Auth**: Google Oauth 2.0 implementation.

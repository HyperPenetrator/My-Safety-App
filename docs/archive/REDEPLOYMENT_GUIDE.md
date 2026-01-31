# 🚀 Redeployment Guide (New Netlify Account)

Since you moved to a new Netlify account, your app has a **new URL**. You must update your configuration to allow the new site to talk to Firebase and Google.

---

## Step 1: Deploy to New Netlify Account
1.  Log in to your **new** [Netlify](https://app.netlify.com) account.
2.  Click **"Add new site"** -> **"Import from an existing project"**.
3.  Select **GitHub**.
4.  Authorize Netlify to access your GitHub repositories.
5.  Select **`HyperPenetrator/My-Safety-App`**.
6.  **Build Settings:**
    *   **Base directory**: (Leave empty)
    *   **Publish directory**: `.` (or leave empty)
    *   **Build command**: (Leave empty)
7.  Click **"Deploy Site"**.
8.  Wait for the deploy to match "green".
9.  **Copy your new Site URL** (e.g., `https://glowing-pudding-123456.netlify.app`).

---

## 🚨 Step 2: Update Firebase (CRITICAL)
Your new website will **FAIL** to log in unless you tell Firebase it is safe.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (**My Safety**).
3.  Go to **Authentication** (Left Sidebar) -> **Settings** tab.
4.  Scroll down to **Authorized domains**.
5.  Click **"Add domain"**.
6.  Paste your **NEW Netlify Domain** (without `https://` and trailing slash, e.g., `glowing-pudding-123456.netlify.app`).
7.  Click **Add**.

---

## Step 3: Update Google Cloud API (If using Maps/Geocoding)
If you restricted your API keys (recommended), you must allow the new domain.

1.  Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2.  Find your **Browser Key** (API Key).
3.  Under **Website restrictions**, add your **NEW Netlify URL**.
4.  Click **Save**.

---

## Step 4: Verify
1.  Open your new Netlify URL on your phone/PC.
2.  **Try to Login**: If Firebase settings are correct, Google Sign-In will work.
3.  **Test Voice**: Toggle "Voice Commands".
4.  **Test Scream**: Toggle "Scream Detection".

You are back online! 🌐

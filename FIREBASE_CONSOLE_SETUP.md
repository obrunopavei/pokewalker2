# Firebase Console Setup - Step-by-Step Guide

This guide will walk you through the exact steps to set up Firebase Authentication and Firestore Database in the Firebase Console.

---

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)
- Your Firebase project created (pokewalker-tracker)

---

## Part 1: Enable Google Authentication

### Step 1.1: Navigate to Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. If you're not signed in, sign in with your Google account
3. You should see your project list. Click on **pokewalker-tracker** (or your project name)
4. In the left sidebar, look for **"Authentication"** (it has an icon of a key/shield)
5. Click on **Authentication**

### Step 1.2: Get Started with Authentication

1. If you see a **"Get started"** button, click it
2. You'll see a welcome screen explaining Authentication features
3. Click **"Get started"** again to proceed

### Step 1.3: Enable Google Sign-In Provider

1. You should now see the Authentication dashboard
2. At the top, you'll see several tabs: **Users**, **Sign-in method**, **Templates**, etc.
3. Click on the **"Sign-in method"** tab
4. You'll see a list of sign-in providers (Email/Password, Google, Facebook, etc.)

5. Find **"Google"** in the list and click on it

### Step 1.4: Configure Google Sign-In

1. You'll see a dialog/section for Google configuration
2. Toggle the **"Enable"** switch to **ON** (it will turn blue/active)
3. You'll see a field for **"Project support email"**
   - This email is used for support communications
   - Enter your email address (the one you use for Firebase)
   - Example: `your-email@gmail.com`
4. **Project public-facing name** is optional - you can leave it as is
5. Click the **"Save"** button at the bottom

### Step 1.5: Verify Google is Enabled

1. After saving, you should be taken back to the Sign-in method list
2. **Google** should now show as **"Enabled"** (with a green checkmark or "Enabled" badge)
3. ✅ **Success!** Google Authentication is now enabled

**Common Issues:**
- If you get an error about "OAuth consent screen", see Part 3 below
- If "Save" button doesn't work, make sure you entered a valid email

---

## Part 2: Create Firestore Database

### Step 2.1: Navigate to Firestore Database

1. In the Firebase Console, look at the left sidebar
2. Find **"Firestore Database"** (it has a database icon)
3. Click on **"Firestore Database"**

### Step 2.2: Create Database

1. If this is your first time, you'll see a welcome screen
2. Click the **"Create database"** button (large blue button in the center)

**If you already have a database:**
- Skip to Step 2.4 to set up security rules

### Step 2.3: Configure Database Settings

1. **Security Rules - Choose one:**

   **Option A: Start in test mode (Recommended for development)**
   - Select **"Start in test mode"**
   - ⚠️ **Warning:** This allows read/write access for 30 days
   - This is fine for development/testing
   - Click **"Next"**

   **Option B: Start in production mode**
   - Select **"Start in production mode"**
   - More secure but requires custom rules
   - Click **"Next"**

2. **Choose a location:**
   - Select a location closest to where your users are
   - Common choices:
     - `us-central` (United States - Central)
     - `us-east1` (United States - East)
     - `europe-west` (Europe)
     - `asia-southeast1` (Asia)
   - **Note:** You cannot change this later, but it won't affect functionality much
   - Click **"Enable"**

3. Wait for the database to be created (this takes 30-60 seconds)
   - You'll see a loading indicator
   - Don't close the browser tab

### Step 2.4: Set Up Security Rules

1. Once the database is created, you'll see the Firestore dashboard
2. At the top, you'll see tabs: **Data**, **Indexes**, **Rules**, **Usage**
3. Click on the **"Rules"** tab

4. You'll see the current security rules in a code editor

5. **Replace the entire rules** with this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Click the **"Publish"** button at the top right

7. You should see a confirmation message: **"Rules published successfully"**

**What these rules do:**
- Only authenticated users can access the database
- Users can only read/write documents in the `users` collection
- Users can only access documents with their own user ID as the document ID
- This ensures each user can only access their own data

### Step 2.5: Verify Database is Ready

1. Go back to the **"Data"** tab
2. You should see an empty database (no collections yet)
3. Collections will be created automatically when users sign in
4. ✅ **Success!** Firestore is now set up and secured

---

## Part 3: Configure OAuth Consent Screen (If Needed)

**Note:** You might need to do this if Google Sign-In requires OAuth consent screen configuration.

### Step 3.1: Navigate to Google Cloud Console

1. If you see errors about OAuth consent screen when enabling Google Sign-In, you need to configure it
2. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
3. Click **"Project settings"**
4. Scroll down to find **"Your apps"** section
5. Look for a link to **"Google Cloud Console"** or click on **"Project ID"** link
6. This will open Google Cloud Console in a new tab

### Step 3.2: Configure OAuth Consent Screen

1. In Google Cloud Console, look at the left sidebar
2. Go to **"APIs & Services"** → **"OAuth consent screen"**
3. Choose **"External"** (unless you're using Google Workspace, then choose "Internal")
4. Click **"Create"**

### Step 3.3: Fill in App Information

1. **App name:** Enter "Pokewalker Challenge Tracker"
2. **User support email:** Select your email from the dropdown
3. **App logo:** (Optional) You can skip this for now
4. **App domain:** (Optional) Skip for now
5. **Authorized domains:** Firebase domains are automatically added
6. **Developer contact information:** Enter your email
7. Click **"Save and Continue"**

### Step 3.4: Configure Scopes

1. You'll see a screen about scopes
2. Firebase handles this automatically, so click **"Save and Continue"**

### Step 3.5: Add Test Users (If in Testing Mode)

1. If your app is in "Testing" mode, add test users
2. Click **"Add users"**
3. Enter your email address (the one you'll use to sign in)
4. Click **"Add"**
5. Click **"Save and Continue"**

### Step 3.6: Review and Complete

1. Review the summary
2. Click **"Back to Dashboard"**
3. Go back to Firebase Console and try enabling Google Sign-In again

---

## Part 4: Verify Your Setup

### Checklist

Run through this checklist to verify everything is set up correctly:

- [ ] **Authentication enabled:**
  - Go to Authentication → Sign-in method
  - Google shows as "Enabled"

- [ ] **Firestore database created:**
  - Go to Firestore Database → Data tab
  - Database exists (even if empty)

- [ ] **Security rules configured:**
  - Go to Firestore Database → Rules tab
  - Rules are published with the code from Step 2.4

- [ ] **No errors in console:**
  - Check browser console (F12)
  - No Firebase-related errors

### Test the Connection

1. Start your app:
   ```bash
   npm run dev
   ```

2. Open browser console (F12 → Console tab)

3. You should see no Firebase errors

4. If you see errors, check:
   - Firebase config is correct in `firebase-config.ts`
   - Internet connection is working
   - Firebase project ID matches your project

---

## Common Issues & Solutions

### Issue: "OAuth consent screen" error when enabling Google Sign-In

**Solution:** Complete Part 3 above to configure OAuth consent screen.

### Issue: "Permission denied" when accessing Firestore

**Solution:** 
- Check that security rules are published (Part 2.4)
- Make sure you're signed in to Firebase Auth first
- Verify rules allow access for authenticated users

### Issue: Database location can't be changed

**Solution:** This is normal - location is permanent but won't significantly affect performance for most apps.

### Issue: Rules won't publish

**Solution:**
- Check for syntax errors in the rules code
- Make sure you're using `rules_version = '2';` at the top
- Try copying the rules code again from Step 2.4

### Issue: Can't see Authentication in sidebar

**Solution:**
- Make sure you're using the Blaze (pay-as-you-go) plan, OR
- Check that you're in the correct Firebase project
- Try refreshing the page

---

## What's Next?

Once you've completed this setup:

1. ✅ **Google Authentication is enabled** - Users can sign in with Google
2. ✅ **Firestore Database is ready** - Data will be stored securely
3. ✅ **Security rules are configured** - Users can only access their own data

**Next steps:**
- Integrate Firebase into your App.tsx (see `INTEGRATION_EXAMPLE.tsx`)
- Add sign-in UI components to your app
- Test the authentication flow

---

## Visual Guide Reference

### Authentication Screen Locations:
```
Firebase Console
└── Authentication
    ├── Users (tab)
    ├── Sign-in method (tab) ← Click here
    │   └── Google ← Click this provider
    └── Templates (tab)
```

### Firestore Screen Locations:
```
Firebase Console
└── Firestore Database
    ├── Data (tab)
    ├── Indexes (tab)
    ├── Rules (tab) ← Click here to set rules
    └── Usage (tab)
```

---

## Need Help?

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Firebase project ID matches in `firebase-config.ts`
3. Make sure all steps were completed successfully
4. Check Firebase Console for any warning messages

---

**Setup Complete! 🎉**

Your Firebase project is now ready for authentication and data storage!


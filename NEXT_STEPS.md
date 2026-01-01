# Next Steps - Firebase Integration Checklist

## ✅ Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pokewalker-tracker**
3. Click **Authentication** in the left sidebar
4. Click **Get started** (if you haven't set it up yet)
5. Go to the **Sign-in method** tab
6. Click on **Google**
7. Toggle **Enable** to ON
8. Enter your **Project support email** (your email)
9. Click **Save**

✅ **Done when:** Google provider shows as "Enabled" in Firebase Console

---

## ✅ Step 2: Create Firestore Database

1. In Firebase Console, click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for now - you can change rules later)
4. Select a **location** closest to your users (e.g., `us-central`, `europe-west`)
5. Click **Enable**

### Set Up Security Rules:

1. Go to **Firestore Database** > **Rules** tab
2. Replace the rules with:

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

3. Click **Publish**

✅ **Done when:** Firestore database is created and rules are published

---

## ✅ Step 3: Test Basic Connection

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser console (F12)
3. Look for any Firebase errors
4. You should see Firebase initialized successfully

✅ **Done when:** No errors in console

---

## ✅ Step 4: Integrate Firebase into App.tsx

This is the main integration step. You need to:

1. **Add Firebase hooks** to App.tsx
2. **Load data from Firestore** when user is signed in
3. **Sync data to Firestore** automatically
4. **Add sign-in UI** components

See `INTEGRATION_EXAMPLE.tsx` for reference, or I can help you integrate it now!

✅ **Done when:** App uses Firebase data when signed in, localStorage when not

---

## ✅ Step 5: Add Sign-In Button to UI

Add the Google Sign-In button to your landing page or header:

**Option A: Landing Page (Recommended)**
- Add `<GoogleSignIn />` to your LandingPage component
- Show it when user is not signed in

**Option B: Header**
- Add `<UserProfile />` when signed in
- Add `<GoogleSignIn />` when not signed in

✅ **Done when:** Sign-in button appears in UI

---

## ✅ Step 6: Test End-to-End

1. **Sign In:**
   - Click "Sign in with Google"
   - Complete Google sign-in flow
   - Should redirect back to app

2. **Check Firestore:**
   - Go to Firebase Console > Firestore Database
   - You should see a `users` collection
   - Your user document should appear

3. **Test Data Sync:**
   - Catch some Pokémon in your app
   - Wait 1-2 seconds
   - Check Firestore - data should appear in your user document

4. **Test Multi-Device:**
   - Open app in another browser/device
   - Sign in with same Google account
   - Your data should load automatically

✅ **Done when:** Everything works end-to-end!

---

## 🚀 Quick Start Commands

```bash
# Install dependencies (if not done)
npm install

# Start dev server
npm run dev

# Check for errors
npm run build
```

---

## 📝 Files to Check

- ✅ `firebase-config.ts` - Already configured with your credentials
- ✅ `index.tsx` - Already wrapped with AuthProvider
- ⏳ `App.tsx` - Needs Firebase integration (Step 4)
- ✅ `components/GoogleSignIn.tsx` - Ready to use
- ✅ `components/UserProfile.tsx` - Ready to use
- ✅ `lib/auth-context.tsx` - Ready to use
- ✅ `lib/firestore-sync.ts` - Ready to use

---

## 🆘 Need Help?

- See `FIREBASE_SETUP_GUIDE.md` for detailed instructions
- See `FIREBASE_QUICK_REFERENCE.md` for code snippets
- See `INTEGRATION_EXAMPLE.tsx` for integration patterns

---

## Current Status

- ✅ Firebase configuration: DONE
- ⏳ Google Sign-In enabled: TODO (Step 1)
- ⏳ Firestore database: TODO (Step 2)
- ⏳ App integration: TODO (Step 4)
- ⏳ UI integration: TODO (Step 5)
- ⏳ Testing: TODO (Step 6)


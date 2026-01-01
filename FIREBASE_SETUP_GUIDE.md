# Firebase Google Sign-In & Firestore Sync Setup Guide

This guide will walk you through setting up Google Sign-In with Firebase Authentication and Cloud Firestore for automatic profile data synchronization across devices.

## Prerequisites

- A Google account
- Node.js and npm installed
- A Firebase project (we'll create one)

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter a project name (e.g., "pokewalker-tracker")
4. Follow the setup wizard:
   - Enable Google Analytics (optional but recommended)
   - Accept terms and continue
5. Wait for the project to be created

---

## Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable** switch
4. Enter your **Project support email**
5. Click **Save**

---

## Step 3: Create a Web App

1. In Firebase Console, click the **Web icon** (`</>`) or go to **Project Settings** > **General**
2. Register your app:
   - App nickname: "Pokewalker Web App"
   - Firebase Hosting: Not needed for now (optional)
3. Click **Register app**
4. **Copy the Firebase configuration object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 4: Set Up Environment Variables

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id-here
```

**Important:** Replace the placeholder values with your actual Firebase config values from Step 3.

3. Add `.env` to your `.gitignore` file to keep your keys secure:

```gitignore
.env
.env.local
.env.*.local
```

---

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **Start in test mode** (for development) or **Start in production mode** (for production)
4. Select a location for your database (choose the closest to your users)
5. Click **Enable**

### Set Up Firestore Security Rules (Important!)

1. Go to **Firestore Database** > **Rules**
2. Update the rules to allow authenticated users to read/write their own data:

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

---

## Step 6: Install Dependencies

The Firebase package should already be installed. If not, run:

```bash
npm install firebase
```

---

## Step 7: Update Firebase Configuration

1. Open `firebase-config.ts`
2. The file already uses environment variables, so make sure your `.env` file is set up correctly (from Step 4)
3. The configuration will automatically use your environment variables

---

## Step 8: Configure OAuth Consent Screen (for Production)

If you plan to use this in production:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** > **OAuth consent screen**
4. Fill in the required information:
   - User type: External (or Internal if using Google Workspace)
   - App name: "Pokewalker Challenge Tracker"
   - User support email: Your email
   - Developer contact: Your email
5. Add scopes (Firebase will request basic profile info automatically)
6. Add test users if in testing mode

---

## Step 9: Integrate Authentication in Your App

The authentication is already set up! Here's how to use it:

### Basic Usage Example

```tsx
import { useAuth } from './lib/auth-context';
import { GoogleSignIn } from './components/GoogleSignIn';

function MyComponent() {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <GoogleSignIn variant="large" />;
  }

  return (
    <div>
      <p>Welcome, {userProfile?.displayName}!</p>
      {/* Your app content */}
    </div>
  );
}
```

---

## Step 10: Sync Data with Firestore

### Automatic Sync (Recommended)

The `useFirestoreSync` hook automatically syncs your data to Firestore:

```tsx
import { useFirestoreSync } from './lib/firestore-sync';

function Tracker() {
  const [caughtData, setCaughtData] = useState({});
  const [isCompletionist, setIsCompletionist] = useState(false);
  const [autoCollapsePostNational, setAutoCollapsePostNational] = useState(true);

  // This automatically syncs to Firestore whenever data changes
  const { isSyncing } = useFirestoreSync(
    caughtData,
    isCompletionist,
    autoCollapsePostNational
  );

  return (
    <div>
      {isSyncing && <p>Syncing...</p>}
      {/* Your tracker UI */}
    </div>
  );
}
```

### Load Data from Firestore on Login

The `useLoadProfileFromFirestore` hook helps you load saved data:

```tsx
import { useLoadProfileFromFirestore } from './lib/firestore-sync';

function App() {
  const { userProfile, loading } = useAuth();
  const { getInitialCaughtData, getInitialIsCompletionist } = useLoadProfileFromFirestore();

  // Initialize state from Firestore when user logs in
  const [caughtData, setCaughtData] = useState(() => {
    return getInitialCaughtData();
  });

  const [isCompletionist, setIsCompletionist] = useState(() => {
    return getInitialIsCompletionist();
  });

  // ... rest of your app
}
```

---

## Step 11: Add Sign-In UI to Your App

### Option 1: Add to Landing Page

Update your `LandingPage` component:

```tsx
import { GoogleSignIn } from './components/GoogleSignIn';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const { user } = useAuth();

  return (
    <div>
      {/* Your existing content */}
      
      {!user && (
        <div className="mt-8">
          <p className="text-sm text-slate-400 mb-4">
            Sign in to sync your progress across devices
          </p>
          <GoogleSignIn variant="large" onSuccess={onStart} />
        </div>
      )}
    </div>
  );
};
```

### Option 2: Add User Profile to Header

Update your header in `App.tsx`:

```tsx
import { UserProfile } from './components/UserProfile';
import { useAuth } from './lib/auth-context';

function Header() {
  const { user } = useAuth();

  return (
    <header>
      {/* Your existing header content */}
      {user ? (
        <UserProfile />
      ) : (
        <GoogleSignIn variant="minimal" />
      )}
    </header>
  );
}
```

---

## Testing the Setup

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test Sign-In:**
   - Click the "Sign in with Google" button
   - Complete the Google sign-in flow
   - Verify you're redirected back to your app

3. **Test Data Sync:**
   - Catch some Pokémon or change settings
   - Open the app in another browser/device
   - Sign in with the same Google account
   - Verify your data syncs across devices

4. **Check Firestore:**
   - Go to Firebase Console > Firestore Database
   - You should see a `users` collection
   - Each user document contains their profile data

---

## Troubleshooting

### "Firebase: Error (auth/popup-closed-by-user)"
- User closed the sign-in popup. This is normal behavior.

### "Firebase: Error (auth/popup-blocked)"
- Browser blocked the popup. Ask users to allow popups for your site.

### "Missing or insufficient permissions"
- Check your Firestore security rules
- Ensure the user is authenticated
- Verify the rule matches the user's UID

### Environment variables not loading
- Make sure `.env` file is in the project root
- Restart the dev server after creating/updating `.env`
- Ensure variable names start with `VITE_`

### Data not syncing
- Check browser console for errors
- Verify Firestore rules allow write access
- Ensure user is authenticated (`user` is not null)

---

## Security Best Practices

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use environment variables** - Never hardcode API keys
3. **Set up proper Firestore rules** - Restrict access to user's own data
4. **Enable Firebase App Check** (optional) - For additional security
5. **Use production mode rules** in Firestore for deployed apps

---

## Next Steps

- [ ] Set up Firebase Hosting for deployment
- [ ] Configure custom domain (optional)
- [ ] Set up Firebase Analytics (optional)
- [ ] Implement offline persistence (optional)
- [ ] Add error boundaries for better error handling
- [ ] Set up backup strategy for Firestore data

---

## File Structure

```
your-project/
├── firebase-config.ts          # Firebase initialization
├── lib/
│   ├── auth-context.tsx        # Auth context and provider
│   └── firestore-sync.ts       # Firestore sync hooks
├── components/
│   ├── GoogleSignIn.tsx        # Sign-in button component
│   └── UserProfile.tsx         # User profile display component
├── .env                        # Environment variables (don't commit!)
└── FIREBASE_SETUP_GUIDE.md    # This file
```

---

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review browser console for JavaScript errors
3. Verify all environment variables are set correctly
4. Check Firestore security rules
5. Ensure Google Sign-In is enabled in Firebase Console

---

Happy coding! 🚀


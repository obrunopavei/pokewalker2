# Firebase Quick Reference - Code Snippets

Quick code snippets for common Firebase Authentication and Firestore operations.

---

## Basic Authentication Usage

### Check if user is signed in

```tsx
import { useAuth } from './lib/auth-context';

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

### Get user profile data

```tsx
import { useAuth } from './lib/auth-context';

function MyComponent() {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  return (
    <div>
      <p>Name: {userProfile.displayName}</p>
      <p>Email: {userProfile.email}</p>
      <p>Photo: <img src={userProfile.photoURL} alt="Profile" /></p>
    </div>
  );
}
```

### Sign out

```tsx
import { useAuth } from './lib/auth-context';

function LogoutButton() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? 'Signing out...' : 'Sign out'}
    </button>
  );
}
```

---

## Automatic Data Synchronization

### Sync app state to Firestore automatically

```tsx
import { useFirestoreSync } from './lib/firestore-sync';

function MyTracker() {
  const [caughtData, setCaughtData] = useState({});
  const [settings, setSettings] = useState({});

  // Automatically syncs when caughtData or settings change
  const { isSyncing } = useFirestoreSync(
    caughtData,
    settings.isCompletionist,
    settings.autoCollapse
  );

  return (
    <div>
      {isSyncing && <div>Syncing to cloud...</div>}
      {/* Your UI */}
    </div>
  );
}
```

---

## Manual Profile Updates

### Update user profile manually

```tsx
import { useAuth } from './lib/auth-context';

function UpdateProfileButton() {
  const { updateProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({
        caughtData: { /* your data */ },
        isCompletionist: true,
      });
      console.log('Profile updated!');
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={isUpdating}>
      {isUpdating ? 'Updating...' : 'Update Profile'}
    </button>
  );
}
```

---

## Loading Initial Data from Firestore

### Initialize state from Firestore profile

```tsx
import { useAuth } from './lib/auth-context';
import { useLoadProfileFromFirestore } from './lib/firestore-sync';

function App() {
  const { userProfile } = useAuth();
  const { getInitialCaughtData, getInitialIsCompletionist } = useLoadProfileFromFirestore();

  // Initialize from Firestore if user is logged in, otherwise from localStorage
  const [caughtData, setCaughtData] = useState(() => {
    if (userProfile) {
      return getInitialCaughtData();
    }
    // Fallback to localStorage
    const saved = localStorage.getItem('pokewalker-caught');
    return saved ? JSON.parse(saved) : {};
  });

  const [isCompletionist, setIsCompletionist] = useState(() => {
    if (userProfile) {
      return getInitialIsCompletionist();
    }
    const saved = localStorage.getItem('pokewalker-mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Your component logic...
}
```

---

## Google Sign-In Button Variants

### Large button (for landing pages)

```tsx
import { GoogleSignIn } from './components/GoogleSignIn';

<GoogleSignIn 
  variant="large" 
  onSuccess={() => console.log('Signed in!')} 
/>
```

### Default button (for headers/navbars)

```tsx
<GoogleSignIn 
  variant="default"
  onSuccess={() => console.log('Signed in!')} 
/>
```

### Minimal button (compact design)

```tsx
<GoogleSignIn 
  variant="minimal"
  onSuccess={() => console.log('Signed in!')} 
/>
```

---

## User Profile Display Component

### Show user profile in header

```tsx
import { UserProfile } from './components/UserProfile';

function Header() {
  const { user } = useAuth();

  return (
    <header>
      {/* Other header content */}
      {user && <UserProfile />}
    </header>
  );
}
```

---

## Conditional Rendering Based on Auth State

### Show different UI for authenticated vs unauthenticated users

```tsx
import { useAuth } from './lib/auth-context';
import { GoogleSignIn } from './components/GoogleSignIn';

function ProtectedContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <h2>Please sign in</h2>
        <GoogleSignIn />
      </div>
    );
  }

  return (
    <div>
      <h2>Welcome back, {user.displayName}!</h2>
      {/* Protected content */}
    </div>
  );
}
```

---

## Listening to Profile Changes

### React to profile updates from other devices

```tsx
import { useAuth } from './lib/auth-context';
import { useEffect } from 'react';

function MyComponent() {
  const { userProfile } = useAuth();
  const [caughtData, setCaughtData] = useState({});

  // Update local state when Firestore profile changes
  useEffect(() => {
    if (userProfile?.caughtData) {
      setCaughtData(userProfile.caughtData);
    }
  }, [userProfile?.caughtData]);

  return (
    <div>
      {/* Your UI using caughtData */}
    </div>
  );
}
```

---

## Error Handling

### Handle authentication errors

```tsx
import { useAuth } from './lib/auth-context';
import { GoogleSignIn } from './components/GoogleSignIn';

function SignInPage() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Please allow popups for this site');
      } else {
        setError('Sign-in failed. Please try again.');
      }
    }
  };

  return (
    <div>
      <GoogleSignIn onSuccess={handleSignIn} />
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

---

## Firestore Rules Reference

### Basic rules for user profiles

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

---

## Environment Variables

### Required environment variables

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

---

## Common Patterns

### Pattern 1: Sync on change with debounce

The `useFirestoreSync` hook already includes debouncing (1 second delay), so you don't need to add it manually.

### Pattern 2: Load from Firestore on mount, sync on change

```tsx
const [data, setData] = useState(() => {
  // Initialize from Firestore if available
  return userProfile?.caughtData || {};
});

// Auto-sync when data changes
useFirestoreSync(data, isCompletionist, autoCollapse);
```

### Pattern 3: Fallback to localStorage when offline

```tsx
const [data, setData] = useState(() => {
  // Try Firestore first
  if (userProfile?.caughtData) {
    return userProfile.caughtData;
  }
  // Fallback to localStorage
  const saved = localStorage.getItem('my-data');
  return saved ? JSON.parse(saved) : {};
});
```

---

## Testing Checklist

- [ ] User can sign in with Google
- [ ] User profile appears after sign-in
- [ ] Data syncs to Firestore when changed
- [ ] Data loads from Firestore on sign-in
- [ ] Data syncs across multiple devices
- [ ] User can sign out
- [ ] LocalStorage fallback works when not signed in
- [ ] Error handling works for failed sign-in
- [ ] Loading states display correctly

---

For more details, see `FIREBASE_SETUP_GUIDE.md`


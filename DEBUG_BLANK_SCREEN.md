# Debug: Blank Screen After Sign-In

If you're seeing a blank screen after signing in, try these steps:

## Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for any error messages (they'll be in red)
4. Copy any error messages you see

## Step 2: Check Network Tab

1. In DevTools, go to **Network** tab
2. Try signing in again
3. Look for failed requests (they'll be red)
4. Check if Firestore requests are failing

## Step 3: Common Issues

### Issue 1: Firestore Permission Error
**Error:** `Permission denied` or `Missing or insufficient permissions`

**Solution:**
1. Go to Firebase Console → Firestore Database → Rules
2. Make sure your rules are:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. Click **Publish**

### Issue 2: Firestore Not Created
**Error:** `Firestore database not found` or similar

**Solution:**
1. Go to Firebase Console → Firestore Database
2. Make sure the database exists
3. If not, create it (Start in test mode for development)

### Issue 3: Loading State Stuck
**Symptoms:** Screen shows "Loading..." forever

**Solution:**
1. Check browser console for errors
2. The app should show a loading spinner, not a blank screen
3. If it's blank (not loading spinner), there might be a React error

### Issue 4: React Error
**Error:** Red error screen or error in console

**Solution:**
1. Check the exact error message in console
2. Look for component errors
3. Check if all imports are correct

## Quick Fixes

1. **Hard refresh:** `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
2. **Clear cache:** `Ctrl + Shift + Delete`
3. **Check console:** Look for error messages
4. **Verify Firestore:** Make sure database and rules are set up

## Still Not Working?

Please share:
1. Any error messages from the browser console
2. What you see on screen (blank? loading spinner? error message?)
3. Any failed network requests from the Network tab

This will help identify the exact issue!


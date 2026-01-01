# Fix: Firebase Unauthorized Domain Error

## Problem
You're seeing: `Firebase: Error (auth/unauthorized-domain)`

This happens because your local development domain (`localhost`) is not authorized in Firebase Console.

## Solution: Add localhost to Authorized Domains

### Step-by-Step Fix:

1. **Go to Firebase Console**
   - Open [Firebase Console](https://console.firebase.google.com/)
   - Select your project: **pokewalker-tracker**

2. **Navigate to Authentication Settings**
   - Click **"Authentication"** in the left sidebar
   - Click on the **"Settings"** tab (at the top, next to "Sign-in method")
   - Scroll down to find **"Authorized domains"** section

3. **Add localhost**
   - You'll see a list of authorized domains (usually includes your Firebase project domain)
   - Click **"Add domain"** button
   - Enter: `localhost`
   - Click **"Add"**

4. **Also add 127.0.0.1 (optional but recommended)**
   - Click **"Add domain"** again
   - Enter: `127.0.0.1`
   - Click **"Add"**

5. **For Vite dev server, you might also need:**
   - `localhost:3000` (or whatever port your dev server uses)
   - Check your terminal/browser URL to see the exact port

### Common Authorized Domains for Development:

- `localhost`
- `127.0.0.1`
- `localhost:5173` (Vite default port)
- `localhost:3000` (common dev port)

### After Adding Domains:

1. **Wait a few seconds** - changes can take a moment to propagate
2. **Refresh your browser** where the app is running
3. **Try signing in again** - the error should be gone!

---

## Quick Checklist

- [ ] Firebase Console → Authentication → Settings
- [ ] Scroll to "Authorized domains"
- [ ] Add `localhost`
- [ ] Add `127.0.0.1`
- [ ] Add your dev server port (e.g., `localhost:5173`)
- [ ] Refresh your app
- [ ] Try signing in again

---

## Note for Production

When you deploy your app, you'll need to add your production domain (e.g., `yourdomain.com`) to the authorized domains list as well.

---

That's it! This should fix the error. 🎉


# Troubleshooting: Unauthorized Domain Error (Still Not Working)

You've added `localhost` and `127.0.0.1` but it's still not working. Let's troubleshoot:

## Step 1: Check Your Exact URL

1. Look at your browser's address bar
2. What URL are you using?
   - `http://localhost:5173`?
   - `http://localhost:3000`?
   - `http://127.0.0.1:5173`?
   - Something else?

3. **Add the FULL URL with port to Firebase:**
   - If you're using `localhost:5173`, add: `localhost:5173`
   - If you're using `localhost:3000`, add: `localhost:3000`
   - If you're using `127.0.0.1:5173`, add: `127.0.0.1:5173`

## Step 2: Add Domain with Port Number

In Firebase Console → Authentication → Settings → Authorized domains:

1. Click **"Adicionar domínio"** (Add domain)
2. Enter your EXACT URL format:
   - If your browser shows `localhost:5173`, add: `localhost:5173`
   - Don't forget the port number!

## Step 3: Clear Browser Cache & Hard Refresh

1. **Hard refresh your browser:**
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. **Or clear browser cache:**
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

## Step 4: Wait a Few Minutes

Sometimes Firebase takes 1-2 minutes to propagate domain changes. Wait and try again.

## Step 5: Check Browser Console for Exact Error

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try signing in again
4. Look for the exact error message
5. It might show the exact domain that's being rejected

## Step 6: Try Different Domain Format

Try adding ALL of these (one by one):
- `localhost`
- `127.0.0.1`
- `localhost:5173` (or your port)
- `127.0.0.1:5173` (or your port)
- `http://localhost` (sometimes needed)
- `http://localhost:5173`

## Step 7: Restart Dev Server

1. Stop your dev server (Ctrl+C)
2. Start it again: `npm run dev`
3. Try signing in again

## Step 8: Check Firebase Console Again

1. Go back to Firebase Console
2. Authentication → Settings → Authorized domains
3. Make sure your domain is actually listed there
4. Sometimes the UI doesn't update immediately - refresh the page

## Step 9: Try Incognito/Private Window

1. Open an incognito/private browser window
2. Go to your app URL
3. Try signing in
4. This eliminates cache/cookie issues

## Step 10: Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Try signing in
4. Look for failed requests
5. Check the error details in the failed request

---

## Most Common Solutions

### Solution 1: Add Port Number
**Most likely issue!** If your URL is `localhost:5173`, you need to add `localhost:5173` (with port), not just `localhost`.

### Solution 2: Wait 2-3 Minutes
Firebase changes can take a few minutes to propagate globally.

### Solution 3: Hard Refresh
Clear your browser cache with `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac).

### Solution 4: Check Exact URL Format
Make sure the domain you add matches EXACTLY what's in your browser address bar.

---

## Still Not Working?

If none of these work, please share:
1. The exact URL in your browser address bar
2. The exact error message from browser console
3. What domains you've added to Firebase

This will help identify the specific issue!


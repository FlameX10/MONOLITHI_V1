# Google Maps API Key Setup Guide

## 🔑 How to Get Your Google Maps API Key

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create a New Project
1. Click on the project dropdown (top left)
2. Click "NEW PROJECT"
3. Enter a name (e.g., "Mine Tracker")
4. Click "CREATE"
5. Wait for the project to be created and selected

### Step 3: Enable Required APIs
1. In the search bar at the top, type "Maps JavaScript API"
2. Click on "Maps JavaScript API" in the results
3. Click the "ENABLE" button
4. Wait for it to be enabled

### Step 4: Create API Key
1. Click on "Credentials" in the left sidebar
2. Click "CREATE CREDENTIALS" button
3. Select "API Key"
4. Your API key will appear in a popup
5. **Copy the API key** (you'll see it in a yellow/orange box)
6. Click "CLOSE"

### Step 5: (Optional but Recommended) Restrict Your API Key

For security, restrict your API key to only Maps JavaScript API:

1. Find your API key in the Credentials list (search for it)
2. Click on it to edit
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your frontend URL(s) - for local development use: `http://localhost:*/*`
   - For production, use your deployed domain
4. Under "API restrictions":
   - Select "Restrict key"
   - Check "Maps JavaScript API"
   - Uncheck other APIs
5. Click "SAVE"

## 📝 Add API Key to Frontend

### 1. Locate the .env.local file
```
frontend/.env.local
```

### 2. Edit the file
Open it in VS Code and add your API key:

**Before:**
```
VITE_GOOGLE_MAPS_API_KEY=
```

**After:**
```
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with your actual API key from Google Cloud.

**Example:**
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC2_fake_key_example_1234567890abc
```

### 3. Save the file
The changes will be automatically picked up when you run the dev server.

## ✅ Verify Setup

1. Start the dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open http://localhost:5173 in your browser

3. You should see:
   - The app header
   - A map loading animation
   - Mine markers appearing on the map
   - Search controls on the left
   - Mine details panel on the right

4. If the map doesn't load:
   - Open browser Developer Tools (F12)
   - Check Console tab for error messages
   - Verify API key is correct in `.env.local`
   - Make sure Google Maps API is enabled in Google Cloud

## 🔒 Security Best Practices

### For Development (Local Machine)
```
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```
- Keep in `.env.local` (not committed to git)
- Local testing only
- Any restrictions are optional

### For Production (Deployed Website)
1. **Never commit API key to git:**
   - Add `.env.local` to `.gitignore` ✓

2. **Use environment variables:**
   - Set API key in your hosting platform's environment variables
   - (Vercel, Netlify, AWS, etc. all support this)

3. **Restrict API key:**
   - Go to Google Cloud Console
   - Edit API key
   - Set application restrictions to your domain only
   - Set API restrictions to Maps JavaScript API only

4. **Monitor usage:**
   - Go to Credentials page
   - Check "Usage" tab to monitor API calls
   - Set up billing alerts if needed

## 💰 Costs & Billing

Google Maps APIs are **free up to a certain usage level**:
- Each request costs a small amount (typically $0.005-0.007 per 1000 requests)
- First 1000 requests per month may be free (check current pricing)
- Must have billing enabled on Google Cloud account

**For this project:**
- Initial map load: 1 request
- Each marker interaction: minimal impact
- Should stay free for reasonable usage

Visit [Google Maps Pricing](https://cloud.google.com/maps-platform/pricing) for current rates.

## 🐛 Troubleshooting

### "Google is not defined" Error
- API key not set correctly
- Google Maps API not enabled in Google Cloud
- Check browser console for exact error

### Map shows blank/gray
- API key is invalid or restricted
- Maps JavaScript API not enabled
- Browser cache issue (try Ctrl+F5 hard refresh)

### "This API project is not authorized"
- Go back to Google Cloud Console
- Verify Maps JavaScript API is ENABLED
- Wait 5-10 minutes for changes to propagate

### Markers not showing
- API key valid, but check markers JSON data
- Open browser console to see any errors
- Verify mines.json is loaded correctly

### "Billing required"
- Google has quota limits on free tier
- Enable billing in Google Cloud Console
- You'll still have free monthly quota

## 📞 Quick Reference

| Task | Link |
|------|------|
| Create Google Cloud Project | https://console.cloud.google.com/ |
| Enable APIs | Search "Maps JavaScript API" in console |
| Get API Key | Credentials → Create Credentials → API Key |
| Check Usage | Credentials → Usage section |
| Set Restrictions | Credentials → Edit Key → Add restrictions |

## ✨ You're All Set!

Once your API key is in `.env.local`, you can:
1. Run `npm run dev`
2. See all mines on the map
3. Search and filter mines
4. Click markers to view details
5. View mines in full Google Maps

Happy exploring! 🗺️

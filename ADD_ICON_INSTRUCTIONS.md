# How to Add Your App Icon

## Once You Have the Icon File

1. **Save the icon as:** `icon.png` (1024x1024)

2. **Replace the existing placeholder:**
   ```bash
   cd /Users/pmcodesprint/.openclaw/workspace/DrinkUp
   # Backup old icon
   mv assets/icon.png assets/icon-old.png
   # Copy your new icon
   cp ~/Downloads/icon.png assets/icon.png
   ```

3. **Verify the file:**
   ```bash
   file assets/icon.png
   # Should show: PNG image data, 1024 x 1024
   ```

4. **Generate all required sizes:**
   ```bash
   npx expo prebuild --clean
   ```

5. **Test in app:**
   ```bash
   npm start
   # Launch in simulator - check home screen icon
   ```

---

## Alternative: Use Online Tool

If AI generation isn't working, use https://appicon.co/:

1. Upload your 1024x1024 PNG
2. Click "Generate"
3. Download the .zip
4. Extract and replace files in `/assets/`

---

## What Happens Next

The icon will appear:
- On iPhone home screen after install
- In App Store listing
- In Settings
- In notifications
- In TestFlight

---

## Temporary Solution (If You Need to Ship NOW)

Keep the current Expo icon for TestFlight beta testing, update it before App Store submission. Beta testers don't care about icons.

---

**After adding icon, run:** `npm start` and check if it appears correctly.

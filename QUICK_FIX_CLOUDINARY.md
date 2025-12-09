# Quick Fix: Cloudinary Upload Not Working

## Problem
The upload button in Admin → Settings → Add New Banner does nothing when clicked.

## Root Cause
Your `.env` file has placeholder Cloudinary credentials instead of real ones:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"  ❌ WRONG
```

## Solution (5 Minutes)

### Step 1: Get Cloudinary Account (2 minutes)
1. Go to: https://cloudinary.com/users/register_free
2. Sign up with your email
3. You'll be redirected to your Dashboard

### Step 2: Copy Your Cloud Name (30 seconds)
On your Dashboard, at the top you'll see:

```
Product Environment Credentials
Cloud name: dxxxxxxxxxxxxx  ← COPY THIS
API Key: 123456789012345
API Secret: [Click to reveal]
```

**Copy ONLY the Cloud Name** (starts with 'd' usually)

### Step 3: Update .env File (1 minute)
1. Open your `.env` file in the project root
2. Find line 11 that says:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
   ```
3. Replace `your-cloud-name` with your actual Cloud Name:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dxxxxxxxxxxxxx"
   ```
4. Save the file

### Step 4: Create Upload Preset (1.5 minutes)
1. In Cloudinary Dashboard, click the **gear icon** (top right) → Settings
2. Click the **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Fill in:
   - **Preset name**: `sudhakant_sarees` (exactly this, no spaces)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: `sarees/homepage`
   - Leave other settings as default
6. Click **Save**

### Step 5: Restart Dev Server (30 seconds)
1. Go to your terminal where `npm run dev` is running
2. Press `Ctrl+C` to stop the server
3. Run `npm run dev` again
4. Wait for it to start

### Step 6: Test Upload ✅
1. Go to: http://localhost:3000/admin/settings
2. Click **Add New Banner**
3. Click **Upload Image**
4. The Cloudinary upload widget should now open! 🎉
5. Upload an image and it should work

---

## Still Not Working?

### Check Browser Console
1. Press `F12` to open DevTools
2. Click the **Console** tab
3. Try clicking "Upload Image" again
4. Look for any error messages in red
5. Share the error message if you need help

### Common Errors

**"Upload preset not found"**
- The preset name must be EXACTLY `sudhakant_sarees` (no capital letters, no spaces)
- Make sure you clicked **Save** after creating the preset
- Check that **Signing Mode** is set to **Unsigned**

**"Invalid cloud name"**
- Double-check you copied the Cloud Name correctly from Cloudinary Dashboard
- Make sure there are NO extra spaces before or after the cloud name in .env
- The Cloud Name should NOT include quotes inside quotes (wrong: `"\"dxxxxx\""`)

**Widget still doesn't open**
- Make sure you restarted the dev server AFTER updating .env
- Clear your browser cache (Ctrl+Shift+Delete)
- Try in an incognito window

---

## What You'll Be Able to Do After This

1. ✅ Upload homepage banner images from Admin → Settings
2. ✅ Manage multiple banners for the hero slider
3. ✅ Upload/replace banner images without touching code
4. ✅ Add product images from Admin → Products

---

## Next Steps (Optional)

If you also want to upload **product images**, you need to create a second upload preset:

1. Go to Cloudinary → Settings → Upload → Upload presets
2. Click **Add upload preset**
3. Fill in:
   - **Preset name**: `product_images`
   - **Signing Mode**: **Unsigned**
   - **Folder**: `sarees/products`
4. Click **Save**

Now you can upload product images too!

---

**Need more details?** Check `CLOUDINARY_SETUP.md` for the full guide.

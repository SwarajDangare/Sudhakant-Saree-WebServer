# Cloudinary Setup Guide

This guide will help you set up Cloudinary for uploading images (product images, homepage banners, etc.).

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up for a free account
3. After signing up, you'll be taken to your Dashboard

## Step 2: Get Your Credentials

On your Cloudinary Dashboard (top of the page), you'll see:
- **Cloud Name** (e.g., `dxxxxx`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (click "Reveal" to see it)

**Important:** Keep these credentials secure and never commit them to Git!

## Step 3: Create Upload Presets

You need to create TWO upload presets for different purposes:

### Preset 1: Homepage Banners (sudhakant_sarees)

1. In your Cloudinary Dashboard, go to **Settings** (gear icon in top right)
2. Click on the **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `sudhakant_sarees`
   - **Signing Mode**: Select **Unsigned** (important!)
   - **Folder**: `sarees/homepage` (keeps homepage images organized)
   - **Upload control**:
     - Max file size: 10 MB (recommended)
     - Allowed formats: jpg, png, webp, gif, mp4
   - **Transformation**:
     - Width: 1920
     - Height: 1080
     - Crop: Limit
     - Quality: Auto
     - Format: Auto
6. Click **Save**

### Preset 2: Product Images (product_images)

1. Click **Add upload preset** again
2. Configure the preset:
   - **Preset name**: `product_images`
   - **Signing Mode**: Select **Unsigned** (important!)
   - **Folder**: `sarees/products` (keeps product images organized)
   - **Upload control**:
     - Max file size: 10 MB (recommended)
     - Allowed formats: jpg, png, webp
   - **Transformation**:
     - Width: 1200
     - Height: 1600
     - Crop: Limit
     - Quality: Auto
     - Format: Auto
3. Click **Save**

## Step 4: Add Environment Variables

Create a `.env` file in your project root (if it doesn't exist):

```bash
# Copy from .env.example
cp .env.example .env
```

Then edit the `.env` file and add your Cloudinary credentials:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name-here"
CLOUDINARY_API_KEY="your-api-key-here"
CLOUDINARY_API_SECRET="your-api-secret-here"
```

**Important**:
- Replace `your-cloud-name-here` with your actual Cloud Name
- Replace `your-api-key-here` with your actual API Key
- Replace `your-api-secret-here` with your actual API Secret
- The `NEXT_PUBLIC_` prefix is required for the Cloud Name to be accessible in the browser

## Step 5: Restart Your Development Server

After adding the environment variables, restart your development server:

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

## Step 6: Test the Upload

### Test Homepage Banner Upload:
1. Go to Admin Panel → Settings
2. Click "Add New Banner"
3. Fill in the banner details (title, subtitle, etc.)
4. Click "Upload Image"
5. The Cloudinary upload widget should open
6. Select an image and click "Upload"
7. The image preview should appear
8. Click "Save Banner"
9. Go to your homepage to see the banner

### Test Product Image Upload:
1. Go to Admin Panel → Products → Add New Product
2. Fill in the product details
3. Click "Add Color" in the Color Variants section
4. Click "Upload Image"
5. The Cloudinary upload widget should open
6. Select an image and click "Upload"
7. The image should appear in your color variant

## Troubleshooting

### Upload widget doesn't open
- **Check environment variables**: Make sure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set in `.env` with your actual Cloud Name (not "your-cloud-name")
- **Restart dev server**: After adding environment variables, stop the server (Ctrl+C) and run `npm run dev` again
- **Check browser console**: Open DevTools (F12) and look for error messages

### "Upload preset not found" error
- **For homepage banners**: Verify the upload preset is named exactly `sudhakant_sarees`
- **For product images**: Verify the upload preset is named exactly `product_images`
- **Check signing mode**: Make sure BOTH presets are set to **Unsigned** mode
- **Verify preset is saved**: Go to Cloudinary Dashboard → Settings → Upload tab to confirm the presets exist

### Images not uploading
- **Check account status**: Make sure your Cloudinary account is active
- **File size**: Verify the file size is under 10 MB
- **File format**: Make sure the file format is jpg, png, webp (or gif/mp4 for banners)
- **Free tier limits**: Check if you've exceeded your monthly bandwidth or storage limits

### Image URLs not working
- **Verify upload**: Check that the images were successfully uploaded to Cloudinary Media Library
- **Check folder structure**: Images should be in `sarees/homepage` or `sarees/products` folders
- **HTTPS**: Make sure the image URLs use HTTPS (Cloudinary provides this by default)

### Upload button does nothing (current issue)
This is most likely because:
1. **Missing Cloud Name**: Your `.env` file has `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"` instead of your actual Cloud Name
2. **Server not restarted**: You need to restart the dev server after updating `.env`
3. **Missing upload preset**: The `sudhakant_sarees` preset doesn't exist in your Cloudinary account yet

**Solution:**
1. Follow Steps 1-3 above to get your credentials and create the upload presets
2. Update your `.env` file with the real Cloud Name
3. Restart your dev server with `npm run dev`

## Alternative: Use Signed Uploads (More Secure)

If you want more control and security, you can use signed uploads:

1. Create a server-side API endpoint for generating signatures
2. Modify the ColorManagement component to use signed uploads
3. This prevents unauthorized uploads to your Cloudinary account

Let me know if you need help setting up signed uploads!

## Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 monthly transformations

This should be sufficient for most small to medium-sized stores.

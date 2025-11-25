# Cloudinary Setup Guide

This guide will help you set up Cloudinary for uploading product images.

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up for a free account
3. After signing up, you'll be taken to your Dashboard

## Step 2: Get Your Credentials

On your Cloudinary Dashboard, you'll see:
- **Cloud Name** (e.g., `dxxxxx`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (click "Reveal" to see it)

## Step 3: Create an Upload Preset

An upload preset is required for the client-side upload widget to work.

1. In your Cloudinary Dashboard, go to **Settings** (gear icon in top right)
2. Click on the **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `product_images`
   - **Signing Mode**: Select **Unsigned** (important!)
   - **Folder**: `sarees/products` (optional, keeps images organized)
   - **Upload control**:
     - Max file size: 10 MB (recommended)
     - Allowed formats: jpg, png, webp
   - **Transformation**:
     - Width: 1200
     - Height: 1600
     - Crop: Limit
     - Quality: Auto
     - Format: Auto
6. Click **Save**

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

1. Go to Admin Panel → Products → Add New Product
2. Fill in the product details
3. Click "Add Color" in the Color Variants section
4. Click "Upload Image"
5. The Cloudinary upload widget should open
6. Select an image and click "Upload"
7. The image should appear in your color variant

## Troubleshooting

### Upload widget doesn't open
- Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set in `.env`
- Make sure you restarted the dev server after adding environment variables

### "Upload preset not found" error
- Verify the upload preset is named exactly `product_images`
- Make sure the preset is set to **Unsigned** mode

### Images not uploading
- Check that your Cloudinary account is active
- Verify the file size is under 10 MB
- Make sure the file format is jpg, png, or webp

### Image URLs not working
- Check that the images were successfully uploaded to Cloudinary
- Verify the folder structure in your Cloudinary Media Library

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

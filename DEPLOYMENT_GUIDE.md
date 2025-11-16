# Cloudflare Pages Deployment Guide

> **Complete guide to deploying Sudhakant Sarees to Cloudflare Pages**

## 📋 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with this repository pushed
- ✅ Cloudflare account (free tier works!)
- ✅ Neon PostgreSQL database set up
- ✅ Cloudinary account for images
- ✅ All environment variables ready

---

## 🚀 Step-by-Step Deployment

### **Step 1: Push Your Code to GitHub**

If you haven't already, push all changes to your GitHub repository:

```bash
# Make sure you're on the correct branch
git branch

# Push to GitHub
git push origin main
# OR if you're on a different branch:
git push origin <your-branch-name>
```

---

### **Step 2: Connect to Cloudflare Pages**

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Login to your account

2. **Navigate to Pages:**
   - Click "Workers & Pages" in the left sidebar
   - Click "Create application"
   - Click "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub:**
   - Click "Connect GitHub"
   - Authorize Cloudflare to access your GitHub
   - Select your repository: `Sudhakant-Saree-WebServer`

---

### **Step 3: Configure Build Settings**

On the "Set up builds and deployments" page, enter:

**Project name:** `sudhakant-sarees` (or your preferred name)

**Production branch:** `main` (or `claude/claude-md-mi1vu7ham53bu8le-016SFSges8yG9bHASZmZpRwx`)

**Build settings:**
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: (leave empty)
```

**Environment variables** (VERY IMPORTANT - click "Add variable" for each):

```
NODE_VERSION = 18

DATABASE_URL = postgresql://neondb_owner:npg_B2TxXYf1usSO@ep-muddy-boat-a1bzqwa5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_URL = https://sudhakant-sarees.pages.dev
(Replace with your actual Cloudflare Pages URL after first deployment)

NEXTAUTH_SECRET = sudhakant-sarees-secret-2024-prod-xyz789

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = dkzw9zsjq

CLOUDINARY_API_KEY = 198397728441678

CLOUDINARY_API_SECRET = 3KFHXqVJIHvFc9b2tXW85_FEIq4

```

**⚠️ IMPORTANT NOTES:**
- For `NEXTAUTH_URL`, first use `http://localhost:3000`, then update it after deployment
- All values must match exactly (no quotes needed)
- Click "Save and Deploy"

---

### **Step 4: Wait for Deployment**

Cloudflare will now:
1. Clone your repository
2. Install dependencies (`npm install`)
3. Build your Next.js app (`npm run build`)
4. Deploy to their global network

This usually takes **2-5 minutes**.

---

### **Step 5: Update NEXTAUTH_URL**

After the first deployment succeeds:

1. **Copy your deployment URL:**
   - You'll see something like: `https://sudhakant-sarees.pages.dev`
   - Or: `https://sudhakant-sarees-xyz.pages.dev`

2. **Update environment variable:**
   - Go to Settings → Environment variables
   - Find `NEXTAUTH_URL`
   - Click "Edit"
   - Change value to your actual URL (e.g., `https://sudhakant-sarees.pages.dev`)
   - Save

3. **Redeploy:**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Retry deployment"

---

### **Step 6: Test Your Deployment**

1. **Visit your admin panel:**
   ```
   https://your-site.pages.dev/admin/login
   ```

2. **Login with your credentials:**
   - Email: `swarajdangare2016@gmail.com`
   - Password: `admin123`

3. **Test the dashboard:**
   - You should see statistics from your database
   - Try navigating to different sections

4. **Visit the public site:**
   ```
   https://your-site.pages.dev
   ```

---

## 🔧 Troubleshooting

### **Build Fails with "MODULE_NOT_FOUND"**

**Solution:** Make sure all dependencies are in `package.json` dependencies (not devDependencies).

Check:
```bash
npm install --save drizzle-orm postgres bcryptjs next-auth
```

---

### **"Database connection failed"**

**Cause:** `DATABASE_URL` environment variable is incorrect.

**Solution:**
1. Go to Neon dashboard
2. Copy your connection string again
3. Update in Cloudflare Pages → Settings → Environment variables
4. Redeploy

---

### **"NextAuth configuration error"**

**Cause:** `NEXTAUTH_SECRET` or `NEXTAUTH_URL` is missing/incorrect.

**Solution:**
1. Verify both variables are set in Cloudflare
2. Make sure `NEXTAUTH_URL` matches your actual deployment URL
3. No trailing slashes in URLs

---

### **"Build exceeds timeout"**

**Cause:** Build taking too long (Cloudflare has a 20-min limit).

**Solution:**
- This shouldn't happen with our small project
- If it does, try: Settings → Functions → Increase timeout

---

### **"Cannot find module '@/db'"**

**Cause:** TypeScript path aliases not resolving.

**Solution:** This shouldn't happen, but if it does:
- Check `tsconfig.json` has correct `paths` configuration
- Rebuild: `npm run build`

---

## 🌐 Custom Domain (Optional)

Want to use your own domain instead of `.pages.dev`?

### **Option 1: Cloudflare Registered Domain**

If you registered your domain through Cloudflare:
1. Go to your Pages project
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain (e.g., `sudhakantsarees.com`)
5. Click "Activate domain"
6. Done! DNS is configured automatically.

### **Option 2: External Domain**

If your domain is registered elsewhere:
1. Go to your Pages project → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain
4. You'll get DNS records to add:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: sudhakant-sarees.pages.dev
   ```
5. Add these records to your domain registrar
6. Wait for DNS propagation (5 mins - 48 hours)

**Don't forget to update `NEXTAUTH_URL` to your custom domain!**

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Login to admin panel works
- [ ] Dashboard displays correct stats
- [ ] Public website loads
- [ ] Database connection successful
- [ ] Images load (if any added)
- [ ] All navigation links work
- [ ] Mobile responsive design works

---

## 🔄 Continuous Deployment

**Good news!** Cloudflare Pages auto-deploys on every push:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Cloudflare automatically:
# 1. Detects the push
# 2. Runs build
# 3. Deploys new version
# 4. Usually takes 2-3 minutes
```

---

## 🛡️ Security Best Practices

### **Production Checklist:**

1. **Change default password IMMEDIATELY:**
   - Login to admin panel
   - Go to your profile (when we build user management)
   - Change from `admin123` to strong password

2. **Secure environment variables:**
   - Never commit `.env` to Git
   - Keep `NEXTAUTH_SECRET` complex and random
   - Regenerate if compromised

3. **Database security:**
   - Use Neon's connection pooling (already configured)
   - Enable SSL (already in connection string)
   - Regularly backup data

4. **Monitor access:**
   - Check Cloudflare Analytics
   - Review admin login attempts
   - Set up alerts for suspicious activity

---

## 📈 Monitoring & Analytics

### **Cloudflare Analytics**

1. Go to your Pages project
2. Click "Analytics" tab
3. View:
   - Page views
   - Unique visitors
   - Geographic distribution
   - Performance metrics

### **Database Monitoring**

1. Go to Neon dashboard
2. Click your project
3. View "Metrics" tab:
   - Connection count
   - Query performance
   - Storage usage

---

## 🆘 Getting Help

**If deployment fails:**

1. **Check build logs:**
   - Cloudflare Pages → Deployments → Click failed deployment
   - Read error messages carefully

2. **Common fixes:**
   - Verify all environment variables are set
   - Check `package.json` for missing dependencies
   - Ensure Node version is 18
   - Try local build: `npm run build`

3. **Still stuck?**
   - Check Cloudflare Pages docs: https://developers.cloudflare.com/pages
   - Verify database connection in Neon
   - Test environment variables locally

---

## 🎉 Success!

Once deployed successfully:

✅ **Admin Panel:** `https://your-site.pages.dev/admin/login`
✅ **Public Site:** `https://your-site.pages.dev`
✅ **Auto-deploys** on every Git push
✅ **Free hosting** on Cloudflare's global network
✅ **SSL certificate** automatically provisioned

---

## 📝 Environment Variables Quick Reference

Copy this for quick setup:

```bash
# Node Version
NODE_VERSION=18

# Database
DATABASE_URL=postgresql://neondb_owner:npg_B2TxXYf1usSO@ep-muddy-boat-a1bzqwa5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Authentication
NEXTAUTH_URL=https://your-site.pages.dev
NEXTAUTH_SECRET=sudhakant-sarees-secret-2024-prod-xyz789

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dkzw9zsjq
CLOUDINARY_API_KEY=198397728441678
CLOUDINARY_API_SECRET=3KFHXqVJIHvFc9b2tXW85_FEIq4
```

**Remember to:**
- Replace `your-site.pages.dev` with your actual URL
- Never share these values publicly
- Keep `NEXTAUTH_SECRET` secure

---

**Happy Deploying! 🚀**

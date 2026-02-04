# 🚀 DEPLOYMENT GUIDE

**Deploy Pulse Learn to production in 10 minutes**

---

## 🎯 Deployment Options

### Option 1: Netlify (Recommended) ⭐
- **FREE** for personal projects
- Automatic SSL (HTTPS)
- Continuous deployment from Git
- Custom domain support
- **Best for:** Quick MVP launch

### Option 2: Firebase Hosting
- **FREE** tier available
- Integrated with Firebase backend
- Global CDN
- **Best for:** Firebase-centric apps

### Option 3: Vercel
- **FREE** for personal use
- Similar to Netlify
- Great performance
- **Best for:** Next.js apps (but works with React)

---

## 📦 Option 1: Deploy to Netlify (Easiest)

### Method A: Deploy from GitHub (Recommended)

#### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Pulse Learn v2.0"

# Create GitHub repo and push
# (Follow GitHub instructions)
git remote add origin https://github.com/yourusername/pulse-learn.git
git push -u origin main
```

#### Step 2: Connect to Netlify

1. Go to https://netlify.com/
2. Click **"Sign up"** (use GitHub account)
3. Click **"Add new site"** > **"Import an existing project"**
4. Click **"GitHub"**
5. Authorize Netlify
6. Select your `pulse-learn` repository
7. Configure build settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/build`
8. Click **"Advanced"** > **"New variable"**
9. Add ALL your `.env` variables:
   ```
   REACT_APP_FIREBASE_API_KEY=your_value
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_value
   REACT_APP_FIREBASE_PROJECT_ID=your_value
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_value
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_value
   REACT_APP_FIREBASE_APP_ID=your_value
   REACT_APP_STRIPE_PUBLISHABLE_KEY=your_value
   REACT_APP_ADMIN_EMAIL=your_value
   ```
10. Click **"Deploy site"**

**Wait 2-3 minutes... ✨**

Your site is LIVE! 🎉

**URL:** `https://random-name-123.netlify.app`

#### Step 3: Custom Domain (Optional)

1. In Netlify, click **"Domain settings"**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `pulselearn.co.za`)
4. Follow DNS instructions
5. SSL automatically enabled!

---

### Method B: Drag & Drop Deploy (Quick Test)

```bash
# Build the app
cd frontend
npm run build

# This creates a 'build' folder
```

1. Go to https://app.netlify.com/drop
2. Drag the `build` folder onto the page
3. **Done!** Site is live instantly

**Note:** This method doesn't have continuous deployment.

---

## 🔥 Option 2: Deploy to Firebase Hosting

### Step 1: Build App

```bash
cd frontend
npm run build
```

### Step 2: Initialize Firebase Hosting

```bash
# In project root
firebase init hosting
```

**Selections:**
- Use existing project: **Select your pulse-learn project**
- Public directory: **frontend/build**
- Single-page app: **Yes**
- Overwrite index.html: **No**

### Step 3: Deploy

```bash
firebase deploy --only hosting
```

**Your site is live!**

**URL:** `https://pulse-learn-xxxxx.web.app`

---

## ⚙️ Environment Variables

### Netlify
Add in: **Site settings** > **Environment variables**

### Vercel
```bash
vercel env add REACT_APP_FIREBASE_API_KEY
# Enter value when prompted
# Repeat for all variables
```

### Firebase Hosting
Variables are baked into build (already in `.env`)

---

## 🔐 Security Checklist

Before going live:

- [ ] `.env` file is in `.gitignore`
- [ ] Firebase security rules deployed
- [ ] Storage rules deployed
- [ ] Admin email configured
- [ ] Stripe in TEST mode (for now)
- [ ] Custom domain has SSL

---

## 🌐 Custom Domain Setup

### Netlify

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Netlify: **Domain settings** > **Add custom domain**
3. Add DNS records at your domain registrar:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```
4. Wait 24-48 hours for DNS propagation
5. SSL auto-enabled!

### Firebase Hosting

1. In Firebase Console: **Hosting** > **Add custom domain**
2. Follow DNS verification steps
3. Add A records provided by Firebase
4. SSL auto-enabled!

---

## 📊 Post-Deployment

### Test Your Live Site

- [ ] Sign up works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Courses display
- [ ] Firebase data saves
- [ ] File uploads work
- [ ] Payments flow (test mode)
- [ ] Mobile responsive
- [ ] Fast loading (<3s)

### Monitor Performance

**Netlify Analytics (Free tier):**
- Pageviews
- Unique visitors
- Top pages
- Bandwidth usage

**Firebase Analytics:**
```bash
# Enable in Firebase Console
# Add to app (optional)
```

---

## 🔄 Continuous Deployment

With GitHub + Netlify:

**Every time you push code:**
```bash
git add .
git commit -m "Added new feature"
git push
```

**Netlify automatically:**
1. Detects push
2. Builds app
3. Deploys to production
4. Updates live site

**Takes ~2 minutes!**

---

## 🐛 Troubleshooting

### Build Fails

**Check build logs in Netlify:**
- Missing environment variables?
- npm install errors?
- Build command correct?

**Fix:**
```bash
# Test locally first
npm run build

# If it works locally, check Netlify settings
```

### Site Shows But Doesn't Work

**Common issues:**
- Environment variables not set
- Firebase rules not deployed
- API keys incorrect

**Fix:**
1. Check browser console (F12)
2. Verify all `.env` variables in Netlify
3. Redeploy security rules:
```bash
firebase deploy --only firestore:rules,storage:rules
```

### 404 on Refresh

**Fix:** Add `_redirects` file to `public` folder:
```
/*    /index.html   200
```

---

## 💰 Cost After Free Tier

### Netlify (100GB/month free)
- After 100GB: $20/month for 400GB
- **Unlikely to hit** with <1000 users

### Firebase
- **Free tier covers:**
  - 50k users (auth)
  - 1GB storage
  - 10GB bandwidth/month
  
- **Paid tier (~R300/month):**
  - Unlimited users
  - More storage
  - More bandwidth

### Stripe
- No monthly fee
- Only pay per transaction: 2.9% + R2
- **Example:** R149 subscription = R4.30 fee
- **You keep:** R144.70

---

## 🎉 Launch Checklist

Before announcing to students:

- [ ] Site is live and working
- [ ] Custom domain configured
- [ ] SSL enabled (HTTPS)
- [ ] All features tested
- [ ] Admin access works
- [ ] Stripe test mode active
- [ ] Social media pages created
- [ ] Support email configured
- [ ] Terms of service page
- [ ] Privacy policy page

---

## 📈 Scaling

### When you hit limits:

**100+ students:**
- Upgrade Firebase to Blaze plan
- Add video hosting (Vimeo/Bunny.net)
- **Cost:** ~R500-1000/month

**500+ students:**
- Consider CDN (Cloudflare - FREE)
- Database optimization
- Caching strategies
- **Cost:** ~R2000/month
- **Revenue:** ~R75,000/month 💰

---

## 🚀 You're Live!

**Share your platform:**
- WhatsApp groups
- University forums
- Facebook pages
- Instagram (@pulselearn_sa)
- TikTok tutorials
- YouTube demos

**Monitor & iterate:**
- Google Analytics
- User feedback
- Firebase Analytics
- Error tracking

---

## 🎯 Next Steps

1. **Activate Stripe** (when ready for real payments)
2. **Record video lessons**
3. **Create course content**
4. **Build email list**
5. **Launch marketing campaign**
6. **Get first 10 paying students**
7. **Celebrate!** 🎉

---

**Your platform is LIVE! Now go change student lives! 🚀**

Need help? Check other docs or create an issue on GitHub.

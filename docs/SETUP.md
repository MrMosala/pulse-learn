# 🛠️ COMPLETE SETUP GUIDE

**Step-by-step guide to get Pulse Learn running on your machine**

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js v16+** installed
- [ ] **VS Code** (or any code editor)
- [ ] **Git** installed
- [ ] **Google account** (for Firebase)
- [ ] **Internet connection**

---

## 📥 Step 1: Get the Code

### Option A: Download ZIP
1. Download the project ZIP file
2. Extract to your desired location
3. Open in VS Code: `File > Open Folder`

### Option B: Clone Repository (if on GitHub)
```bash
git clone https://github.com/yourusername/pulse-learn.git
cd pulse-learn
```

---

## 🔧 Step 2: Install Node.js

### Check if Already Installed
```bash
node --version
npm --version
```

If you see version numbers (e.g., `v18.17.0`), you're good! Skip to Step 3.

### Install Node.js
1. Go to https://nodejs.org/
2. Download **LTS version** (v20.x recommended)
3. Run installer with default settings
4. Restart VS Code
5. Verify installation:
```bash
node --version
```

---

## 📦 Step 3: Install Project Dependencies

```bash
# Navigate to frontend folder
cd frontend

# Install all dependencies (takes 2-3 minutes)
npm install
```

**What this does:**
- Downloads React, Firebase, Stripe, and all libraries
- Creates `node_modules` folder (don't commit this!)
- Sets up project for development

**Expected output:**
```
added 1432 packages in 2m
```

---

## 🔥 Step 4: Setup Firebase

### 4.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `pulse-learn` (or your choice)
4. **Disable** Google Analytics (not needed for MVP)
5. Click **"Create project"**
6. Wait ~30 seconds for setup

### 4.2 Enable Authentication

1. In Firebase Console, click **"Authentication"**
2. Click **"Get started"**
3. Click **"Email/Password"**
   - Toggle **Enable**
   - Click **Save**
4. Click **"Google"** (optional but recommended)
   - Toggle **Enable**
   - Select your support email
   - Click **Save**

### 4.3 Create Firestore Database

1. Click **"Firestore Database"** in sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: **africa-south1 (Johannesburg)**
5. Click **"Enable"**
6. Wait ~1 minute for database creation

### 4.4 Setup Cloud Storage

1. Click **"Storage"** in sidebar
2. Click **"Get started"**
3. Click **"Next"** (use default security rules)
4. Choose location: **africa-south1** (same as Firestore)
5. Click **"Done"**

### 4.5 Get Firebase Configuration

1. Click **⚙️ Settings** (gear icon) > **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click **web icon** `</>`
4. App nickname: `pulse-learn-web`
5. **Don't** check "Firebase Hosting"
6. Click **"Register app"**
7. **COPY THE CONFIG** - you'll need this next!

It looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "pulse-learn-xxxxx.firebaseapp.com",
  projectId: "pulse-learn-xxxxx",
  storageBucket: "pulse-learn-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

8. Click **"Continue to console"**

---

## 🔐 Step 5: Configure Environment Variables

### 5.1 Create .env File

```bash
# In the frontend folder
cp .env.example .env
```

### 5.2 Edit .env File

Open `.env` in VS Code and paste your Firebase config:

```env
# Firebase Configuration (from Step 4.5)
REACT_APP_FIREBASE_API_KEY=AIzaSyB...
REACT_APP_FIREBASE_AUTH_DOMAIN=pulse-learn-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=pulse-learn-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=pulse-learn-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Stripe (we'll add this later in Step 7)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Admin Email (your email for admin access)
REACT_APP_ADMIN_EMAIL=your-email@gmail.com

# App Info
REACT_APP_NAME=Pulse Learn
REACT_APP_VERSION=2.0.0
```

**⚠️ IMPORTANT:**
- Never commit `.env` to GitHub!
- It's already in `.gitignore`
- Each developer needs their own `.env`

---

## 🔒 Step 6: Deploy Security Rules

### 6.1 Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login
```

This opens a browser - login with your Google account.

### 6.2 Initialize Firebase in Project

```bash
# In the project root (not frontend folder)
cd ..  # if you're in frontend folder
firebase init
```

**Selections:**
- Firestore: **Yes**
- Storage: **Yes**
- Use existing project: **Select your pulse-learn project**
- Firestore rules file: **firebase/firestore.rules**
- Firestore indexes: **firebase/firestore.indexes.json**
- Storage rules: **firebase/storage.rules**

### 6.3 Deploy Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

**Expected output:**
```
✔  Deploy complete!
```

---

## 💳 Step 7: Setup Stripe (Optional for MVP)

### 7.1 Create Stripe Account

1. Go to https://stripe.com/
2. Click **"Sign up"**
3. Fill in your details
4. **Stay in TEST MODE** (don't activate)

### 7.2 Get API Keys

1. In Stripe Dashboard, click **"Developers"**
2. Click **"API keys"**
3. Copy **"Publishable key"** (starts with `pk_test_`)
4. Paste in `.env`:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51N...
```

**Note:** We'll setup webhooks later when going live.

---

## 🚀 Step 8: Start Development Server

```bash
# Make sure you're in frontend folder
cd frontend

# Start the app
npm start
```

**What happens:**
- Compiles React app (~30 seconds first time)
- Opens browser at `http://localhost:3000`
- Hot reload enabled (changes reflect instantly)

**Expected output:**
```
Compiled successfully!

You can now view pulse-learn-platform in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.5:3000
```

---

## 🎉 Step 9: Test the App

### 9.1 Create Your First Account

1. Click **"Sign Up"**
2. Fill in your details:
   - Name: Your name
   - Email: Your email
   - Student Number: Any number (e.g., 202012345)
   - University: Select yours
   - Program: Select yours
3. Click **"CREATE ACCOUNT"**

**Expected:** 
- Redirects to dashboard
- Shows your personalized info
- Displays XP bar and stats

### 9.2 Make Yourself Admin

1. Go to Firebase Console
2. Click **"Firestore Database"**
3. Click **"users"** collection
4. Click on your user document
5. Click **pencil icon** to edit
6. Change `role` field from `student` to `admin`
7. Click **"Update"**

Now you have admin access! 🎉

---

## 🐛 Troubleshooting

### "Module not found" Error
```bash
cd frontend
npm install
```

### Firebase Connection Error
- Check `.env` file has correct values
- Restart dev server (`Ctrl+C`, then `npm start`)
- Check Firebase project is active in console

### Port 3000 Already in Use
```bash
# Kill the process
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Or use different port:
PORT=3001 npm start
```

### White Screen / Blank Page
- Check browser console (F12)
- Check for JavaScript errors
- Verify `.env` file exists and has all variables

### Firebase Auth Error
- Check Firebase Authentication is enabled
- Verify API key in `.env` is correct
- Try logging out and logging in again

---

## 📱 Step 10: Test on Mobile

### Same WiFi Network
1. Find your computer's IP address:
```bash
# Mac/Linux:
ifconfig | grep inet

# Windows:
ipconfig
```

2. On your phone, open browser:
```
http://YOUR_IP_ADDRESS:3000
```

Example: `http://192.168.1.5:3000`

---

## ✅ Success Checklist

You should now have:

- [ ] Project running at `localhost:3000`
- [ ] Can sign up and login
- [ ] Firebase storing user data
- [ ] Dashboard showing your info
- [ ] Animations and particles working
- [ ] Mobile responsive

---

## 🎯 What's Next?

1. **Explore the app** - Click around, test features
2. **Read [FIREBASE.md](FIREBASE.md)** - Learn database structure
3. **Read [STRIPE.md](STRIPE.md)** - Setup payments
4. **Read [DEPLOY.md](DEPLOY.md)** - Deploy to production
5. **Customize** - Add your branding, content
6. **Launch** - Share with first students!

---

## 🆘 Need Help?

- **Firebase Issues:** https://firebase.google.com/support
- **React Issues:** https://react.dev/
- **Stripe Issues:** https://stripe.com/docs

---

**Congratulations! Your platform is running! 🎉**

Next: [FIREBASE.md](FIREBASE.md) - Understanding your database

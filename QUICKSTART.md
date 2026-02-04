# ⚡ QUICK START - Get Running in 15 Minutes!

**The fastest way to get Pulse Learn working locally**

---

## 🚀 Super Quick Setup

### 1. Install Node.js (if needed)
```bash
# Check if installed:
node --version

# If not installed:
# Download from https://nodejs.org/ (LTS version)
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```
*This takes 2-3 minutes - downloads all libraries*

### 3. Setup Firebase

**Create Project (2 minutes):**
1. Go to https://firebase.google.com/
2. Click "Console" > "Add Project"
3. Name: `pulse-learn`
4. Disable Analytics > Create

**Enable Services (3 minutes):**
1. **Authentication:** Get Started > Enable "Email/Password"
2. **Firestore:** Create Database > Production Mode > africa-south1
3. **Storage:** Get Started > Production Mode > africa-south1

**Get Config (1 minute):**
1. Settings ⚙️ > Project Settings
2. Scroll down > Click Web icon `</>`
3. Register app: `pulse-learn-web`
4. **COPY THE CONFIG**

### 4. Configure App
```bash
# Copy template
cp .env.example .env

# Edit .env file and paste your Firebase config
```

Your `.env` should look like:
```env
REACT_APP_FIREBASE_API_KEY=AIzaSyB...
REACT_APP_FIREBASE_AUTH_DOMAIN=pulse-learn-xxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=pulse-learn-xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=pulse-learn-xxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123

REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_... (optional for now)
REACT_APP_ADMIN_EMAIL=your-email@gmail.com
```

### 5. Deploy Security Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Go to project root
cd ..

# Initialize
firebase init
# Select: Firestore, Storage
# Use existing project: pulse-learn
# Firestore rules: firebase/firestore.rules
# Storage rules: firebase/storage.rules

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

### 6. START THE APP! 🎉
```bash
cd frontend
npm start
```

**Browser opens automatically at http://localhost:3000**

---

## ✅ Test It Works

1. **Sign Up:**
   - Click "Sign Up"
   - Fill in your details
   - Create account

2. **Check Firebase:**
   - Go to Firebase Console
   - Click "Authentication" - see your user
   - Click "Firestore" - see your data

3. **Make Yourself Admin:**
   - Firestore > users > (your user)
   - Edit field: `role` = `admin`
   - Refresh app

---

## 🐛 Common Issues

**"Module not found"**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Firebase error**
- Check `.env` values are correct
- Restart app: `Ctrl+C` then `npm start`

**Port 3000 in use**
```bash
# Use different port
PORT=3001 npm start
```

---

## 📚 What's Next?

- **Read full docs:** See `docs/SETUP.md`
- **Understand Firebase:** See `docs/FIREBASE.md`
- **Deploy live:** See `docs/DEPLOY.md`
- **Add Stripe:** See `docs/STRIPE.md`

---

## 🎯 You're Running!

Now you can:
- ✅ Sign up users
- ✅ Login/logout
- ✅ Save data to Firebase
- ✅ Upload files
- ✅ Test all features locally

**Next step:** Deploy to Netlify and go LIVE! 🚀

See `docs/DEPLOY.md` for instructions.

---

**Having issues? Check the full SETUP.md guide!**

# ⚡ PULSE LEARN - Complete Student Success Platform

**Your All-in-One Platform for Academic Excellence, Career Launch & Financial Mastery**

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ installed
- Firebase account (free)
- Stripe account (test mode - free)
- VS Code (recommended)

### Setup in 5 Minutes

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment**
```bash
# Copy the template
cp .env.example .env

# Edit .env and add your Firebase & Stripe keys
# See docs/FIREBASE.md for detailed instructions
```

3. **Start Development Server**
```bash
npm start
```

Your app will open at `http://localhost:3000` 🎉

---

## 📚 Documentation

- **[SETUP.md](docs/SETUP.md)** - Complete setup guide
- **[FIREBASE.md](docs/FIREBASE.md)** - Firebase configuration
- **[STRIPE.md](docs/STRIPE.md)** - Payment setup
- **[DEPLOY.md](docs/DEPLOY.md)** - Deploy to production

---

## 🎯 Features

### 📚 Learning Platform
- Premium video courses
- Interactive lessons
- Assignment submission & tracking
- Live tutoring scheduling
- Progress tracking with XP system

### 💼 Career Builder
- AI-powered CV builder
- Job posting analyzer
- Tailored CV generation
- Application tracking
- Interview preparation

### 💰 Finance Manager
- Smart budget planner
- Expense tracking
- Meal planning with costs
- Savings goals tracker
- Debt management
- Financial health score

### 🎮 Gamification
- XP points system
- Level progression (Bronze → Platinum)
- Achievement badges
- Daily challenges
- Leaderboards

---

## 🗂️ Project Structure

```
pulse-learn-full/
├── frontend/                # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context (state)
│   │   ├── services/       # Firebase & API services
│   │   ├── utils/          # Helper functions
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
│
├── firebase/               # Backend configuration
│   ├── firestore.rules    # Database security
│   ├── storage.rules      # File storage security
│   └── firebase.json      # Firebase config
│
├── docs/                   # Documentation
│   ├── SETUP.md
│   ├── FIREBASE.md
│   ├── STRIPE.md
│   └── DEPLOY.md
│
└── README.md              # This file
```

---

## 💻 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Navigation
- **Firebase SDK** - Backend services
- **Stripe.js** - Payments
- **Recharts** - Data visualization

### Backend (Firebase)
- **Firebase Auth** - User authentication
- **Firestore** - NoSQL database
- **Cloud Storage** - File uploads
- **Cloud Functions** - Server-side logic

### Hosting
- **Netlify** - Frontend hosting (free tier)
- **Firebase Hosting** - Alternative option

---

## 🎨 Design Features

- ⚡ Animated particle background
- 💎 Glassmorphism UI
- 🌈 Dynamic gradients
- ✨ Smooth animations
- 📱 Mobile responsive
- 🎯 Intuitive navigation

---

## 🔐 Security

- Firebase Authentication (email/password, Google)
- Firestore security rules
- Storage access control
- Environment variable protection
- HTTPS only (Netlify automatic SSL)

---

## 💰 Cost Breakdown

### FREE Tier (Perfect for MVP)
- Firebase: Up to 50k users, 1GB storage
- Netlify: 100GB bandwidth/month
- Stripe: Test mode forever
- **Total: R0/month**

### Paid Tier (When scaling)
- Firebase: ~R300/month
- Video hosting: ~R200/month
- Domain: ~R20/month
- **Total: ~R520/month**

### Revenue Potential
- 100 students × R149 = R14,900/month
- **Profit: ~R14,400/month (96% margin)**

---

## 🚀 Deployment

Deploy to Netlify in 2 minutes:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod
```

See [DEPLOY.md](docs/DEPLOY.md) for detailed instructions.

---

## 📊 Admin Features

Access admin dashboard at `/admin` with admin email:

- View all students
- Manage courses
- Review assignments
- Process CV requests
- Track payments
- Analytics dashboard

---

## 🤝 Support

- Issues: Create a GitHub issue
- Email: support@pulselearn.co.za
- Docs: See `/docs` folder

---

## 📄 License

MIT License - Free to use and modify

---

## 🎉 What's Next?

1. ✅ Complete this setup
2. ✅ Test locally
3. ✅ Deploy to Netlify
4. ✅ Share with first 10 students
5. ✅ Collect feedback
6. ✅ Iterate and improve
7. ✅ Scale to 100+ students
8. ✅ Become #1 student platform in SA! 🇿🇦

---

**Built with ⚡ by Mosala**
**Powered by React, Firebase & Stripe**

Let's transform student success! 🚀

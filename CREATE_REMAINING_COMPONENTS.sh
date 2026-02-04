#!/bin/bash

# Finance Page
cat > /home/claude/pulse-learn-full/frontend/src/pages/Finance.js << 'EOF'
// frontend/src/pages/Finance.js
import React from 'react';

function Finance() {
  return (
    <div className="page finance-page">
      <h1 className="section-title">💰 Financial Dashboard</h1>
      
      <div className="alert alert-success">
        <span style={{fontSize: '1.5rem'}}>✅</span>
        <div><strong>Great job!</strong> You're R1,200 under budget this month!</div>
      </div>

      <div className="finance-overview">
        <div className="finance-card glass-card">
          <div className="finance-icon">💵</div>
          <div className="finance-amount" style={{color: '#10B981'}}>R11,500</div>
          <div className="finance-label">Monthly Income</div>
          <div className="progress-container">
            <div className="progress-bar" style={{width: '100%'}}></div>
          </div>
        </div>

        <div className="finance-card glass-card">
          <div className="finance-icon">💸</div>
          <div className="finance-amount" style={{color: '#F59E0B'}}>R8,300</div>
          <div className="finance-label">Total Expenses</div>
          <div className="progress-container">
            <div className="progress-bar" style={{width: '72%'}}></div>
          </div>
        </div>

        <div className="finance-card glass-card">
          <div className="finance-icon">💰</div>
          <div className="finance-amount" style={{color: '#10B981'}}>R3,200</div>
          <div className="finance-label">Available</div>
          <div className="progress-container">
            <div className="progress-bar" style={{width: '28%'}}></div>
          </div>
        </div>
      </div>

      <div className="budget-section glass-card">
        <h3>This Month's Spending</h3>
        <div className="expense-item">
          <div className="expense-info">
            <div className="expense-icon">🏠</div>
            <div><h4>Rent</h4><p>R3,500 / R3,500</p></div>
          </div>
          <div className="expense-amount">R3,500</div>
        </div>
        <div className="expense-item">
          <div className="expense-info">
            <div className="expense-icon">🍕</div>
            <div><h4>Food</h4><p>R1,800 / R2,500</p></div>
          </div>
          <div className="expense-amount">R1,800</div>
        </div>
        <div className="expense-item">
          <div className="expense-info">
            <div className="expense-icon">🚌</div>
            <div><h4>Transport</h4><p>R650 / R800</p></div>
          </div>
          <div className="expense-amount">R650</div>
        </div>
      </div>

      <h3 className="section-title" style={{fontSize: '1.5rem'}}>Savings Goals</h3>
      <div className="goals-grid">
        <div className="goal-card glass-card">
          <div className="goal-header">
            <div className="goal-title">Emergency Fund</div>
            <div className="goal-icon">🚨</div>
          </div>
          <div className="goal-percentage">68%</div>
          <div className="goal-progress">
            <div className="goal-amounts">
              <span>R3,400</span>
              <span>R5,000</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{width: '68%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Finance;
EOF

# Subscribe Page
cat > /home/claude/pulse-learn-full/frontend/src/pages/Subscribe.js << 'EOF'
// frontend/src/pages/Subscribe.js
import React from 'react';

function Subscribe() {
  return (
    <div className="page subscribe-page">
      <div style={{textAlign: 'center', margin: '3rem 0'}}>
        <h2 className="section-title">Choose Your Plan</h2>
        <p style={{color: '#94A3B8', fontSize: '1.2rem'}}>Unlock your complete success platform</p>
      </div>

      <div className="plans-grid">
        <div className="plan-card glass-card">
          <h3 className="plan-name">Free</h3>
          <div className="plan-price">R0</div>
          <div className="plan-period">Forever</div>
          <ul className="plan-features">
            <li>Browse course catalog</li>
            <li>1 CV per month</li>
            <li>Basic budget tracker</li>
            <li>Community access</li>
          </ul>
          <button className="subscribe-btn" style={{background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)'}}>
            Current Plan
          </button>
        </div>

        <div className="plan-card glass-card featured">
          <div className="popular-badge">MOST POPULAR</div>
          <h3 className="plan-name">Basic</h3>
          <div className="plan-price">R149</div>
          <div className="plan-period">per month</div>
          <ul className="plan-features">
            <li>All video lessons</li>
            <li>3 CVs per month</li>
            <li>Full budget planner</li>
            <li>Meal planning</li>
            <li>5 assignments/month</li>
            <li>Priority support</li>
          </ul>
          <button className="subscribe-btn">Get Started</button>
        </div>

        <div className="plan-card glass-card">
          <h3 className="plan-name">Premium</h3>
          <div className="plan-price">R299</div>
          <div className="plan-period">per month</div>
          <ul className="plan-features">
            <li>Everything in Basic</li>
            <li>Unlimited CVs & cover letters</li>
            <li>1-on-1 financial coaching</li>
            <li>Interview prep</li>
            <li>LinkedIn optimization</li>
            <li>Unlimited assignments</li>
            <li>2h live tutoring/month</li>
          </ul>
          <button className="subscribe-btn">Go Premium</button>
        </div>
      </div>
    </div>
  );
}

export default Subscribe;
EOF

# Profile Page
cat > /home/claude/pulse-learn-full/frontend/src/pages/Profile.js << 'EOF'
// frontend/src/pages/Profile.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { userProfile, currentUser } = useAuth();

  if (!userProfile) return <div>Loading...</div>;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="page profile-page">
      <div className="profile-header glass-card">
        <div className="profile-avatar">
          {getInitials(userProfile.displayName)}
        </div>
        <div>
          <h2>{userProfile.displayName}</h2>
          <p style={{color: '#94A3B8'}}>{currentUser.email}</p>
        </div>
      </div>

      <h3 style={{marginBottom: '1.5rem', fontSize: '1.75rem', fontWeight: 800}}>Academic Information</h3>
      <div className="profile-details-grid">
        <div className="profile-field glass-card">
          <label>Student Number</label>
          <div className="value">{userProfile.studentNumber}</div>
        </div>
        
        <div className="profile-field glass-card">
          <label>University</label>
          <div className="value">{userProfile.university}</div>
        </div>
        
        <div className="profile-field glass-card">
          <label>Course / Program</label>
          <div className="value">{userProfile.course}</div>
        </div>
        
        <div className="profile-field glass-card">
          <label>Subscription</label>
          <div className="value">{userProfile.subscriptionTier?.toUpperCase() || 'FREE'} Plan</div>
        </div>
        
        <div className="profile-field glass-card">
          <label>Level</label>
          <div className="value">{userProfile.level || 1}</div>
        </div>
        
        <div className="profile-field glass-card">
          <label>XP Points</label>
          <div className="value" style={{color: '#8B5CF6'}}>{userProfile.xp || 0}</div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
EOF

# Admin Dashboard
cat > /home/claude/pulse-learn-full/frontend/src/pages/AdminDashboard.js << 'EOF'
// frontend/src/pages/AdminDashboard.js
import React from 'react';

function AdminDashboard() {
  return (
    <div className="page admin-page">
      <h1 className="section-title">👨‍💼 Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">0</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">0</div>
          <div className="stat-label">Pending Assignments</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">💼</div>
          <div className="stat-value">0</div>
          <div className="stat-label">CV Requests</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">R0</div>
          <div className="stat-label">Revenue</div>
        </div>
      </div>

      <div className="glass-card">
        <h3>Recent Activity</h3>
        <p style={{color: '#94A3B8', marginTop: '1rem'}}>
          No activity yet. Students will appear here once they start using the platform.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;
EOF

echo "✅ All page components created!"

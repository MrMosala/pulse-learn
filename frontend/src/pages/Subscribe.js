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

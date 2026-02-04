// frontend/src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            YOUR SUCCESS <span className="gradient-text">COMMAND CENTER</span>
          </h1>
          <p className="hero-subtitle">
            🎓 Master Academics • 💼 Launch Career • 💰 Build Wealth
          </p>
          <button className="hero-btn" onClick={() => navigate('/signup')}>
            START YOUR JOURNEY
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🚀</div>
            <div className="stat-value">500+</div>
            <div className="stat-label">Premium Resources</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">98%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💎</div>
            <div className="stat-value">R5K+</div>
            <div className="stat-label">Avg Savings</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">4.9</div>
            <div className="stat-label">Student Rating</div>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="pillars-section">
        <h2 className="section-title">Three Pillars of Success</h2>
        <div className="pillars-grid">
          <div className="pillar-card glass-card">
            <div className="pillar-icon">📚</div>
            <h3>ACADEMIC EXCELLENCE</h3>
            <p>
              Premium courses, live tutoring, and personalized assignment support 
              tailored to your university curriculum
            </p>
            <ul className="feature-list">
              <li>✓ Video lessons from experts</li>
              <li>✓ Assignment help & solutions</li>
              <li>✓ Live 1-on-1 tutoring</li>
              <li>✓ Progress tracking with XP</li>
            </ul>
          </div>

          <div className="pillar-card glass-card">
            <div className="pillar-icon">💼</div>
            <h3>CAREER LAUNCH</h3>
            <p>
              AI-powered CV builder, job matching, and interview prep to land 
              your dream internship or job
            </p>
            <ul className="feature-list">
              <li>✓ Tailored CV generation</li>
              <li>✓ Job posting analyzer</li>
              <li>✓ Application tracking</li>
              <li>✓ Interview preparation</li>
            </ul>
          </div>

          <div className="pillar-card glass-card">
            <div className="pillar-icon">💰</div>
            <h3>FINANCIAL MASTERY</h3>
            <p>
              Smart budgeting, meal planning, and wealth building strategies 
              for student life
            </p>
            <ul className="feature-list">
              <li>✓ Budget planner & tracker</li>
              <li>✓ Weekly meal plans</li>
              <li>✓ Savings goals tracker</li>
              <li>✓ Financial health score</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card glass-card">
          <h2>Ready to Transform Your Student Life?</h2>
          <p>Join thousands of successful students already on the platform</p>
          <button className="cta-btn" onClick={() => navigate('/signup')}>
            Get Started Free
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;

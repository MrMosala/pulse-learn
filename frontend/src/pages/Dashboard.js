// frontend/src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

function Dashboard() {
  const { userProfile } = useAuth();

  if (!userProfile) return <div>Loading...</div>;

  return (
    <div className="page dashboard-page">
      <div className="welcome-banner">
        <h2>WELCOME BACK, {userProfile.displayName?.toUpperCase()}! ⚡</h2>
        <div className="user-info">
          <div className="info-item">
            <span className="info-label">Student Number</span>
            <span className="info-value">{userProfile.studentNumber}</span>
          </div>
          <div className="info-item">
            <span className="info-label">University</span>
            <span className="info-value">{userProfile.university}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Program</span>
            <span className="info-value">{userProfile.course}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Level</span>
            <span className="info-value" style={{color: '#FFD700'}}>
              {userProfile.level || 1} ⭐
            </span>
          </div>
        </div>
      </div>

      <div className="xp-container">
        <div className="xp-header">
          <span className="xp-label">EXPERIENCE POINTS</span>
          <span className="xp-value">{userProfile.xp || 0} / 3,000 XP</span>
        </div>
        <div className="progress-container">
          <div className="progress-bar" style={{width: `${((userProfile.xp || 0) / 3000) * 100}%`}}></div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">12</div>
          <div className="stat-label">Active Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-value">3</div>
          <div className="stat-label">CVs Created</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">78%</div>
          <div className="stat-label">Budget Health</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">85%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
      </div>

      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-actions">
        <a href="/courses" className="action-card glass-card">
          <div className="action-icon">📚</div>
          <h3>Continue Learning</h3>
          <p>Resume your courses</p>
        </a>
        <a href="/cv-builder" className="action-card glass-card">
          <div className="action-icon">💼</div>
          <h3>Build CV</h3>
          <p>Create tailored CVs</p>
        </a>
        <a href="/finance" className="action-card glass-card">
          <div className="action-icon">💰</div>
          <h3>Check Budget</h3>
          <p>View financial health</p>
        </a>
      </div>
    </div>
  );
}

export default Dashboard;

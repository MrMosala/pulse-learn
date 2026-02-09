// frontend/src/pages/Dashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function Dashboard() {
  const { userProfile } = useAuth();

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="welcome-card">
        <h1 className="welcome-title">
          WELCOME BACK, <span className="highlight-name">{userProfile?.displayName?.toUpperCase() || "STUDENT"}</span>! 🎉
        </h1>
        
        <div className="student-info-cards">
          <div className="info-card">
            <div className="info-label">STUDENT NUMBER</div>
            <div className="info-value">{userProfile?.studentNumber || "202012345"}</div>
          </div>
          <div className="info-card">
            <div className="info-label">UNIVERSITY</div>
            <div className="info-value">{userProfile?.university || "Nelson Mandela University"}</div>
          </div>
          <div className="info-card">
            <div className="info-label">PROGRAM</div>
            <div className="info-value">{userProfile?.course || "BSc Applied Mathematics"}</div>
          </div>
          <div className="info-card">
            <div className="info-label">LEVEL</div>
            <div className="info-value level-display">
              {userProfile?.level || "1"} ★
            </div>
          </div>
        </div>
      </div>

      {/* Experience Points */}
      <div className="xp-card">
        <div className="xp-header">
          <div className="xp-title">EXPERIENCE POINTS</div>
          <div className="xp-count">{userProfile?.xp || 0} / 3,000 XP</div>
        </div>
        <div className="xp-progress-container">
          <div 
            className="xp-progress-bar"
            style={{ width: `${Math.min(((userProfile?.xp || 0) / 3000) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <h2>Quick Actions</h2>
      </div>
      
      <div className="quick-actions-grid">
        <button 
          className="action-card"
          onClick={() => window.location.href = '/courses'}
        >
          <div className="action-icon">📚</div>
          <div className="action-content">
            <h3>Continue Learning</h3>
            <p>Resume your courses</p>
          </div>
        </button>
        <button 
          className="action-card"
          onClick={() => window.location.href = '/cv-builder'}
        >
          <div className="action-icon">💼</div>
          <div className="action-content">
            <h3>Build CV</h3>
            <p>Create tailored CVs</p>
          </div>
        </button>
        <button 
          className="action-card"
          onClick={() => window.location.href = '/finance'}
        >
          <div className="action-icon">💰</div>
          <div className="action-content">
            <h3>Check Budget</h3>
            <p>View financial health</p>
          </div>
        </button>
        <button 
          className="action-card"
          onClick={() => window.location.href = '/assignments'}
        >
          <div className="action-icon">📄</div>
          <div className="action-content">
            <h3>Upload Assignment</h3>
            <p>Get help with work</p>
          </div>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="section-header">
        <h2>Your Progress</h2>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number">12</div>
          <div className="stat-label">Active Courses</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">3</div>
          <div className="stat-label">CVs Created</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">78%</div>
          <div className="stat-label">Budget Health</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">85%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
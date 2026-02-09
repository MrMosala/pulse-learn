// frontend/src/pages/ProfessionalDashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function ProfessionalDashboard() {
  const { userProfile } = useAuth();

  return (
    <DashboardLayout>
      {/* Welcome Banner for Professionals */}
      <div className="welcome-card professional-welcome">
        <h1 className="welcome-title">
          WELCOME, <span className="highlight-name">{userProfile?.displayName?.toUpperCase() || "PROFESSIONAL"}</span>! 💼
        </h1>
        
        <div className="professional-info-cards">
          <div className="info-card">
            <div className="info-label">PROFESSIONAL STATUS</div>
            <div className="info-value">
              {userProfile?.profession || "Career Professional"}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">ACCOUNT TYPE</div>
            <div className="info-value professional-badge">
              💼 Professional Account
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">NETWORK STRENGTH</div>
            <div className="info-value level-display">
              {userProfile?.networkScore || "85"} / 100 ★
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">CAREER LEVEL</div>
            <div className="info-value">
              {userProfile?.careerLevel || "Mid-Senior"}
            </div>
          </div>
        </div>
      </div>

      {/* Career Progress */}
      <div className="xp-card career-card">
        <div className="xp-header">
          <div className="xp-title">CAREER PROGRESS</div>
          <div className="xp-count">{userProfile?.careerProgress || 65}% Complete</div>
        </div>
        <div className="xp-progress-container">
          <div 
            className="xp-progress-bar career-progress"
            style={{ width: `${userProfile?.careerProgress || 65}%` }}
          ></div>
        </div>
      </div>

      {/* Professional Quick Actions */}
      <div className="section-header">
        <h2>Career Actions</h2>
      </div>
      
      <div className="quick-actions-grid">
        <button 
          className="action-card professional-action"
          onClick={() => window.location.href = '/cv-builder'}
        >
          <div className="action-icon">📄</div>
          <div className="action-content">
            <h3>Advanced CV Builder</h3>
            <p>Tailor CVs for specific roles</p>
          </div>
        </button>
        <button 
          className="action-card professional-action"
          onClick={() => window.location.href = '/crunchtime'}
        >
          <div className="action-icon">🎯</div>
          <div className="action-content">
            <h3>Career Coaching</h3>
            <p>1-on-1 expert sessions</p>
          </div>
        </button>
        <button 
          className="action-card professional-action"
          onClick={() => window.location.href = '/courses'}
        >
          <div className="action-icon">📚</div>
          <div className="action-content">
            <h3>Skill Development</h3>
            <p>Upskill with advanced courses</p>
          </div>
        </button>
        <button 
          className="action-card professional-action"
          onClick={() => window.location.href = '/profile'}
        >
          <div className="action-icon">🤝</div>
          <div className="action-content">
            <h3>Networking</h3>
            <p>Connect with professionals</p>
          </div>
        </button>
      </div>

      {/* Professional Stats */}
      <div className="section-header">
        <h2>Your Professional Metrics</h2>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item professional-stat">
          <div className="stat-number">{userProfile?.cvCount || 0}</div>
          <div className="stat-label">CVs Tailored</div>
        </div>
        <div className="stat-item professional-stat">
          <div className="stat-number">{userProfile?.coachingSessions || 0}</div>
          <div className="stat-label">Coaching Sessions</div>
        </div>
        <div className="stat-item professional-stat">
          <div className="stat-number">{userProfile?.networkConnections || 12}</div>
          <div className="stat-label">Network Connections</div>
        </div>
        <div className="stat-item professional-stat">
          <div className="stat-number">{userProfile?.skillBadges || 5}</div>
          <div className="stat-label">Skill Badges</div>
        </div>
      </div>

      {/* Recent Career Activities */}
      <div className="section-header">
        <h2>Recent Career Activities</h2>
      </div>
      
      <div className="activities-list">
        <div className="activity-item">
          <div className="activity-icon">📄</div>
          <div className="activity-content">
            <div className="activity-title">CV Updated for Senior Role</div>
            <div className="activity-time">2 days ago</div>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon">🎯</div>
          <div className="activity-content">
            <div className="activity-title">Completed Leadership Course</div>
            <div className="activity-time">1 week ago</div>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon">🤝</div>
          <div className="activity-content">
            <div className="activity-title">Connected with Industry Mentor</div>
            <div className="activity-time">2 weeks ago</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProfessionalDashboard;
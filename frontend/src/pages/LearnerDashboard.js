// frontend/src/pages/LearnerDashboard.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function LearnerDashboard() {
  const { userProfile } = useAuth();

  return (
    <DashboardLayout>
      {/* Welcome Banner for Learners */}
      <div className="welcome-card learner-welcome">
        <h1 className="welcome-title">
          WELCOME, <span className="highlight-name">{userProfile?.displayName?.toUpperCase() || "LEARNER"}</span>! 📚
        </h1>
        
        <div className="learner-info-cards">
          <div className="info-card">
            <div className="info-label">LEARNER TYPE</div>
            <div className="info-value learner-badge">
              👤 General Learner
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">LEARNING PATH</div>
            <div className="info-value">
              {userProfile?.learningPath || "Self-Directed"}
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">ACTIVE COURSES</div>
            <div className="info-value level-display">
              {userProfile?.activeCourses || 3} ★
            </div>
          </div>
          <div className="info-card">
            <div className="info-label">LEARNING STREAK</div>
            <div className="info-value">
              {userProfile?.learningStreak || 7} days
            </div>
          </div>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="xp-card learning-card">
        <div className="xp-header">
          <div className="xp-title">LEARNING PROGRESS</div>
          <div className="xp-count">{userProfile?.learningProgress || 45}% Complete</div>
        </div>
        <div className="xp-progress-container">
          <div 
            className="xp-progress-bar learning-progress"
            style={{ width: `${userProfile?.learningProgress || 45}%` }}
          ></div>
        </div>
      </div>

      {/* Learner Quick Actions */}
      <div className="section-header">
        <h2>Learning Actions</h2>
      </div>
      
      <div className="quick-actions-grid">
        <button 
          className="action-card learner-action"
          onClick={() => window.location.href = '/courses'}
        >
          <div className="action-icon">📚</div>
          <div className="action-content">
            <h3>Browse Courses</h3>
            <p>Explore learning materials</p>
          </div>
        </button>
        <button 
          className="action-card learner-action"
          onClick={() => window.location.href = '/crunchtime'}
        >
          <div className="action-icon">🎯</div>
          <div className="action-content">
            <h3>Book Tutoring</h3>
            <p>Get expert help</p>
          </div>
        </button>
        <button 
          className="action-card learner-action"
          onClick={() => window.location.href = '/cv-builder'}
        >
          <div className="action-icon">💼</div>
          <div className="action-content">
            <h3>Basic CV Builder</h3>
            <p>Create your first CV</p>
          </div>
        </button>
        <button 
          className="action-card learner-action"
          onClick={() => window.location.href = '/profile'}
        >
          <div className="action-icon">🎓</div>
          <div className="action-content">
            <h3>Set Goals</h3>
            <p>Define learning objectives</p>
          </div>
        </button>
      </div>

      {/* Learning Stats */}
      <div className="section-header">
        <h2>Your Learning Journey</h2>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item learner-stat">
          <div className="stat-number">{userProfile?.completedCourses || 2}</div>
          <div className="stat-label">Courses Completed</div>
        </div>
        <div className="stat-item learner-stat">
          <div className="stat-number">{userProfile?.totalHours || 15}</div>
          <div className="stat-label">Hours Learned</div>
        </div>
        <div className="stat-item learner-stat">
          <div className="stat-number">{userProfile?.skillPoints || 120}</div>
          <div className="stat-label">Skill Points</div>
        </div>
        <div className="stat-item learner-stat">
          <div className="stat-number">{userProfile?.certificates || 1}</div>
          <div className="stat-label">Certificates</div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="section-header">
        <h2>Recommended for You</h2>
      </div>
      
      <div className="recommended-courses">
        <div className="course-recommendation">
          <div className="course-icon">📊</div>
          <div className="course-content">
            <div className="course-title">Data Analysis Basics</div>
            <div className="course-desc">Start your data journey</div>
            <div className="course-progress">
              <div className="progress-bar" style={{ width: '30%' }}></div>
            </div>
          </div>
          <button className="continue-btn">Continue</button>
        </div>
        
        <div className="course-recommendation">
          <div className="course-icon">💻</div>
          <div className="course-content">
            <div className="course-title">Web Development 101</div>
            <div className="course-desc">Build your first website</div>
            <div className="course-progress">
              <div className="progress-bar" style={{ width: '65%' }}></div>
            </div>
          </div>
          <button className="continue-btn">Continue</button>
        </div>
        
        <div className="course-recommendation">
          <div className="course-icon">📈</div>
          <div className="course-content">
            <div className="course-title">Business Fundamentals</div>
            <div className="course-desc">Understand core concepts</div>
            <div className="course-progress">
              <div className="progress-bar" style={{ width: '15%' }}></div>
            </div>
          </div>
          <button className="continue-btn">Start</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LearnerDashboard;
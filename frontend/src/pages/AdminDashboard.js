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

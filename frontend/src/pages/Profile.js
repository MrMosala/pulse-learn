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

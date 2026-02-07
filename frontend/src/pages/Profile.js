// frontend/src/pages/Profile.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function Profile() {
  const { userProfile, currentUser, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    university: userProfile?.university || '',
    course: userProfile?.course || '',
    phoneNumber: userProfile?.phoneNumber || '',
    bio: userProfile?.bio || '',
  });

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const academicInfo = [
    { label: 'Student Number', value: userProfile.studentNumber || '202012345', icon: '🎓' },
    { label: 'University', value: userProfile.university || 'Nelson Mandela University', icon: '🏛️' },
    { label: 'Program', value: userProfile.course || 'BSc Applied Mathematics', icon: '📚' },
    { label: 'Level', value: `${userProfile.level || '1'} ★`, icon: '⭐' },
    { label: 'Student Email', value: currentUser?.email || 'student@email.com', icon: '📧' },
    { label: 'Phone Number', value: userProfile.phoneNumber || 'Not set', icon: '📱' },
  ];

  const subscriptionInfo = [
    { label: 'Subscription Plan', value: userProfile.subscriptionTier?.toUpperCase() || 'GOLD', icon: '👑', badge: true },
    { label: 'Status', value: 'Active', icon: '✅', status: 'active' },
    { label: 'Expires', value: '2026-12-31', icon: '📅' },
    { label: 'Remaining XP', value: `${userProfile.xp || 0} / 3,000`, icon: '⚡' },
  ];

  const accountStats = [
    { label: 'Courses Enrolled', value: '12', icon: '📚', progress: 75 },
    { label: 'Assignments Uploaded', value: '8', icon: '📄', progress: 60 },
    { label: 'CVs Created', value: '3', icon: '💼', progress: 90 },
    { label: 'Tutoring Sessions', value: '5', icon: '👨‍🏫', progress: 45 },
  ];

  return (
    <DashboardLayout>
      <div className="profile-page-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="avatar-large">
              {getInitials(userProfile.displayName)}
            </div>
            <div className="profile-info">
              <h1>{userProfile.displayName}</h1>
              <p className="profile-email">{currentUser?.email}</p>
              <p className="profile-bio">{userProfile.bio || 'Dedicated student passionate about learning and growth'}</p>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className="edit-profile-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : '✏️ Edit Profile'}
            </button>
            <button className="upgrade-btn" onClick={() => window.location.href = '/subscribe'}>
              👑 Upgrade Plan
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="edit-profile-form">
            <h3>Edit Profile</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>University</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleInputChange}
                  placeholder="Enter your university"
                />
              </div>
              <div className="form-group">
                <label>Program</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="Enter your program"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              </div>
            </div>
            <div className="form-actions">
              <button className="save-btn" onClick={handleSave}>
                💾 Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Academic Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>🎓 Academic Information</h2>
          </div>
          <div className="info-cards-grid">
            {academicInfo.map((info, index) => (
              <div key={index} className="info-card">
                <div className="info-icon">{info.icon}</div>
                <div className="info-content">
                  <div className="info-label">{info.label}</div>
                  <div className="info-value">{info.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="profile-section">
          <div className="section-header">
            <h2>👑 Subscription Details</h2>
            <span className="subscription-badge-large">LVL 1 - GOLD</span>
          </div>
          <div className="subscription-cards">
            {subscriptionInfo.map((info, index) => (
              <div key={index} className={`subscription-card ${info.badge ? 'highlight' : ''}`}>
                <div className="sub-icon">{info.icon}</div>
                <div className="sub-content">
                  <div className="sub-label">{info.label}</div>
                  <div className={`sub-value ${info.status === 'active' ? 'active' : ''}`}>
                    {info.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Stats */}
        <div className="profile-section">
          <div className="section-header">
            <h2>📊 Account Statistics</h2>
          </div>
          <div className="stats-grid">
            {accountStats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-title">{stat.label}</div>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${stat.progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-percent">{stat.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <div className="section-header">
            <h2 style={{ color: '#EF4444' }}>⚠️ Account Actions</h2>
          </div>
          <div className="danger-actions">
            <button className="danger-btn logout-btn" onClick={logout}>
              🚪 Logout
            </button>
            <button className="danger-btn delete-btn" disabled>
              🗑️ Delete Account
            </button>
          </div>
          <p className="danger-note">
            Note: Deleting your account is permanent and cannot be undone.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;
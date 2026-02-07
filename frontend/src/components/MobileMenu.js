// frontend/src/components/MobileMenu.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

function MobileMenu({ isOpen, onClose }) {
  const { logout, userProfile } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose} />
      <div className="mobile-menu-container">
        <div className="mobile-menu-header">
          <h3>PULSE LEARN</h3>
          <button 
            className="close-menu" 
            onClick={onClose} 
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        
        <div className="mobile-user-info">
          <div className="mobile-user-avatar">👤</div>
          <div className="mobile-user-details">
            <h4>{userProfile?.displayName || "STUDENT"}</h4>
            <p className="subscription-badge-small">LVM1 - GOLD</p>
          </div>
        </div>
        
        <nav className="mobile-nav-menu">
          <a href="/dashboard" className="mobile-nav-item" onClick={onClose}>
            <span className="mobile-nav-icon">📊</span>
            Dashboard
          </a>
          <a href="/courses" className="mobile-nav-item" onClick={onClose}>
            <span className="mobile-nav-icon">📚</span>
            Learn
          </a>
          <a href="/cv-builder" className="mobile-nav-item" onClick={onClose}>
            <span className="mobile-nav-icon">💼</span>
            Career
          </a>
          <a href="/finance" className="mobile-nav-item" onClick={onClose}>
            <span className="mobile-nav-icon">💰</span>
            Finance
          </a>
          <a href="/admin" className="mobile-nav-item" onClick={onClose}>
            <span className="mobile-nav-icon">⚙️</span>
            Admin
          </a>
          <a href="/profile" className="mobile-nav-item" onClick={onClose}>
            <span className="mobile-nav-icon">👤</span>
            Profile
          </a>
          <button 
            className="mobile-nav-item logout-btn" 
            onClick={() => { logout(); onClose(); }}
          >
            <span className="mobile-nav-icon">🚪</span>
            Logout
          </button>
        </nav>
        
        <div className="mobile-menu-footer">
          <p className="mobile-version">v1.0.0</p>
        </div>
      </div>
    </>
  );
}

export default MobileMenu;
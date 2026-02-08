// frontend/src/components/DashboardLayout.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

function DashboardLayout({ children }) {
  const { userProfile, logout, isAdmin } = useAuth(); // ADD isAdmin from AuthContext
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle navigation
  const handleNavigation = useCallback((path) => {
    navigate(path);
    if (isMobile) setShowMobileNav(false);
  }, [navigate, isMobile]);

  const handleLogout = useCallback(() => {
    logout();
    if (isMobile) setShowMobileNav(false);
    navigate('/login');
  }, [logout, navigate, isMobile]);

  // Check if current route is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-container">
      {/* MOBILE HAMBURGER MENU */}
      {isMobile && (
        <button 
          className="mobile-menu-btn"
          onClick={() => setShowMobileNav(!showMobileNav)}
          aria-label="Toggle menu"
        >
          {showMobileNav ? '✕' : '☰'}
        </button>
      )}

      {/* SUBSCRIPTION BADGE */}
      <div className={`subscription-badge ${isMobile ? 'mobile-badge' : 'desktop-badge'}`}>
        <div className="pulse-learn-text">PULSE LEARN</div>
        <div className="subscription-level">LVL 1 - GOLD</div>
      </div>

      {/* MOBILE NAVIGATION OVERLAY */}
      {isMobile && showMobileNav && (
        <div className="mobile-nav-overlay" onClick={() => setShowMobileNav(false)}>
          <div className="mobile-nav-sidebar" onClick={e => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <div className="mobile-user-avatar">
                {userProfile?.displayName?.charAt(0) || 'M'}
              </div>
              <div className="mobile-user-info">
                <h3>{userProfile?.displayName || "MOSALA SERAI"}</h3>
                <p className="subscription-tag">LVL 1 - GOLD</p>
              </div>
              <button 
                className="close-nav-btn"
                onClick={() => setShowMobileNav(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            
            <nav className="mobile-nav-menu">
              <button 
                className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => handleNavigation('/dashboard')}
              >
                <span className="nav-icon">📊</span> Dashboard
              </button>
              <button 
                className={`mobile-nav-item ${isActive('/courses') ? 'active' : ''}`}
                onClick={() => handleNavigation('/courses')}
              >
                <span className="nav-icon">📚</span> Learn
              </button>
              <button 
                className={`mobile-nav-item ${isActive('/cv-builder') ? 'active' : ''}`}
                onClick={() => handleNavigation('/cv-builder')}
              >
                <span className="nav-icon">💼</span> Career
              </button>
              <button 
                className={`mobile-nav-item ${isActive('/finance') ? 'active' : ''}`}
                onClick={() => handleNavigation('/finance')}
              >
                <span className="nav-icon">💰</span> Finance
              </button>
              
              {/* ADD CRUNCHTIME HERE */}
              <button 
                className={`mobile-nav-item ${isActive('/crunch-time') ? 'active' : ''}`}
                onClick={() => handleNavigation('/crunch-time')}
              >
                <span className="nav-icon">⏰</span> CrunchTime
              </button>
              
              {/* ADMIN LINK - Only show if user is admin */}
              {isAdmin && (
                <button 
                  className={`mobile-nav-item ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => handleNavigation('/admin')}
                >
                  <span className="nav-icon">⚙️</span> Admin
                </button>
              )}
              
              <button 
                className={`mobile-nav-item ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => handleNavigation('/profile')}
              >
                <span className="nav-icon">👤</span> Profile
              </button>
              <button className="mobile-nav-item logout-btn" onClick={handleLogout}>
                <span className="nav-icon">🚪</span> Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <aside className="desktop-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="logo-icon">⚡</div>
              <h2>PULSE LEARN</h2>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigation('/dashboard')}
            >
              <span className="sidebar-icon">📊</span>
              <span className="sidebar-text">Dashboard</span>
            </button>
            <button 
              className={`sidebar-item ${isActive('/courses') ? 'active' : ''}`}
              onClick={() => handleNavigation('/courses')}
            >
              <span className="sidebar-icon">📚</span>
              <span className="sidebar-text">Learn</span>
            </button>
            <button 
              className={`sidebar-item ${isActive('/cv-builder') ? 'active' : ''}`}
              onClick={() => handleNavigation('/cv-builder')}
            >
              <span className="sidebar-icon">💼</span>
              <span className="sidebar-text">Career</span>
            </button>
            <button 
              className={`sidebar-item ${isActive('/finance') ? 'active' : ''}`}
              onClick={() => handleNavigation('/finance')}
            >
              <span className="sidebar-icon">💰</span>
              <span className="sidebar-text">Finance</span>
            </button>
            
            {/* ADD CRUNCHTIME HERE */}
            <button 
              className={`sidebar-item ${isActive('/crunch-time') ? 'active' : ''}`}
              onClick={() => handleNavigation('/crunch-time')}
            >
              <span className="sidebar-icon">⏰</span>
              <span className="sidebar-text">CrunchTime</span>
            </button>
            
            {/* ADMIN LINK - Only show if user is admin */}
            {isAdmin && (
              <button 
                className={`sidebar-item ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => handleNavigation('/admin')}
              >
                <span className="sidebar-icon">⚙️</span>
                <span className="sidebar-text">Admin</span>
              </button>
            )}
            
            <button 
              className={`sidebar-item ${isActive('/profile') ? 'active' : ''}`}
              onClick={() => handleNavigation('/profile')}
            >
              <span className="sidebar-icon">👤</span>
              <span className="sidebar-text">Profile</span>
            </button>
            <button className="sidebar-item logout-btn" onClick={handleLogout}>
              <span className="sidebar-icon">🚪</span>
              <span className="sidebar-text">Logout</span>
            </button>
          </nav>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        {/* Page-specific content */}
        <div className="page-content">
          {children}
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="mobile-bottom-nav">
            <button 
              className={`bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigation('/dashboard')}
            >
              <span className="bottom-nav-icon">📊</span>
              <span className="bottom-nav-label">Home</span>
            </button>
            <button 
              className={`bottom-nav-item ${isActive('/courses') ? 'active' : ''}`}
              onClick={() => handleNavigation('/courses')}
            >
              <span className="bottom-nav-icon">📚</span>
              <span className="bottom-nav-label">Learn</span>
            </button>
            
            {/* ADD CRUNCHTIME HERE */}
            <button 
              className={`bottom-nav-item ${isActive('/crunch-time') ? 'active' : ''}`}
              onClick={() => handleNavigation('/crunch-time')}
            >
              <span className="bottom-nav-icon">⏰</span>
              <span className="bottom-nav-label">Tutoring</span>
            </button>
            
            <button 
              className={`bottom-nav-item ${isActive('/cv-builder') ? 'active' : ''}`}
              onClick={() => handleNavigation('/cv-builder')}
            >
              <span className="bottom-nav-icon">💼</span>
              <span className="bottom-nav-label">Career</span>
            </button>
            <button 
              className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}
              onClick={() => handleNavigation('/profile')}
            >
              <span className="bottom-nav-icon">👤</span>
              <span className="bottom-nav-label">Profile</span>
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}

export default DashboardLayout;
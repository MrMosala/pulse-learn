// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { currentUser, logout, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">PULSE LEARN</div>
        </Link>

        <div className="nav-links">
          {!currentUser ? (
            <>
              <Link to="/" className="nav-btn">Home</Link>
              <Link to="/login" className="nav-btn">Login</Link>
              <Link to="/signup" className="nav-btn primary">Sign Up</Link>
            </>
          ) : (
            <>
              {userProfile && (
                <div className="level-badge">
                  LVL {userProfile.level || 1} - GOLD
                </div>
              )}
              <Link to="/dashboard" className="nav-btn">Dashboard</Link>
              <Link to="/courses" className="nav-btn">📚 Learn</Link>
              <Link to="/cv-builder" className="nav-btn">💼 Career</Link>
              <Link to="/finance" className="nav-btn">💰 Finance</Link>
              {isAdmin && (
                <Link to="/admin" className="nav-btn">👨‍💼 Admin</Link>
              )}
              <Link to="/profile" className="nav-btn">Profile</Link>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

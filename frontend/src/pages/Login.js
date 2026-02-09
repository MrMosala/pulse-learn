// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await login(email, password);
      navigate('/main-dashboard'); // Changed from '/dashboard'
    } catch (error) {
      console.error('Login error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Account temporarily disabled. Try resetting your password or try again later.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Please contact support.');
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email. Please use email/password login.');
      } else {
        setError('Failed to log in with Google. Please try again.');
      }
    }
    setLoading(false);
  }

  async function handlePasswordReset(e) {
    e.preventDefault();
    
    if (!resetEmail) {
      return setError('Please enter your email address');
    }
    
    try {
      setError('');
      setSuccess('');
      setResetLoading(true);
      
      await resetPassword(resetEmail);
      
      setSuccess(`✅ Password reset email sent to ${resetEmail}. Check your inbox (and spam folder).`);
      setResetEmail('');
      
      // Auto-hide reset form after success
      setTimeout(() => {
        setShowResetForm(false);
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many reset attempts. Please try again later.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    }
    setResetLoading(false);
  }

  return (
    <div className="page auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>WELCOME BACK</h2>
          <p className="auth-subtitle">Continue your success journey</p>

          {/* Success Message */}
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Password Reset Form */}
          {showResetForm ? (
            <div className="reset-form">
              <h3>Reset Your Password</h3>
              <p className="reset-instructions">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handlePasswordReset}>
                <div className="form-group">
                  <label>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="Enter your registered email"
                    disabled={resetLoading}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    disabled={resetLoading}
                  >
                    {resetLoading ? 'SENDING...' : 'SEND RESET LINK'}
                  </button>
                  
                  <button 
                    type="button" 
                    className="secondary-btn"
                    onClick={() => {
                      setShowResetForm(false);
                      setError('');
                      setSuccess('');
                    }}
                    disabled={resetLoading}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Regular Login Form */
            <>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="student@university.ac.za"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <div className="password-header">
                    <label>PASSWORD</label>
                    <button 
                      type="button"
                      className="forgot-password-btn"
                      onClick={() => setShowResetForm(true)}
                      disabled={loading}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-btn" 
                  disabled={loading}
                >
                  {loading ? 'LOGGING IN...' : 'LOGIN'}
                </button>
              </form>

              <div className="divider">
                <span>OR</span>
              </div>

              <button 
                onClick={handleGoogleLogin} 
                className="google-btn"
                disabled={loading}
              >
                <span>Continue with Google</span>
              </button>

              <p className="auth-footer">
                Don't have an account?{' '}
                <Link to="/signup">Sign up here</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
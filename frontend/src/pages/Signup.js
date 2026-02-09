// frontend/src/pages/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmailForPlatform } from '../utils/emailValidator';
import '../styles/auth.css';

// ADD THIS HELPER FUNCTION
const getUserTypeGreeting = (userType, firstName) => {
  const greetings = {
    student: `Welcome, ${firstName}! 🎓 Ready to ace your studies?`,
    professional: `Welcome aboard, ${firstName}! 💼 Let's advance your career.`,
    learner: `Welcome, ${firstName}! 📚 Your learning journey begins now.`
  };
  return greetings[userType] || `Welcome, ${firstName}! Your account is ready.`;
};

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'auto',
    university: '',
    profession: '',
    course: '',
    studentNumber: '',
    phoneNumber: '',
    acceptTerms: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValidation, setEmailValidation] = useState(null);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Real-time email validation
    if (name === 'email' && value.trim()) {
      const validation = validateEmailForPlatform(value, formData.userType);
      setEmailValidation(validation);
      
      // Auto-suggest university if educational email
      if (validation.institution && !formData.university) {
        setFormData(prev => ({
          ...prev,
          university: validation.institution
        }));
      }
      
      // Auto-suggest user type
      if (validation.userType && formData.userType === 'auto') {
        setFormData(prev => ({
          ...prev,
          userType: validation.userType
        }));
      }
    }
  }

  function handleUserTypeSelect(userType) {
    setFormData({
      ...formData,
      userType
    });
    
    // Re-validate email with new user type
    if (formData.email) {
      const validation = validateEmailForPlatform(formData.email, userType);
      setEmailValidation(validation);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (!formData.acceptTerms) {
      return setError('Please accept the terms and conditions');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    // Validate email format
    if (emailValidation && !emailValidation.isValid) {
      return setError(`Email validation failed: ${emailValidation.message}`);
    }

    // Show warnings but allow continuation
    if (emailValidation?.warnings?.length > 0) {
      const warningMsg = emailValidation.warnings.join('\n');
      const shouldContinue = window.confirm(
        `${warningMsg}\n\nDo you want to continue with this email?`
      );
      if (!shouldContinue) return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      // Prepare complete user data
      const userProfileData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: emailValidation?.userType || formData.userType,
        category: emailValidation?.category || 'general',
        institution: formData.university || emailValidation?.institution || '',
        profession: formData.profession || '',
        studentNumber: formData.studentNumber,
        course: formData.course,
        university: formData.university,  // ADD THIS
        phoneNumber: formData.phoneNumber || '',
        isEducational: emailValidation?.isEducational || false,
        isProfessional: emailValidation?.isProfessional || false,
        registrationSource: 'website',
        profileComplete: false
      };
      
      // Create user with complete data (only ONE call needed)
      await signup(formData.email, formData.password, userProfileData);
      
      // Show success message
      const greeting = getUserTypeGreeting(
        emailValidation?.userType || formData.userType || 'learner',
        formData.firstName
      );
      
      setSuccess(`✅ Account created successfully! ${greeting}`);
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/main-dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Signup error:', error);
      
      // User-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please login instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (error.message.includes('Failed to save')) {
        setError('Account created but profile setup failed. Please contact support.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
    
    setLoading(false);
  }

  return (
    <div className="page auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>JOIN THE ELITE</h2>
          <p className="auth-subtitle">Your transformation starts now</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>FIRST NAME</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Thabo"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>LAST NAME</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Nkosi"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="student@university.ac.za"
                disabled={loading}
              />
            </div>

            {emailValidation && (
              <div className={`validation-feedback ${emailValidation.isValid ? 'valid' : 'invalid'}`}>
                <span className="validation-icon">
                  {emailValidation.isValid ? '✅' : '⚠️'}
                </span>
                <span className="validation-text">
                  {emailValidation.message}
                  {emailValidation.institution && (
                    <span className="institution-name"> • {emailValidation.institution}</span>
                  )}
                </span>
              </div>
            )}

            <div className="form-group">
              <label>I AM A:</label>
              <div className="user-type-selection">
                {[
                  { id: 'auto', label: '🔍 Auto-detect', description: 'Let us detect from email' },
                  { id: 'student', label: '🎓 Student', description: 'University/College student' },
                  { id: 'professional', label: '💼 Professional', description: 'Working professional' },
                  { id: 'learner', label: '👤 General Learner', description: 'Lifelong learner' }
                ].map(type => (
                  <div 
                    key={type.id}
                    className={`user-type-option ${formData.userType === type.id ? 'selected' : ''}`}
                    onClick={() => handleUserTypeSelect(type.id)}
                  >
                    <div className="type-icon">{type.label.split(' ')[0]}</div>
                    <div className="type-content">
                      <div className="type-label">{type.label.split(' ').slice(1).join(' ')}</div>
                      <div className="type-description">{type.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {formData.userType === 'student' && (
              <>
                <div className="form-group">
                  <label>UNIVERSITY</label>
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select your university...</option>
                    <option value="Nelson Mandela University">Nelson Mandela University</option>
                    <option value="University of Limpopo">University of Limpopo</option>
                    <option value="University of Cape Town">University of Cape Town</option>
                    <option value="University of Pretoria">University of Pretoria</option>
                    <option value="University of Witwatersrand">University of Witwatersrand</option>
                    <option value="Stellenbosch University">Stellenbosch University</option>
                    <option value="Rhodes University">Rhodes University</option>
                    <option value="University of Johannesburg">University of Johannesburg</option>
                    <option value="UNISA">UNISA (Distance Learning)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>STUDENT NUMBER</label>
                    <input
                      type="text"
                      name="studentNumber"
                      value={formData.studentNumber}
                      onChange={handleChange}
                      required
                      placeholder="202012345"
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>COURSE / PROGRAM</label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select your program...</option>
                      <option value="BSc Mathematics">BSc Mathematics</option>
                      <option value="BSc Applied Mathematics">BSc Applied Mathematics</option>
                      <option value="BSc Computer Science">BSc Computer Science</option>
                      <option value="BEng Mechanical Engineering">BEng Mechanical Engineering</option>
                      <option value="BEng Electrical Engineering">BEng Electrical Engineering</option>
                      <option value="BSc Physics">BSc Physics</option>
                      <option value="BSc Statistics">BSc Statistics</option>
                      <option value="BCom Accounting">BCom Accounting</option>
                      <option value="BCom Economics">BCom Economics</option>
                      <option value="BA Education">BA Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {formData.userType === 'professional' && (
              <div className="form-group">
                <label>PROFESSION / COMPANY</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="e.g., Software Developer at Google"
                  disabled={loading}
                />
                <small className="form-hint">Optional, but helps personalize your experience</small>
              </div>
            )}

            <div className="form-group">
              <label>PHONE NUMBER (Optional)</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+27 12 345 6789"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  minLength="6"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group terms-acceptance">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <span>
                  I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> 
                  and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
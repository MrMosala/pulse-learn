// frontend/src/pages/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

function Signup() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentNumber: '',
    university: '',
    course: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(
        formData.email,
        formData.password,
        formData.displayName,
        formData.studentNumber,
        formData.university,
        formData.course
      );
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use');
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>FULL NAME</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                placeholder="e.g., Thabo Nkosi"
                disabled={loading}
              />
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

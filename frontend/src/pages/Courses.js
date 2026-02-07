// frontend/src/pages/Courses.js
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('isPublished', '==', true));
      const querySnapshot = await getDocs(q);
      
      const coursesData = [];
      querySnapshot.forEach((doc) => {
        coursesData.push({ id: doc.id, ...doc.data() });
      });
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="courses-page-content">
        <div className="page-header">
          <h1>📚 All Courses</h1>
          <p>{courses.length} courses available • Continue your learning journey</p>
        </div>
        
        {userProfile?.subscriptionStatus !== 'active' && (
          <div className="subscription-alert">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <strong>Upgrade to access all video lessons</strong>
              <p>Get unlimited access to all courses and features</p>
            </div>
            <a href="/subscribe" className="upgrade-btn">Subscribe Now</a>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No courses available yet</h3>
            <p>Check back soon for new courses!</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-header">
                  <div className="course-icon">{course.icon || '📚'}</div>
                  <div className="course-badge">
                    {course.difficulty || 'Intermediate'}
                  </div>
                </div>
                
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="course-description">
                    {course.description || 'Master this subject with comprehensive lessons'}
                  </p>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <span className="meta-icon">📚</span>
                      <span>{course.lessonCount || 12} lessons</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <span>{course.duration || '8h'} total</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">⭐</span>
                      <span>{course.rating || '4.8'}</span>
                    </div>
                  </div>
                  
                  <div className="course-progress">
                    <div className="progress-info">
                      <span className="progress-label">Your Progress</span>
                      <span className="progress-value">{course.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button className="course-action-btn">
                    {course.progress > 0 ? 'Continue' : 'Start Course'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats Section */}
        <div className="courses-stats">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-number">{courses.length}</div>
            <div className="stat-label">Available Courses</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-number">48</div>
            <div className="stat-label">Hours of Content</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">1,234</div>
            <div className="stat-label">Active Learners</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-number">4.8</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Courses;
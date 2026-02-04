// frontend/src/pages/Courses.js
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

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

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="page courses-page">
      <h1 className="section-title">📚 All Courses</h1>
      
      {userProfile?.subscriptionStatus !== 'active' && (
        <div className="alert alert-warning">
          ⚠️ Upgrade to access all video lessons. <a href="/subscribe">Subscribe now</a>
        </div>
      )}

      <div className="courses-grid">
        {courses.length === 0 ? (
          <div className="empty-state">
            <p>No courses available yet. Check back soon!</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="course-card glass-card">
              <div className="course-image">
                {course.icon || '📚'}
              </div>
              <div className="course-content">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-meta">
                  <span>📚 {course.lessonCount || 0} lessons</span>
                  <span>⭐ {course.rating || '4.8'}</span>
                </div>
                <button className="course-btn">View Course</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Courses;

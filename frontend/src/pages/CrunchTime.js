// frontend/src/pages/CrunchTime.js
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function CrunchTime() {
  const tutoringSessions = [
    { id: 1, subject: 'Mathematics', tutor: 'Dr. Smith', duration: '2 hours', price: 'R299', icon: '🧮' },
    { id: 2, subject: 'Data Science', tutor: 'Prof. Johnson', duration: '2 hours', price: 'R349', icon: '💻' },
    { id: 3, subject: 'Statistics', tutor: 'Ms. Williams', duration: '2 hours', price: 'R279', icon: '📊' },
    { id: 4, subject: 'Calculus', tutor: 'Dr. Brown', duration: '2 hours', price: 'R319', icon: '🔢' },
  ];

  return (
    <DashboardLayout>
      <div className="crunchtime-page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>⏰ Crunch Time Tutoring</h1>
          <p>Book 2-hour intensive tutoring sessions with expert tutors</p>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-card-icon">🎯</div>
          <div className="info-card-content">
            <h3>How It Works</h3>
            <p>Book a 2-hour focused session with an expert tutor to master difficult concepts, prepare for exams, or get help with specific topics.</p>
          </div>
        </div>

        {/* Available Sessions */}
        <div className="sessions-section">
          <div className="section-header">
            <h2>📚 Available Sessions</h2>
            <span className="sessions-count">{tutoringSessions.length} sessions</span>
          </div>

          <div className="sessions-grid">
            {tutoringSessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-icon">{session.icon}</div>
                  <div className="session-subject">{session.subject}</div>
                </div>
                
                <div className="session-details">
                  <div className="detail-item">
                    <span className="detail-label">Tutor</span>
                    <span className="detail-value">{session.tutor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{session.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price</span>
                    <span className="detail-value price">{session.price}</span>
                  </div>
                </div>

                <button className="book-btn">
                  📅 Book Session
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bookings-section">
          <h2>📋 Your Upcoming Sessions</h2>
          <div className="empty-bookings">
            <div className="empty-icon">📭</div>
            <h3>No upcoming sessions</h3>
            <p>Book your first tutoring session above!</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h2>🔄 How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Choose Subject</h3>
                <p>Select from available subjects and tutors</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Pick Time Slot</h3>
                <p>Choose a convenient 2-hour time slot</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Join Session</h3>
                <p>Connect via video call with your tutor</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Learn & Excel</h3>
                <p>Get personalized attention and master concepts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CrunchTime;
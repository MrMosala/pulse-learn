// frontend/src/pages/ProfessionalDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/professional-dashboard.css';

// Professional motivational quotes
const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Your career is a marathon, not a sprint. Pace yourself and keep growing.", author: "Unknown" },
  { text: "The best investment you can make is in yourself.", author: "Warren Buffett" }
];

// Circular progress ring for professional stats
function ProRing({ value, max, label, displayValue, loading }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  let numericValue = 0;
  let numericMax = max;
  if (typeof value === 'string' && value.includes('%')) {
    numericValue = parseInt(value);
    numericMax = 100;
  } else {
    numericValue = Number(value) || 0;
  }

  const percent = Math.min((numericValue / numericMax) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="pro-stat-card">
      <div className="pro-stat-ring">
        <svg viewBox="0 0 80 80">
          <defs>
            <linearGradient id="navyGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#f0d060" />
            </linearGradient>
          </defs>
          <circle className="ring-bg" cx="40" cy="40" r={radius} />
          <circle
            className="ring-fill"
            cx="40"
            cy="40"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={loading ? circumference : offset}
          />
        </svg>
        <div className="pro-stat-number">
          {loading ? '...' : (displayValue !== undefined ? displayValue : value)}
        </div>
      </div>
      <div className="pro-stat-label">{label}</div>
    </div>
  );
}

function ProfessionalDashboard() {
  const { userProfile, currentUser } = useAuth();
  const [dailyQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  const [currentDate] = useState(() => {
    return new Date().toLocaleDateString('en-ZA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  // Real stats from Firestore
  const [stats, setStats] = useState({
    cvRequests: 0,
    sessions: 0,
    completedSessions: 0,
    assignments: 0,
    completedAssignments: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch real professional stats from Firestore
  useEffect(() => {
    const fetchProfessionalStats = async () => {
      if (!currentUser?.uid) return;

      try {
        setStatsLoading(true);

        // Fetch all stats in parallel
        const [cvSnap, sessionsSnap, assignmentsSnap] = await Promise.all([
          getDocs(
            query(collection(db, 'cv_requests'), where('userId', '==', currentUser.uid))
          ).catch(() => ({ docs: [] })),

          getDocs(
            query(collection(db, 'crunchtime_sessions'), where('userId', '==', currentUser.uid))
          ).catch(() => ({ docs: [] })),

          getDocs(
            query(collection(db, 'assignments'), where('userId', '==', currentUser.uid))
          ).catch(() => ({ docs: [] }))
        ]);

        const allSessions = sessionsSnap.docs.map(doc => doc.data());
        const completedSessions = allSessions.filter(s => s.status === 'completed');
        
        const allAssignments = assignmentsSnap.docs.map(doc => doc.data());
        const completedAssignments = allAssignments.filter(a => a.status === 'completed');

        setStats({
          cvRequests: cvSnap.docs.length,
          sessions: sessionsSnap.docs.length,
          completedSessions: completedSessions.length,
          assignments: assignmentsSnap.docs.length,
          completedAssignments: completedAssignments.length
        });

        // Build recent activities from real data
        const activities = [];

        // Add CV activities
        cvSnap.docs.forEach(doc => {
          const data = doc.data();
          activities.push({
            icon: '📄',
            title: `CV Request: ${data.targetRole || data.jobTitle || 'Professional CV'}`,
            time: data.createdAt?.toDate?.() || new Date(data.createdAt) || null,
            type: 'cv'
          });
        });

        // Add session activities
        sessionsSnap.docs.forEach(doc => {
          const data = doc.data();
          activities.push({
            icon: '🎯',
            title: `Coaching: ${data.subject || data.topic || 'Session'}${data.subtopic ? ' - ' + data.subtopic : ''}`,
            time: data.createdAt?.toDate?.() || new Date(data.createdAt) || null,
            type: 'session'
          });
        });

        // Add assignment activities
        assignmentsSnap.docs.forEach(doc => {
          const data = doc.data();
          activities.push({
            icon: '📝',
            title: `Assignment: ${data.title || data.subject || 'Submitted'}`,
            time: data.createdAt?.toDate?.() || new Date(data.createdAt) || null,
            type: 'assignment'
          });
        });

        // Sort by date (newest first) and take top 5
        activities.sort((a, b) => {
          const dateA = a.time instanceof Date ? a.time : new Date(0);
          const dateB = b.time instanceof Date ? b.time : new Date(0);
          return dateB - dateA;
        });

        setRecentActivities(activities.slice(0, 5));

      } catch (error) {
        console.error('Error fetching professional stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchProfessionalStats();
  }, [currentUser]);

  // Format relative time
  const formatTimeAgo = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return 'Recently';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  };

  // Career progress based on real activity
  const totalActivities = stats.cvRequests + stats.sessions + stats.assignments;
  const careerProgress = Math.min(Math.round((totalActivities / 20) * 100), 100);

  return (
    <DashboardLayout>
      <div className="professional-dashboard">

        {/* ===== WELCOME BANNER ===== */}
        <div className="pro-welcome-banner">
          <div className="pro-top-row">
            <div className="pro-greeting">
              <span className="greeting-label">Welcome</span>
              <h1>
                <span className="pro-name">
                  {userProfile?.displayName?.toUpperCase() || userProfile?.firstName?.toUpperCase() || "PROFESSIONAL"} 💼
                </span>
                Let's advance your career.
              </h1>
            </div>
            <div className="pro-status-badge">
              ⭐ {currentDate}
            </div>
          </div>

          <div className="pro-info-row">
            <div className="pro-info-card">
              <div className="pro-info-label">Profession</div>
              <div className="pro-info-value">{userProfile?.profession || userProfile?.jobTitle || "Professional"}</div>
            </div>
            <div className="pro-info-card">
              <div className="pro-info-label">Account Type</div>
              <div className="pro-info-value gold-accent">💼 Professional</div>
            </div>
            <div className="pro-info-card">
              <div className="pro-info-label">Industry</div>
              <div className="pro-info-value">{userProfile?.industry || userProfile?.field || "Not Set"}</div>
            </div>
            <div className="pro-info-card">
              <div className="pro-info-label">Career Level</div>
              <div className="pro-info-value gold-accent">
                {userProfile?.careerLevel || userProfile?.level || "1"} ★
              </div>
            </div>
          </div>
        </div>

        {/* ===== CAREER PROGRESS ===== */}
        <div className="pro-career-section">
          <div className="pro-career-icon">📈</div>
          <div className="pro-career-details">
            <div className="pro-career-top">
              <div className="pro-career-title">Career Progress</div>
              <div className="pro-career-count">{careerProgress}% Active</div>
            </div>
            <div className="pro-bar-track">
              <div
                className="pro-bar-fill"
                style={{ width: `${careerProgress}%` }}
              />
            </div>
            <div className="pro-career-subtitle">
              {totalActivities} career actions completed — keep building momentum!
            </div>
          </div>
        </div>

        {/* ===== CAREER ACTIONS ===== */}
        <div className="pro-section-title">
          <span className="title-bar"></span>
          Career Actions
        </div>

        <div className="pro-actions-grid">
          <button className="pro-action-card" onClick={() => window.location.href = '/cv-builder'}>
            <div className="pro-action-icon navy">📄</div>
            <div>
              <div className="pro-action-title">Advanced CV Builder</div>
              <div className="pro-action-desc">Tailor CVs for specific roles</div>
            </div>
          </button>

          <button className="pro-action-card" onClick={() => window.location.href = '/assignments'}>
            <div className="pro-action-icon gold">📝</div>
            <div>
              <div className="pro-action-title">Submit Work</div>
              <div className="pro-action-desc">Upload assignments & projects</div>
            </div>
          </button>

          <button className="pro-action-card" onClick={() => window.location.href = '/courses'}>
            <div className="pro-action-icon slate">📚</div>
            <div>
              <div className="pro-action-title">Skill Development</div>
              <div className="pro-action-desc">Upskill with advanced courses</div>
            </div>
          </button>

          <button className="pro-action-card" onClick={() => window.location.href = '/finance'}>
            <div className="pro-action-icon teal">💰</div>
            <div>
              <div className="pro-action-title">Financial Tools</div>
              <div className="pro-action-desc">Manage your career finances</div>
            </div>
          </button>
        </div>

        {/* ===== REAL PROFESSIONAL METRICS ===== */}
        <div className="pro-section-title">
          <span className="title-bar"></span>
          Your Professional Metrics
        </div>

        <div className="pro-stats-grid">
          <ProRing
            value={stats.cvRequests}
            max={Math.max(stats.cvRequests, 5)}
            label="CVs Tailored"
            displayValue={stats.cvRequests}
            loading={statsLoading}
          />
          <ProRing
            value={stats.sessions}
            max={Math.max(stats.sessions, 5)}
            label="Coaching Sessions"
            displayValue={stats.sessions}
            loading={statsLoading}
          />
          <ProRing
            value={stats.assignments}
            max={Math.max(stats.assignments, 10)}
            label="Projects Submitted"
            displayValue={stats.assignments}
            loading={statsLoading}
          />
          <ProRing
            value={careerProgress}
            max={100}
            label="Career Progress"
            displayValue={`${careerProgress}%`}
            loading={statsLoading}
          />
        </div>

        {/* ===== REAL RECENT ACTIVITIES ===== */}
        <div className="pro-section-title">
          <span className="title-bar"></span>
          Recent Career Activities
        </div>

        <div className="pro-activities-section">
          {statsLoading ? (
            <div className="pro-activity-empty">Loading activities...</div>
          ) : recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div className="pro-activity-item" key={index}>
                <div className="pro-activity-dot"></div>
                <div className="pro-activity-icon">{activity.icon}</div>
                <div className="pro-activity-content">
                  <div className="pro-activity-title">{activity.title}</div>
                  <div className="pro-activity-time">{formatTimeAgo(activity.time)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="pro-activity-empty">
              No activities yet — start by building a CV or booking a coaching session!
            </div>
          )}
        </div>

        {/* ===== MOTIVATIONAL QUOTE ===== */}
        <div className="pro-motivation">
          <div className="pro-motivation-icon">🏆</div>
          <div className="pro-motivation-text">
            <div className="quote">"{dailyQuote.text}"</div>
            <div className="author">— {dailyQuote.author}</div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default ProfessionalDashboard;
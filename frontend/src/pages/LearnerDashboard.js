// frontend/src/pages/LearnerDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/learner-dashboard.css';

// Growth-focused motivational quotes
const quotes = [
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { text: "Anyone who stops learning is old, whether at twenty or eighty.", author: "Henry Ford" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { text: "Education is not preparation for life; education is life itself.", author: "John Dewey" }
];

// Circular progress ring for learner stats
function LearnRing({ value, max, label, displayValue, loading }) {
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
    <div className="learn-stat-card">
      <div className="learn-stat-ring">
        <svg viewBox="0 0 80 80">
          <defs>
            <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
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
        <div className="learn-stat-number">
          {loading ? '...' : (displayValue !== undefined ? displayValue : value)}
        </div>
      </div>
      <div className="learn-stat-label">{label}</div>
    </div>
  );
}

function LearnerDashboard() {
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
    assignments: 0,
    completedAssignments: 0,
    cvRequests: 0,
    sessions: 0,
    completedSessions: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch real learner stats from Firestore
  useEffect(() => {
    const fetchLearnerStats = async () => {
      if (!currentUser?.uid) return;

      try {
        setStatsLoading(true);

        const [assignmentsSnap, cvSnap, sessionsSnap] = await Promise.all([
          getDocs(
            query(collection(db, 'assignments'), where('userId', '==', currentUser.uid))
          ).catch(() => ({ docs: [] })),

          getDocs(
            query(collection(db, 'cv_requests'), where('userId', '==', currentUser.uid))
          ).catch(() => ({ docs: [] })),

          getDocs(
            query(collection(db, 'crunchtime_sessions'), where('userId', '==', currentUser.uid))
          ).catch(() => ({ docs: [] }))
        ]);

        const allAssignments = assignmentsSnap.docs.map(doc => doc.data());
        const completedAssignments = allAssignments.filter(a => a.status === 'completed');

        const allSessions = sessionsSnap.docs.map(doc => doc.data());
        const completedSessions = allSessions.filter(s => s.status === 'completed');

        setStats({
          assignments: assignmentsSnap.docs.length,
          completedAssignments: completedAssignments.length,
          cvRequests: cvSnap.docs.length,
          sessions: sessionsSnap.docs.length,
          completedSessions: completedSessions.length
        });

      } catch (error) {
        console.error('Error fetching learner stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchLearnerStats();
  }, [currentUser]);

  // Calculate learning progress based on real activity
  const totalActivities = stats.assignments + stats.cvRequests + stats.sessions;
  const learningProgress = Math.min(Math.round((totalActivities / 15) * 100), 100);

  // Completion rate
  const completionRate = stats.assignments > 0
    ? Math.round((stats.completedAssignments / stats.assignments) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="learner-dashboard">

        {/* ===== WELCOME BANNER ===== */}
        <div className="learn-welcome-banner">
          <div className="learn-top-row">
            <div className="learn-greeting">
              <span className="greeting-label">Welcome back</span>
              <h1>
                <span className="learner-name">
                  {userProfile?.displayName?.toUpperCase() || userProfile?.firstName?.toUpperCase() || "LEARNER"} 🌱
                </span>
                Keep growing every day!
              </h1>
            </div>
            <div className="learn-date-badge">
              🗓️ {currentDate}
            </div>
          </div>

          <div className="learn-info-row">
            <div className="learn-info-card">
              <div className="learn-info-label">Learner Type</div>
              <div className="learn-info-value">👤 {userProfile?.learnerType || "General Learner"}</div>
            </div>
            <div className="learn-info-card">
              <div className="learn-info-label">Learning Path</div>
              <div className="learn-info-value">{userProfile?.learningPath || userProfile?.interest || "Self-Directed"}</div>
            </div>
            <div className="learn-info-card">
              <div className="learn-info-label">Level</div>
              <div className="learn-info-value teal-accent">
                {userProfile?.level || "1"} ★
              </div>
            </div>
            <div className="learn-info-card">
              <div className="learn-info-label">XP Earned</div>
              <div className="learn-info-value teal-accent">
                {userProfile?.xp || 0} ⚡
              </div>
            </div>
          </div>
        </div>

        {/* ===== LEARNING PROGRESS ===== */}
        <div className="learn-progress-section">
          <div className="learn-progress-icon">🌿</div>
          <div className="learn-progress-details">
            <div className="learn-progress-top">
              <div className="learn-progress-title">Learning Progress</div>
              <div className="learn-progress-count">{learningProgress}% Active</div>
            </div>
            <div className="learn-bar-track">
              <div
                className="learn-bar-fill"
                style={{ width: `${learningProgress}%` }}
              />
            </div>
            <div className="learn-progress-subtitle">
              {totalActivities} learning activities completed — you're doing great!
            </div>
          </div>
        </div>

        {/* ===== QUICK ACTIONS ===== */}
        <div className="learn-section-title">
          <span className="title-leaf"></span>
          Learning Actions
        </div>

        <div className="learn-actions-grid">
          <button className="learn-action-card" onClick={() => window.location.href = '/courses'}>
            <div className="learn-action-icon green">📚</div>
            <div>
              <div className="learn-action-title">Browse Courses</div>
              <div className="learn-action-desc">Explore learning materials</div>
            </div>
          </button>

          <button className="learn-action-card" onClick={() => window.location.href = '/assignments'}>
            <div className="learn-action-icon teal">📝</div>
            <div>
              <div className="learn-action-title">Submit Work</div>
              <div className="learn-action-desc">Upload assignments & tasks</div>
            </div>
          </button>

          <button className="learn-action-card" onClick={() => window.location.href = '/crunch-time'}>
            <div className="learn-action-icon sky">⏰</div>
            <div>
              <div className="learn-action-title">Book Tutoring</div>
              <div className="learn-action-desc">Get expert help</div>
            </div>
          </button>

          <button className="learn-action-card" onClick={() => window.location.href = '/cv-builder'}>
            <div className="learn-action-icon lime">💼</div>
            <div>
              <div className="learn-action-title">Build CV</div>
              <div className="learn-action-desc">Create your first CV</div>
            </div>
          </button>
        </div>

        {/* ===== REAL LEARNING STATS ===== */}
        <div className="learn-section-title">
          <span className="title-leaf"></span>
          Your Learning Journey
        </div>

        <div className="learn-stats-grid">
          <LearnRing
            value={stats.assignments}
            max={Math.max(stats.assignments, 10)}
            label="Assignments"
            displayValue={stats.assignments}
            loading={statsLoading}
          />
          <LearnRing
            value={stats.sessions}
            max={Math.max(stats.sessions, 5)}
            label="Tutor Sessions"
            displayValue={stats.sessions}
            loading={statsLoading}
          />
          <LearnRing
            value={stats.cvRequests}
            max={Math.max(stats.cvRequests, 5)}
            label="CVs Created"
            displayValue={stats.cvRequests}
            loading={statsLoading}
          />
          <LearnRing
            value={completionRate}
            max={100}
            label="Completion Rate"
            displayValue={`${completionRate}%`}
            loading={statsLoading}
          />
        </div>

        {/* ===== MOTIVATIONAL QUOTE ===== */}
        <div className="learn-motivation">
          <div className="learn-motivation-icon">🌟</div>
          <div className="learn-motivation-text">
            <div className="quote">"{dailyQuote.text}"</div>
            <div className="author">— {dailyQuote.author}</div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default LearnerDashboard;
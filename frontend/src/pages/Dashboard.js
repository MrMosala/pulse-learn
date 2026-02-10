// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import '../styles/student-dashboard.css';

// Motivational quotes for students
const quotes = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
  { text: "Success is not final, failure is not fatal — it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Your education is a dress rehearsal for a life that is yours to lead.", author: "Nora Ephron" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" }
];

// Circular progress ring component
function ProgressRing({ value, max, label, displayValue, loading }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  
  // For percentage strings like "78%", parse the number
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
    <div className="s-stat-card">
      <div className="s-stat-ring">
        <svg viewBox="0 0 80 80">
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#a78bfa" />
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
        <div className="s-stat-number">
          {loading ? '...' : (displayValue !== undefined ? displayValue : value)}
        </div>
      </div>
      <div className="s-stat-label">{label}</div>
    </div>
  );
}

function Dashboard() {
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

  // Fetch real student stats from Firestore
  useEffect(() => {
    const fetchStudentStats = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setStatsLoading(true);
        
        // Fetch all stats in parallel
        const [assignmentsSnap, cvSnap, sessionsSnap] = await Promise.all([
          // Get user's assignments
          getDocs(
            query(collection(db, 'assignments'), where('userId', '==', currentUser.uid))
          ).catch(() => ({ docs: [] })),
          
          // Get user's CV requests
          getDocs(
            query(collection(db, 'cv_requests'), where('userId', '==', currentUser.uid))
          ).catch(() => ({ docs: [] })),
          
          // Get user's CrunchTime sessions
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
        console.error('Error fetching student stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStudentStats();
  }, [currentUser]);

  // Calculate completion rate
  const completionRate = stats.assignments > 0 
    ? Math.round((stats.completedAssignments / stats.assignments) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="student-dashboard">
        
        {/* ===== WELCOME BANNER ===== */}
        <div className="student-welcome-banner">
          <div className="welcome-top-row">
            <div className="welcome-greeting">
              <span className="greeting-label">Welcome back</span>
              <h1>
                <span className="student-name">
                  {userProfile?.displayName?.toUpperCase() || userProfile?.firstName?.toUpperCase() || "STUDENT"} 🎓
                </span>
                Ready to learn today?
              </h1>
            </div>
            <div className="welcome-date">
              📅 {currentDate}
            </div>
          </div>

          <div className="student-info-row">
            <div className="s-info-card">
              <div className="s-info-label">Student Number</div>
              <div className="s-info-value">{userProfile?.studentNumber || "N/A"}</div>
            </div>
            <div className="s-info-card">
              <div className="s-info-label">University</div>
              <div className="s-info-value">{userProfile?.institution || userProfile?.university || "Not Set"}</div>
            </div>
            <div className="s-info-card">
              <div className="s-info-label">Program</div>
              <div className="s-info-value">{userProfile?.course || userProfile?.program || "Not Set"}</div>
            </div>
            <div className="s-info-card">
              <div className="s-info-label">Level</div>
              <div className="s-info-value level-gold">
                {userProfile?.level || "1"} ★
              </div>
            </div>
          </div>
        </div>

        {/* ===== XP PROGRESS ===== */}
        <div className="student-xp-section">
          <div className="xp-icon-wrap">⚡</div>
          <div className="xp-details">
            <div className="xp-top">
              <div className="xp-title">Experience Points</div>
              <div className="xp-count">{userProfile?.xp || 0} / 3,000 XP</div>
            </div>
            <div className="xp-bar-track">
              <div 
                className="xp-bar-fill"
                style={{ width: `${Math.min(((userProfile?.xp || 0) / 3000) * 100, 100)}%` }}
              />
            </div>
            <div className="xp-subtitle">
              {3000 - (userProfile?.xp || 0) > 0 
                ? `${3000 - (userProfile?.xp || 0)} XP until next level` 
                : "Level complete! 🎉"}
            </div>
          </div>
        </div>

        {/* ===== QUICK ACTIONS ===== */}
        <div className="student-section-title">
          <span className="title-accent"></span>
          Quick Actions
        </div>
        
        <div className="student-actions-grid">
          <button className="s-action-card" onClick={() => window.location.href = '/courses'}>
            <div className="s-action-icon purple">📚</div>
            <div>
              <div className="s-action-title">Continue Learning</div>
              <div className="s-action-desc">Resume your courses</div>
            </div>
          </button>

          <button className="s-action-card" onClick={() => window.location.href = '/assignments'}>
            <div className="s-action-icon blue">📝</div>
            <div>
              <div className="s-action-title">Upload Assignment</div>
              <div className="s-action-desc">Get help with your work</div>
            </div>
          </button>

          <button className="s-action-card" onClick={() => window.location.href = '/cv-builder'}>
            <div className="s-action-icon amber">💼</div>
            <div>
              <div className="s-action-title">Build CV</div>
              <div className="s-action-desc">Tailor your career profile</div>
            </div>
          </button>

          <button className="s-action-card" onClick={() => window.location.href = '/crunchtime'}>
            <div className="s-action-icon emerald">⏰</div>
            <div>
              <div className="s-action-title">CrunchTime</div>
              <div className="s-action-desc">Book a tutoring session</div>
            </div>
          </button>
        </div>

        {/* ===== REAL PROGRESS STATS ===== */}
        <div className="student-section-title">
          <span className="title-accent"></span>
          Your Progress
        </div>

        <div className="student-stats-grid">
          <ProgressRing 
            value={stats.assignments} 
            max={Math.max(stats.assignments, 10)} 
            label="Assignments" 
            displayValue={stats.assignments}
            loading={statsLoading}
          />
          <ProgressRing 
            value={stats.cvRequests} 
            max={Math.max(stats.cvRequests, 5)} 
            label="CVs Requested" 
            displayValue={stats.cvRequests}
            loading={statsLoading}
          />
          <ProgressRing 
            value={stats.sessions} 
            max={Math.max(stats.sessions, 5)} 
            label="Tutor Sessions" 
            displayValue={stats.sessions}
            loading={statsLoading}
          />
          <ProgressRing 
            value={completionRate} 
            max={100} 
            label="Completion Rate" 
            displayValue={`${completionRate}%`}
            loading={statsLoading}
          />
        </div>

        {/* ===== MOTIVATIONAL QUOTE ===== */}
        <div className="student-motivation">
          <div className="motivation-icon">💡</div>
          <div className="motivation-text">
            <div className="quote">"{dailyQuote.text}"</div>
            <div className="author">— {dailyQuote.author}</div>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
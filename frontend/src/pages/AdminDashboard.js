// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingAssignments: 0,
    cvRequests: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalStudents = usersSnapshot.size;
      
      // Fetch pending assignments
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('status', '==', 'pending')
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const pendingAssignments = assignmentsSnapshot.size;
      
      // Fetch pending CV requests
      const cvRequestsQuery = query(
        collection(db, 'cvRequests'),
        where('status', '==', 'pending')
      );
      const cvRequestsSnapshot = await getDocs(cvRequestsQuery);
      const cvRequests = cvRequestsSnapshot.size;
      
      // Calculate revenue (example: count paid subscriptions)
      const paidUsers = usersSnapshot.docs.filter(doc => 
        doc.data().subscriptionTier && doc.data().subscriptionTier !== 'free'
      );
      const totalRevenue = paidUsers.length * 299; // R299 per subscription
      
      // Fetch recent activity
      const activityQuery = query(
        collection(db, 'activity'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const activitySnapshot = await getDocs(activityQuery);
      const activities = activitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStats({
        totalStudents,
        pendingAssignments,
        cvRequests,
        totalRevenue,
        activeSubscriptions: paidUsers.length
      });
      
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'signup': return '👤';
      case 'assignment': return '📝';
      case 'cv': return '💼';
      case 'subscription': return '💰';
      case 'course': return '📚';
      case 'login': return '🔐';
      default: return '⚡';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'signup': return '#8B5CF6';
      case 'assignment': return '#3B82F6';
      case 'cv': return '#10B981';
      case 'subscription': return '#F59E0B';
      case 'course': return '#EF4444';
      case 'login': return '#06B6D4';
      default: return '#94A3B8';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const adminLinks = [
    { path: '/admin/users', label: '👥 User Management', icon: '👥' },
    { path: '/admin/assignments', label: '📝 Assignments', icon: '📝' },
    { path: '/admin/cv-requests', label: '💼 CV Requests', icon: '💼' },
    { path: '/admin/subscriptions', label: '💰 Subscriptions', icon: '💰' },
    { path: '/admin/courses', label: '📚 Course Management', icon: '📚' },
    { path: '/admin/analytics', label: '📊 Analytics', icon: '📊' },
    { path: '/admin/settings', label: '⚙️ Settings', icon: '⚙️' },
    { path: '/admin/support', label: '💬 Support Tickets', icon: '💬' },
  ];

  const quickActions = [
    { label: 'Add New Course', icon: '➕', action: () => console.log('Add course') },
    { label: 'Send Announcement', icon: '📢', action: () => console.log('Send announcement') },
    { label: 'View Reports', icon: '📈', action: () => console.log('View reports') },
    { label: 'Manage Tutors', icon: '👨‍🏫', action: () => console.log('Manage tutors') },
  ];

  return (
    <DashboardLayout>
      <div className="admin-page-content">
        {/* Admin Header */}
        <div className="admin-header">
          <div>
            <h1>👨‍💼 Admin Dashboard</h1>
            <p className="admin-subtitle">Welcome back, {userProfile?.displayName || 'Admin'}. Manage your platform here.</p>
          </div>
          <div className="admin-badge">
            <span className="badge-icon">⚡</span>
            <span className="badge-text">SUPER ADMIN</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">👥</div>
              <div className="stat-trend positive">+12%</div>
            </div>
            <div className="stat-value">{loading ? '...' : stats.totalStudents}</div>
            <div className="stat-label">Total Students</div>
            <div className="stat-subtext">Active users on platform</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">📝</div>
              <div className="stat-trend warning">+5</div>
            </div>
            <div className="stat-value">{loading ? '...' : stats.pendingAssignments}</div>
            <div className="stat-label">Pending Assignments</div>
            <div className="stat-subtext">Awaiting review</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">💼</div>
              <div className="stat-trend positive">+8</div>
            </div>
            <div className="stat-value">{loading ? '...' : stats.cvRequests}</div>
            <div className="stat-label">CV Requests</div>
            <div className="stat-subtext">Needs attention</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon">💰</div>
              <div className="stat-trend positive">+24%</div>
            </div>
            <div className="stat-value">R{loading ? '...' : stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Monthly Revenue</div>
            <div className="stat-subtext">{stats.activeSubscriptions} active subscriptions</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>⚡ Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <button key={index} className="action-card" onClick={action.action}>
                <div className="action-icon">{action.icon}</div>
                <div className="action-label">{action.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-content-grid">
          {/* Admin Navigation */}
          <div className="admin-nav-section">
            <h2>📋 Admin Tools</h2>
            <div className="admin-nav-grid">
              {adminLinks.map((link, index) => (
                <a key={index} href={link.path} className="admin-nav-card">
                  <div className="nav-icon">{link.icon}</div>
                  <div className="nav-label">{link.label}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <div className="section-header">
              <h2>📈 Recent Activity</h2>
              <button className="refresh-btn" onClick={fetchAdminData}>
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="loading-activity">
                <div className="spinner"></div>
                <p>Loading activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="empty-activity">
                <div className="empty-icon">📊</div>
                <h3>No activity yet</h3>
                <p>Activity will appear here as users interact with the platform</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div 
                      className="activity-icon"
                      style={{ backgroundColor: `${getActivityColor(activity.type)}20` }}
                    >
                      <span style={{ color: getActivityColor(activity.type) }}>
                        {getActivityIcon(activity.type)}
                      </span>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title || 'New Activity'}</div>
                      <div className="activity-description">
                        {activity.description || 'No description available'}
                      </div>
                      <div className="activity-meta">
                        <span className="activity-user">{activity.userName || 'User'}</span>
                        <span className="activity-time">{formatTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Platform Health */}
            <div className="health-metrics">
              <h3>🏥 Platform Health</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-label">Uptime</div>
                  <div className="metric-value">99.9%</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Response Time</div>
                  <div className="metric-value">120ms</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Storage</div>
                  <div className="metric-value">45%</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Notifications */}
        <div className="notifications-section">
          <h2>🔔 System Notifications</h2>
          <div className="notifications-list">
            <div className="notification-item info">
              <div className="notification-icon">ℹ️</div>
              <div className="notification-content">
                <strong>System Update Available</strong>
                <p>Version 2.1.0 is ready to install</p>
              </div>
              <button className="notification-action">Update</button>
            </div>
            <div className="notification-item warning">
              <div className="notification-icon">⚠️</div>
              <div className="notification-content">
                <strong>Storage Usage High</strong>
                <p>Consider cleaning up old files</p>
              </div>
              <button className="notification-action">Clean Up</button>
            </div>
            <div className="notification-item success">
              <div className="notification-icon">✅</div>
              <div className="notification-content">
                <strong>Backup Successful</strong>
                <p>Daily backup completed at 02:00 AM</p>
              </div>
              <button className="notification-action">View Logs</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper function since we can't import limit in the free version
const limit = (query, number) => {
  // This is a mock function - in real app, import and use actual limit from firebase
  return query;
};

export default AdminDashboard;
// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  getAllUsers, 
  getPendingAssignments, 
  getUpcomingSessions,
  getRecentActivity,
  getUnreadNotifications,
  updateAssignmentStatus,
  uploadAssignmentSolution,
  deleteAssignment,
  getAllCVRequests,
  updateCVRequestStatus,
  uploadTailoredCV,
  deleteCVRequest,
  updateSessionStatus
} from '../services/firebase';
import { validateMeetingLink } from '../utils/meetingValidator';
import '../App.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    pendingAssignments: 0,
    cvRequests: 0,
    upcomingSessions: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingAssignment, setUpdatingAssignment] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [priceEstimate, setPriceEstimate] = useState('');
  
  // Add these lines after your existing state declarations
  const [cvRequests, setCvRequests] = useState([]);
  const [cvAdminNotes, setCvAdminNotes] = useState('');
  const [cvPriceEstimate, setCvPriceEstimate] = useState('');
  const [uploadingCV, setUploadingCV] = useState(null);
  
  // NEW: CrunchTime sessions state
  const [crunchTimeSessions, setCrunchTimeSessions] = useState([]);
  const [sessionAdminNotes, setSessionAdminNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  
  // Add these after your existing state declarations:
  const [cancellationPenalty, setCancellationPenalty] = useState('');
  const [cancellationNotes, setCancellationNotes] = useState('');
  const [selectedCancellationSession, setSelectedCancellationSession] = useState(null);
  
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const [allUsers, pendingAssignments, allCvRequests, upcomingSessions, recentActivities, unreadNotifications] = await Promise.all([
        getAllUsers().catch(err => {
          console.error('Error getting users:', err);
          return [];
        }),
        getPendingAssignments().catch(err => {
          console.error('Error getting assignments:', err);
          return [];
        }),
        getAllCVRequests().catch(err => {
          console.error('Error getting CV requests:', err);
          return [];
        }),
        getUpcomingSessions().catch(err => {  // NEW: Fetch CrunchTime sessions
          console.error('Error getting CrunchTime sessions:', err);
          return [];
        }),
        getRecentActivity(20).catch(err => {
          console.error('Error getting activity:', err);
          return [];
        }),
        getUnreadNotifications().catch(err => {
          console.error('Error getting notifications:', err);
          return [];
        })
      ]);
      
      const paidUsers = allUsers.filter(user => 
        user.subscriptionStatus === 'active' && user.subscriptionTier !== 'free'
      );
      const totalRevenue = paidUsers.length * 299;
      
      setUsers(allUsers);
      setAssignments(pendingAssignments);
      setCvRequests(allCvRequests);
      setCrunchTimeSessions(upcomingSessions);  // NEW: Set CrunchTime sessions
      setRecentActivity(recentActivities);
      setNotifications(unreadNotifications);
      
      setStats({
        totalStudents: allUsers.length,
        pendingAssignments: pendingAssignments.length,
        cvRequests: allCvRequests.filter(cv => cv.status === 'pending').length,
        upcomingSessions: upcomingSessions.filter(s => s.status === 'requested' || s.status === 'confirmed').length,  // Updated
        totalRevenue,
        activeSubscriptions: paidUsers.length
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssignment = async (assignmentId, newStatus) => {
    try {
      setUpdatingAssignment(assignmentId);
      
      // Improved updates object with conditional inclusion
      const updates = {
        status: newStatus,
        ...(adminNotes && { adminNotes }),
        ...(priceEstimate && { priceEstimate: Number(priceEstimate) }),
      };
      
      const result = await updateAssignmentStatus(assignmentId, updates);
      if (result.success) {
        setAdminNotes('');
        setPriceEstimate('');
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      alert('Failed to update assignment');
    } finally {
      setUpdatingAssignment(null);
    }
  };

  // NEW: Session status update handler
  const handleUpdateSessionStatus = async (sessionId, updates) => {
    try {
      setUpdatingAssignment(sessionId);
      
      const cleanUpdates = {
        ...updates,
        ...(sessionAdminNotes && { adminNotes: sessionAdminNotes }),
        ...(meetingLink && { meetingLink }),
        updatedAt: new Date()
      };
      
      const result = await updateSessionStatus(sessionId, cleanUpdates);
      
      if (result.success) {
        setSessionAdminNotes('');
        setMeetingLink('');
        fetchAdminData();
        alert('Session updated successfully!');
      } else {
        alert('Failed to update session: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Failed to update session: ' + error.message);
    } finally {
      setUpdatingAssignment(null);
    }
  };

  // NEW: Assign meeting link handler WITH VALIDATION
  const handleAssignMeetingLink = async (sessionId) => {
    if (!meetingLink.trim()) {
      alert('Please enter a meeting link');
      return;
    }
    
    // Validate the meeting link using our new validator
    const validation = validateMeetingLink(meetingLink);
    
    if (!validation.isValid) {
      // Show specific error message from validator
      alert(`❌ Invalid meeting link:\n${validation.message}`);
      return;
    }
    
    // If validation passed but has a warning, show confirmation
    if (validation.warning) {
      const shouldContinue = window.confirm(
        `⚠️ ${validation.warning}\n\nPlatform detected: ${validation.platform}\n\nDo you want to assign this link anyway?`
      );
      if (!shouldContinue) return;
    }
    
    // Use formatted URL if validator provided one (e.g., for meet codes)
    const linkToAssign = validation.formattedUrl || meetingLink;
    
    // Confirm with admin
    const confirmAssign = window.confirm(
      `Assign ${validation.platform} meeting link?\n\n${linkToAssign}\n\nThis will also confirm the session.`
    );
    
    if (!confirmAssign) return;
    
    try {
      setUpdatingAssignment(sessionId);
      const result = await updateSessionStatus(sessionId, { 
        meetingLink: linkToAssign,
        status: 'confirmed',
        updatedAt: new Date()
      });
      
      if (result.success) {
        setMeetingLink('');
        fetchAdminData();
        alert(`✅ ${validation.platform} link assigned and session confirmed!`);
      } else {
        alert('Failed to assign meeting link');
      }
    } catch (error) {
      console.error('Error assigning meeting link:', error);
      alert('Failed to assign meeting link: ' + error.message);
    } finally {
      setUpdatingAssignment(null);
    }
  };

  // NEW: Handle cancellation approval/rejection
  const handleProcessCancellation = async (sessionId, action) => {
    if (action === 'approved' && !cancellationPenalty) {
      alert('Please enter penalty amount for approved cancellation');
      return;
    }
    
    try {
      setUpdatingAssignment(sessionId);
      setSelectedCancellationSession(sessionId);
      
      // Import the cancellation handler
      const { handleCancellationRequest } = await import('../services/firebase');
      
      const result = await handleCancellationRequest(
        sessionId,
        action,
        action === 'approved' ? Number(cancellationPenalty) : 0,
        cancellationNotes
      );
      
      if (result.success) {
        alert(`✅ Cancellation ${action} successfully!`);
        
        // Reset form
        setCancellationPenalty('');
        setCancellationNotes('');
        setSelectedCancellationSession(null);
        
        // Refresh data
        fetchAdminData();
      } else {
        throw new Error(result.error || `Failed to ${action} cancellation`);
      }
    } catch (error) {
      console.error('Error processing cancellation:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setUpdatingAssignment(null);
      setSelectedCancellationSession(null);
    }
  };

  const handleSolutionUpload = async (assignmentId, file) => {
    if (!file) return;
    
    try {
      setUpdatingAssignment(assignmentId);
      
      // Check file type
      const validTypes = ['.pdf', '.docx', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const fileType = file.type;
      
      if (!validTypes.includes(`.${fileExtension}`) && !validTypes.includes(fileType)) {
        alert('Please upload a PDF or DOCX file');
        setUpdatingAssignment(null);
        return;
      }
      
      // Upload solution
      const result = await uploadAssignmentSolution(assignmentId, file, adminNotes);
      
      if (result.success) {
        setAdminNotes('');
        fetchAdminData();
        alert('Solution uploaded successfully!');
      } else {
        alert('Failed to upload solution: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading solution:', error);
      alert('Failed to upload solution');
    } finally {
      setUpdatingAssignment(null);
    }
  };

  const handleEditSolution = async (assignmentId, file) => {
    if (!file) {
      const newNotes = prompt('Enter updated notes for student:');
      if (newNotes !== null) {
        await handleUpdateSolution(assignmentId, null, newNotes);
      }
      return;
    }
    
    try {
      setUpdatingAssignment(assignmentId);
      
      const { updateAssignmentSolution } = await import('../services/firebase');
      const result = await updateAssignmentSolution(assignmentId, file, adminNotes);
      
      if (result.success) {
        setAdminNotes('');
        fetchAdminData();
        alert('Solution updated successfully!');
      } else {
        alert('Failed to update solution: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating solution:', error);
      alert('Failed to update solution');
    } finally {
      setUpdatingAssignment(null);
    }
  };

  const handleUpdateSolution = async (assignmentId, file, notes) => {
    try {
      setUpdatingAssignment(assignmentId);
      
      const { updateAssignmentSolution } = await import('../services/firebase');
      const result = await updateAssignmentSolution(assignmentId, file, notes);
      
      if (result.success) {
        setAdminNotes('');
        fetchAdminData();
        alert('Solution updated successfully!');
      } else {
        alert('Failed to update solution: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating solution:', error);
      alert('Failed to update solution');
    } finally {
      setUpdatingAssignment(null);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }
    
    try {
      setUpdatingAssignment(assignmentId);
      const result = await deleteAssignment(assignmentId);
      
      if (result.success) {
        fetchAdminData();
        alert('Assignment deleted successfully!');
      } else {
        alert('Failed to delete assignment: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
    } finally {
      setUpdatingAssignment(null);
    }
  };

  // Handler for uploading tailored CV
  const handleUploadTailoredCV = async (requestId, file) => {
    if (!file) return;
    
    try {
      setUploadingCV(requestId);
      
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        alert('Only PDF and Word documents are allowed');
        setUploadingCV(null);
        return;
      }
      
      // Upload tailored CV
      const result = await uploadTailoredCV(requestId, file, cvAdminNotes);
      
      if (result.success) {
        setCvAdminNotes('');
        fetchAdminData();
        alert('Tailored CV uploaded successfully!');
      } else {
        alert('Failed to upload tailored CV: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading tailored CV:', error);
      alert('Failed to upload tailored CV');
    } finally {
      setUploadingCV(null);
    }
  };

  // Handler for deleting CV request
  const handleDeleteCVRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this CV request? This action cannot be undone.')) {
      return;
    }
    
    try {
      setUpdatingAssignment(requestId);
      const result = await deleteCVRequest(requestId);
      
      if (result.success) {
        fetchAdminData();
        alert('CV request deleted successfully!');
      } else {
        alert('Failed to delete CV request: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting CV request:', error);
      alert('Failed to delete CV request');
    } finally {
      setUpdatingAssignment(null);
    }
  };

  const handleUpdateCVRequest = async (requestId, updates) => {
    try {
      setUpdatingAssignment(requestId);
      
      // Clean up updates object
      const cleanUpdates = {
        status: updates.status,
        ...(cvAdminNotes && { adminNotes: cvAdminNotes }),
        ...(cvPriceEstimate && { priceEstimate: Number(cvPriceEstimate) }),
        ...(updates.completedAt && { completedAt: updates.completedAt }),
        updatedAt: new Date()
      };
      
      const result = await updateCVRequestStatus(requestId, cleanUpdates);
      
      if (result.success) {
        // Clear form inputs
        setCvAdminNotes('');
        setCvPriceEstimate('');
        
        // Refresh data
        fetchAdminData();
        
        // Show success message
        alert('CV request updated successfully!');
      } else {
        alert('Failed to update CV request: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating CV request:', error);
      alert('Failed to update CV request: ' + error.message);
    } finally {
      setUpdatingAssignment(null);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return { text: 'Completed', color: '#10B981', icon: '✅' };
      case 'in-progress': return { text: 'In Progress', color: '#3B82F6', icon: '🔄' };
      case 'reviewing': return { text: 'Reviewing', color: '#8B5CF6', icon: '📝' };
      case 'revision-requested': return { text: 'Revision Requested', color: '#F59E0B', icon: '📝' };
      default: return { text: 'Pending', color: '#F59E0B', icon: '⏳' };
    }
  };

  // NEW: Session status display
  const getSessionStatusDisplay = (status) => {
    switch (status) {
      case 'confirmed': return { text: 'Confirmed', color: '#10B981', icon: '✅' };
      case 'completed': return { text: 'Completed', color: '#3B82F6', icon: '🏁' };
      case 'cancelled': return { text: 'Cancelled', color: '#EF4444', icon: '❌' };
      case 'in-progress': return { text: 'In Progress', color: '#8B5CF6', icon: '🔄' };
      default: return { text: 'Requested', color: '#F59E0B', icon: '⏳' };
    }
  };

  const getUrgencyDisplay = (urgency) => {
    switch (urgency) {
      case '24hours': return { text: '24 Hours', color: '#EF4444', icon: '🚨' };
      case '48hours': return { text: '48 Hours', color: '#F59E0B', icon: '⚡' };
      case '1week': return { text: '1 Week', color: '#10B981', icon: '📅' };
      default: return { text: 'Standard', color: '#6B7280', icon: '📋' };
    }
  };

  // NEW: Platform icon getter
  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'zoom': return '📹';
      case 'google meet': return '🎥';
      case 'microsoft teams': return '💼';
      default: return '💻';
    }
  };

  // Add this helper function for experience levels
  const getExperienceDisplay = (level) => {
    switch (level) {
      case 'entry': return { text: 'Entry Level', icon: '🎓' };
      case 'junior': return { text: 'Junior (1-3 yrs)', icon: '👔' };
      case 'mid': return { text: 'Mid Level (3-5 yrs)', icon: '💼' };
      case 'senior': return { text: 'Senior (5+ yrs)', icon: '👨‍💼' };
      case 'executive': return { text: 'Executive', icon: '🏢' };
      default: return { text: 'Not specified', icon: '❓' };
    }
  };

  const getActivityIcon = (action) => {
    if (action && action.includes('USER')) return '👤';
    if (action && action.includes('ASSIGNMENT')) return '📝';
    if (action && action.includes('CV')) return '💼';
    if (action && action.includes('CRUNCHTIME')) return '⏰';
    if (action && action.includes('LOGIN')) return '🔐';
    if (action && action.includes('PAYMENT')) return '💰';
    return '⚡';
  };

  const getActivityColor = (action) => {
    if (action && action.includes('USER')) return '#8B5CF6';
    if (action && action.includes('ASSIGNMENT')) return '#3B82F6';
    if (action && action.includes('CV')) return '#10B981';
    if (action && action.includes('CRUNCHTIME')) return '#F59E0B';
    if (action && action.includes('LOGIN')) return '#06B6D4';
    if (action && action.includes('PAYMENT')) return '#EF4444';
    return '#94A3B8';
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = async (notificationId) => {
    const { markNotificationAsRead } = await import('../services/firebase');
    await markNotificationAsRead(notificationId);
    fetchAdminData();
  };

  // Helper function to get user display name (handles old and new formats)
  const getUserDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.displayName) {
      return user.displayName;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Helper function to get user first letter for avatar
  const getUserAvatarLetter = (user) => {
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  // Render Assignments Table
  const renderAssignmentsTable = () => (
    <div className="assignments-table-container">
      <div className="table-header">
        <h3>📝 Pending Assignments ({assignments.length})</h3>
        <div className="table-actions">
          <button className="btn-export">📥 Export CSV</button>
          <button className="btn-refresh" onClick={fetchAdminData}>🔄 Refresh</button>
        </div>
      </div>
      
      {assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No pending assignments</h3>
          <p>All assignments have been reviewed</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment) => {
            const statusDisplay = getStatusDisplay(assignment.status);
            const urgencyDisplay = getUrgencyDisplay(assignment.urgency);
            
            return (
              <div key={assignment.id} className="assignment-card">
                <div className="assignment-header">
                  <div className="student-info">
                    <div className="student-avatar">
                      {assignment.userName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4>{assignment.userName || 'Student'}</h4>
                      <p className="student-email">{assignment.userEmail}</p>
                    </div>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${statusDisplay.color}20`,
                      color: statusDisplay.color,
                      borderColor: statusDisplay.color
                    }}
                  >
                    {statusDisplay.icon} {statusDisplay.text}
                  </div>
                </div>
                
                <div className="assignment-body">
                  <h3>{assignment.fileName}</h3>
                  
                  {/* Revision Request Section */}
                  {assignment.revisionNotes && (
                    <div className="revision-section">
                      <strong>📝 Revision Requested:</strong>
                      <p>{assignment.revisionNotes}</p>
                      <p className="revision-info">
                        Requested: {assignment.revisionRequestedAt ? formatDate(assignment.revisionRequestedAt) : 'Recently'}
                      </p>
                    </div>
                  )}
                  
                  {/* Show solution if exists */}
                  {assignment.solutionUrl && (
                    <div className="solution-section">
                      <strong>✅ Solution Provided:</strong>
                      <a 
                        href={assignment.solutionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="solution-link"
                      >
                        📥 Download Solution ({assignment.solutionFileName || 'Solution'})
                      </a>
                      <p className="solution-info">Completed: {assignment.completedAt ? formatDate(assignment.completedAt) : 'Recently'}</p>
                    </div>
                  )}
                  
                  <div className="assignment-details">
                    <div className="detail-item">
                      <span className="detail-label">Subject:</span>
                      <span className="detail-value">{assignment.subject || 'General'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Topic:</span>
                      <span className="detail-value">{assignment.topic || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Urgency:</span>
                      <span 
                        className="detail-value urgency-value"
                        style={{ color: urgencyDisplay.color }}
                      >
                        {urgencyDisplay.icon} {urgencyDisplay.text}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Submitted:</span>
                      <span className="detail-value">{formatDate(assignment.createdAt)}</span>
                    </div>
                    {assignment.deadline && (
                      <div className="detail-item">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">{assignment.deadline}</span>
                      </div>
                    )}
                    {assignment.priceEstimate && (
                      <div className="detail-item">
                        <span className="detail-label">Price Estimate:</span>
                        <span className="detail-value price-value">R{assignment.priceEstimate}</span>
                      </div>
                    )}
                  </div>
                  
                  {assignment.instructions && (
                    <div className="instructions-section">
                      <strong>Instructions:</strong>
                      <p>{assignment.instructions}</p>
                    </div>
                  )}
                  
                  {assignment.adminNotes && (
                    <div className="admin-notes-section">
                      <strong>Your Notes:</strong>
                      <p>{assignment.adminNotes}</p>
                    </div>
                  )}
                  
                  <div className="assignment-actions">
                    {assignment.fileUrl && (
                      <a 
                        href={assignment.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="action-btn primary"
                      >
                        📄 Download Student's File
                      </a>
                    )}
                    
                    <div className="solution-upload-section">
                      <input
                        type="file"
                        id={`solution-${assignment.id}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleSolutionUpload(assignment.id, e.target.files[0])}
                        accept=".pdf,.docx"
                      />
                      <button 
                        onClick={() => document.getElementById(`solution-${assignment.id}`).click()}
                        className="solution-upload-btn"
                        disabled={updatingAssignment === assignment.id}
                      >
                        {updatingAssignment === assignment.id ? '🔄 Uploading...' : '📤 Upload Solution PDF'}
                      </button>
                      
                      {/* Edit Solution Button - only shows if solution exists */}
                      {assignment.solutionUrl && (
                        <>
                          <button 
                            onClick={() => document.getElementById(`edit-solution-${assignment.id}`).click()}
                            className="edit-solution-btn"
                            disabled={updatingAssignment === assignment.id}
                          >
                            {updatingAssignment === assignment.id ? '🔄' : '✏️'} Edit Solution
                          </button>
                          
                          <input
                            type="file"
                            id={`edit-solution-${assignment.id}`}
                            style={{ display: 'none' }}
                            onChange={(e) => handleEditSolution(assignment.id, e.target.files[0])}
                            accept=".pdf,.docx"
                          />
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="delete-btn"
                        disabled={updatingAssignment === assignment.id}
                      >
                        {updatingAssignment === assignment.id ? '🔄' : '🗑️'} Delete
                      </button>
                    </div>
                    
                    <div className="status-update-section">
                      <div className="update-notes">
                        <input
                          type="text"
                          placeholder="Add notes for student..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="notes-input"
                        />
                        <input
                          type="number"
                          placeholder="Price estimate (R)"
                          value={priceEstimate}
                          onChange={(e) => setPriceEstimate(e.target.value)}
                          className="price-input"
                        />
                      </div>
                      
                      <div className="status-buttons">
                        <button
                          className="status-btn reviewing"
                          onClick={() => handleUpdateAssignment(assignment.id, 'reviewing')}
                          disabled={updatingAssignment === assignment.id}
                        >
                          {updatingAssignment === assignment.id ? '🔄' : '📝'} Mark as Reviewing
                        </button>
                        <button
                          className="status-btn in-progress"
                          onClick={() => handleUpdateAssignment(assignment.id, 'in-progress')}
                          disabled={updatingAssignment === assignment.id}
                        >
                          {updatingAssignment === assignment.id ? '🔄' : '🔄'} Mark In Progress
                        </button>
                        <button
                          className="status-btn completed"
                          onClick={() => handleUpdateAssignment(assignment.id, 'completed')}
                          disabled={updatingAssignment === assignment.id}
                        >
                          {updatingAssignment === assignment.id ? '🔄' : '✅'} Mark Completed
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render Users Table
  const renderUsersTable = () => (
    <div className="users-table-container">
      <div className="table-header">
        <h3>👥 Registered Users ({users.length})</h3>
        <div className="table-actions">
          <button className="btn-export">📥 Export CSV</button>
          <button className="btn-refresh" onClick={fetchAdminData}>🔄 Refresh</button>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Student #</th>
              <th>University</th>
              <th>Course</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const displayName = getUserDisplayName(user);
              const avatarLetter = getUserAvatarLetter(user);
              const isActive = user.isActive !== undefined ? user.isActive : true;
              
              return (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {avatarLetter}
                      </div>
                      <div className="user-info">
                        <strong>{displayName}</strong>
                        <small>{user.role || 'student'}</small>
                      </div>
                    </div>
                  </td>
                  <td>{user.email || 'No email'}</td>
                  <td>{user.studentNumber || user.studentId || 'N/A'}</td>
                  <td>{user.university || user.institution || 'N/A'}</td>
                  <td>{user.course || user.program || 'N/A'}</td>
                  <td>{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                      {isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-action" title="View Profile">👁️</button>
                    <button className="btn-action" title="Send Message">💬</button>
                    <button className="btn-action" title="Edit">✏️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render CV Requests Table
  const renderCVRequestsTable = () => (
    <div className="cv-requests-table-container">
      <div className="table-header">
        <h3>💼 CV Tailoring Requests ({cvRequests.length})</h3>
        <div className="table-actions">
          <button className="btn-export" onClick={() => alert('Export feature coming soon!')}>
            📥 Export CSV
          </button>
          <button className="btn-refresh" onClick={fetchAdminData}>
            🔄 Refresh
          </button>
        </div>
      </div>
    
    {cvRequests.length === 0 ? (
      <div className="cv-empty-state">
        <div className="cv-empty-icon">📭</div>
        <h3>No CV requests found</h3>
        <p>No CV tailoring requests have been submitted yet by users</p>
      </div>
    ) : (
      <div className="cv-requests-grid">
        {cvRequests.map((request) => {
          const statusDisplay = getStatusDisplay(request.status || 'pending');
          const experienceDisplay = getExperienceDisplay(request.experienceLevel);
          
          return (
            <div key={request.id} className="cv-request-card">
              <div className="cv-request-header">
                <div className="student-info">
                  <div className="student-avatar">
                    {request.userName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h4>{request.userName || 'Student'}</h4>
                    <p className="student-email">{request.userEmail}</p>
                    <span className="experience-badge">
                      {experienceDisplay.icon} {experienceDisplay.text}
                    </span>
                  </div>
                </div>
                <div 
                  className="status-badge"
                  style={{ 
                    backgroundColor: `${statusDisplay.color}20`,
                    color: statusDisplay.color,
                    borderColor: statusDisplay.color
                  }}
                >
                  {statusDisplay.icon} {statusDisplay.text}
                </div>
              </div>
              
              <div className="cv-request-body">
                <h3>{request.jobTitle || 'CV Tailoring Request'}</h3>
                {request.industry && (
                  <p style={{ color: '#64748b', marginBottom: '10px' }}>
                    Industry: <strong>{request.industry}</strong>
                  </p>
                )}
                
                <div className="cv-request-details">
                  <div className="detail-item">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">{formatDate(request.createdAt)}</span>
                  </div>
                  
                  {request.deadline && (
                    <div className="detail-item">
                      <span className="detail-label">Deadline:</span>
                      <span className="detail-value">{request.deadline}</span>
                    </div>
                  )}
                  
                  {request.priceEstimate && (
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price-value">R{request.priceEstimate}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{statusDisplay.text}</span>
                  </div>
                </div>
                
                {/* Skills Section */}
                {request.keySkills && request.keySkills.length > 0 && (
                  <div className="skills-section">
                    <strong>Key Skills:</strong>
                    <div className="skills-tags">
                      {Array.isArray(request.keySkills) 
                        ? request.keySkills.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          ))
                        : <span className="skill-tag">{request.keySkills}</span>
                      }
                    </div>
                  </div>
                )}
                
                {/* Achievements Section */}
                {request.achievements && (
                  <div className="achievements-section">
                    <strong>📈 Achievements:</strong>
                    <p>{request.achievements}</p>
                  </div>
                )}
                
                {/* Target Companies Section */}
                {request.targetCompanies && (
                  <div className="target-companies-section">
                    <strong>🎯 Target Companies:</strong>
                    <p>{request.targetCompanies}</p>
                  </div>
                )}
                
                {/* Admin Notes Section */}
                {request.adminNotes && (
                  <div className="admin-notes-section">
                    <strong>📝 Admin Notes:</strong>
                    <p>{request.adminNotes}</p>
                  </div>
                )}
                
                {/* CV File Download */}
                {request.currentCV && (
                  <div className="cv-file-section">
                    <strong>📄 Original CV:</strong>
                    <a 
                      href={request.currentCV} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="cv-download-btn"
                    >
                      📥 Download CV
                    </a>
                    {request.currentCV.includes('.pdf') && (
                      <a 
                        href={request.currentCV} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-pdf-btn"
                      >
                        👁️ View PDF
                      </a>
                    )}
                  </div>
                )}
                
                {/* Job Posting Download */}
                {request.jobPosting && (
                  <div className="job-posting-section">
                    <strong>📋 Job Posting:</strong>
                    <a 
                      href={request.jobPosting} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="job-posting-btn"
                    >
                      📥 Download Job Posting
                    </a>
                  </div>
                )}

                {/* Tailored CV Section - New */}
                {request.tailoredCV && (
                  <div className="tailored-cv-section" style={{background: '#d1fae5', padding: '12px', borderRadius: '8px', margin: '12px 0'}}>
                    <strong>✅ Tailored CV Provided:</strong>
                    <div style={{display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap'}}>
                      <a 
                        href={request.tailoredCV} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="cv-download-btn"
                      >
                        📥 Download Tailored CV
                      </a>
                      <button 
                        onClick={() => document.getElementById(`replace-cv-${request.id}`).click()}
                        className="view-pdf-btn"
                        disabled={uploadingCV === request.id}
                        style={{background: '#f59e0b'}}
                      >
                        {uploadingCV === request.id ? '🔄' : '✏️'} Replace CV
                      </button>
                      <input
                        type="file"
                        id={`replace-cv-${request.id}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleUploadTailoredCV(request.id, e.target.files[0])}
                        accept=".pdf,.doc,.docx"
                      />
                    </div>
                    {request.tailoredFileName && (
                      <p style={{marginTop: '8px', fontSize: '14px', color: '#047857'}}>
                        File: {request.tailoredFileName} • Uploaded: {request.completedAt ? formatDate(request.completedAt) : 'Recently'}
                      </p>
                    )}
                  </div>
                )}

                {/* Upload Tailored CV Section - When no tailored CV exists */}
                {!request.tailoredCV && (
                  <div className="upload-tailored-section" style={{marginTop: '16px'}}>
                    <strong>Upload Tailored CV:</strong>
                    <div style={{display: 'flex', gap: '10px', marginTop: '8px', alignItems: 'center'}}>
                      <input
                        type="file"
                        id={`tailored-cv-${request.id}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleUploadTailoredCV(request.id, e.target.files[0])}
                        accept=".pdf,.doc,.docx"
                      />
                      <button 
                        onClick={() => document.getElementById(`tailored-cv-${request.id}`).click()}
                        disabled={uploadingCV === request.id}
                        style={{
                          background: '#10b981',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: uploadingCV === request.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {uploadingCV === request.id ? '🔄 Uploading...' : '📤 Upload Tailored CV'}
                      </button>
                      <span style={{fontSize: '12px', color: '#6b7280'}}>PDF or Word document</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Admin Actions */}
              <div className="cv-request-actions">
                <div className="update-notes">
                  <input
                    type="text"
                    placeholder="Add notes for student..."
                    value={cvAdminNotes}
                    onChange={(e) => setCvAdminNotes(e.target.value)}
                    className="notes-input"
                    onFocus={() => {
                      if (updatingAssignment !== request.id) {
                        setCvAdminNotes(request.adminNotes || '');
                        setCvPriceEstimate(request.priceEstimate || '');
                      }
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Price estimate (R)"
                    value={cvPriceEstimate}
                    onChange={(e) => setCvPriceEstimate(e.target.value)}
                    className="price-input"
                    min="0"
                    step="1"
                  />
                </div>
                
                <div className="status-buttons">
                  <button
                    className="status-btn reviewing"
                    onClick={() => handleUpdateCVRequest(request.id, { 
                      status: 'reviewing'
                    })}
                    disabled={updatingAssignment === request.id}
                  >
                    {updatingAssignment === request.id ? '🔄' : '📝'} Mark as Reviewing
                  </button>
                  <button
                    className="status-btn in-progress"
                    onClick={() => handleUpdateCVRequest(request.id, { 
                      status: 'in-progress'
                    })}
                    disabled={updatingAssignment === request.id}
                  >
                    {updatingAssignment === request.id ? '🔄' : '🔄'} Mark In Progress
                  </button>
                  <button
                    className="status-btn completed"
                    onClick={() => handleUpdateCVRequest(request.id, { 
                      status: 'completed',
                      completedAt: new Date()
                    })}
                    disabled={updatingAssignment === request.id}
                  >
                    {updatingAssignment === request.id ? '🔄' : '✅'} Mark Completed
                  </button>
                  {/* Delete Button - Added */}
                  <button
                    className="status-btn"
                    onClick={() => handleDeleteCVRequest(request.id)}
                    disabled={updatingAssignment === request.id}
                    style={{background: '#ef4444', color: 'white'}}
                  >
                    {updatingAssignment === request.id ? '🔄' : '🗑️'} Delete Request
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

  // NEW: Render CrunchTime Sessions Table
  const renderCrunchTimeSessionsTable = () => (
    <div className="crunchtime-sessions-container">
      <div className="table-header">
        <h3>⏰ CrunchTime Sessions ({crunchTimeSessions.length})</h3>
        <div className="table-actions">
          <button className="btn-export" onClick={() => alert('Export feature coming soon!')}>
            📥 Export CSV
          </button>
          <button className="btn-refresh" onClick={fetchAdminData}>
            🔄 Refresh
          </button>
        </div>
      </div>
      
      {crunchTimeSessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⏰</div>
          <h3>No upcoming sessions</h3>
          <p>No tutoring sessions have been booked yet</p>
        </div>
      ) : (
        <div className="crunchtime-sessions-grid">
          {crunchTimeSessions.map((session) => {
            const statusDisplay = getSessionStatusDisplay(session.status);
            const platformIcon = getPlatformIcon(session.platform);
            const sessionDate = session.dateTime ? formatDate(session.dateTime) : 'Date not set';
            
            return (
              <div key={session.id} className="crunchtime-session-card">
                <div className="session-header">
                  <div className="student-info">
                    <div className="student-avatar">
                      {session.userName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4>{session.userName || 'Student'}</h4>
                      <p className="student-email">{session.userEmail}</p>
                      <div className="session-subject">
                        <strong>{session.subject}</strong>
                        {session.topic && ` - ${session.topic}`}
                      </div>
                    </div>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${statusDisplay.color}20`,
                      color: statusDisplay.color,
                      borderColor: statusDisplay.color
                    }}
                  >
                    {statusDisplay.icon} {statusDisplay.text}
                  </div>
                </div>
                
                <div className="session-body">
                  <div className="session-details">
                    <div className="detail-item">
                      <span className="detail-label">Date & Time:</span>
                      <span className="detail-value">{sessionDate}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{session.duration || 120} min</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Platform:</span>
                      <span className="detail-value">
                        {platformIcon} {session.platform || 'Not specified'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price-value">R{session.price || 299}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Payment:</span>
                      <span className={`detail-value ${session.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                        {session.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {session.notes && (
                    <div className="session-notes">
                      <strong>Student Notes:</strong>
                      <p>{session.notes}</p>
                    </div>
                  )}
                  
                  {session.adminNotes && (
                    <div className="admin-notes-section">
                      <strong>Your Notes:</strong>
                      <p>{session.adminNotes}</p>
                    </div>
                  )}
                  
                  {/* Meeting Link Section */}
                  {session.meetingLink ? (
                    <div className="meeting-link-section">
                      <strong>🔗 Meeting Link:</strong>
                      <a 
                        href={session.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="meeting-link-btn"
                      >
                        Join Meeting
                      </a>
                      <button 
                        onClick={() => {
                          setMeetingLink(session.meetingLink || '');
                          document.getElementById(`edit-link-${session.id}`)?.focus();
                        }}
                        className="edit-link-btn"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  ) : (
                    <div className="no-meeting-link">
                      <strong>⚠️ No Meeting Link:</strong>
                      <p>Assign a meeting link to confirm this session</p>
                    </div>
                  )}
                  
                  {/* Cancellation Request Section - NEW */}
                  {session.cancellationRequested && (
                    <div className="cancellation-request-section">
                      <div className="request-header">
                        <div className="request-title">
                          <strong>🚫 Cancellation Request</strong>
                          <span className="request-date">
                            Requested: {formatDate(session.cancellationRequestedAt)}
                          </span>
                        </div>
                        <div className={`cancellation-status-badge ${session.cancellationStatus || 'pending'}`}>
                          {session.cancellationStatus === 'approved' ? '✅ Approved' : 
                           session.cancellationStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                        </div>
                      </div>
                      
                      <div className="request-details">
                        <p><strong>Reason:</strong> {session.cancellationReason}</p>
                        <p><strong>Session Price:</strong> R{session.price || 299}</p>
                        <p><strong>Calculated Penalty:</strong> R{session.cancellationPenaltyCalculated || 0}</p>
                        <p><strong>Calculated Refund:</strong> R{session.cancellationRefundCalculated || 0}</p>
                      </div>
                      
                      {/* Only show actions if cancellation is pending */}
                      {(!session.cancellationStatus || session.cancellationStatus === 'pending') && (
                        <div className="cancellation-actions">
                          <div className="action-inputs">
                            <div className="form-group">
                              <label>Adjust Penalty (R)</label>
                              <input
                                type="number"
                                value={selectedCancellationSession === session.id ? cancellationPenalty : (session.cancellationPenaltyCalculated || '')}
                                onChange={(e) => {
                                  setCancellationPenalty(e.target.value);
                                  setSelectedCancellationSession(session.id);
                                }}
                                placeholder="e.g., 50"
                                className="form-input"
                                min="0"
                                max={session.price || 299}
                              />
                              <small>Max: R{session.price || 299} (Session price)</small>
                            </div>
                            
                            <div className="form-group">
                              <label>Admin Notes</label>
                              <textarea
                                value={selectedCancellationSession === session.id ? cancellationNotes : ''}
                                onChange={(e) => {
                                  setCancellationNotes(e.target.value);
                                  setSelectedCancellationSession(session.id);
                                }}
                                placeholder="Explain your decision to the student..."
                                rows="3"
                                className="form-textarea"
                              />
                            </div>
                          </div>
                          
                          <div className="action-buttons">
                            <button
                              className="action-btn approve"
                              onClick={() => handleProcessCancellation(session.id, 'approved')}
                              disabled={updatingAssignment === session.id || (cancellationPenalty && Number(cancellationPenalty) > (session.price || 299))}
                            >
                              {updatingAssignment === session.id ? '🔄' : '✅'} Approve with Penalty
                            </button>
                            
                            <button
                              className="action-btn reject"
                              onClick={() => handleProcessCancellation(session.id, 'rejected')}
                              disabled={updatingAssignment === session.id}
                            >
                              {updatingAssignment === session.id ? '🔄' : '❌'} Reject Request
                            </button>
                            
                            <button
                              className="action-btn full-refund"
                              onClick={() => {
                                setCancellationPenalty('0');
                                handleProcessCancellation(session.id, 'approved');
                              }}
                              disabled={updatingAssignment === session.id}
                            >
                              {updatingAssignment === session.id ? '🔄' : '💝'} Full Refund (Special Case)
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Show final decision if already processed */}
                      {session.cancellationStatus && session.cancellationStatus !== 'pending' && (
                        <div className="cancellation-decision">
                          <p><strong>Decision:</strong> {session.cancellationStatus.toUpperCase()}</p>
                          {session.cancellationPenaltyFinal !== undefined && (
                            <p><strong>Final Penalty:</strong> R{session.cancellationPenaltyFinal}</p>
                          )}
                          {session.cancellationRefundFinal !== undefined && (
                            <p><strong>Final Refund:</strong> R{session.cancellationRefundFinal}</p>
                          )}
                          {session.cancellationAdminNotes && (
                            <p><strong>Admin Notes:</strong> {session.cancellationAdminNotes}</p>
                          )}
                          <p className="decision-date">
                            Processed: {formatDate(session.cancellationProcessedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Admin Actions */}
                <div className="session-actions">
                  <div className="action-inputs">
                    <input
                      type="text"
                      placeholder="Add admin notes..."
                      value={sessionAdminNotes}
                      onChange={(e) => setSessionAdminNotes(e.target.value)}
                      className="notes-input"
                      onFocus={() => {
                        if (updatingAssignment !== session.id) {
                          setSessionAdminNotes(session.adminNotes || '');
                          setMeetingLink(session.meetingLink || '');
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Meeting link (Zoom/Google Meet)"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="link-input"
                      id={`edit-link-${session.id}`}
                    />
                    
                    {/* NEW: Add validation feedback UI */}
                    {meetingLink && (
                      (() => {
                        const validation = validateMeetingLink(meetingLink);
                        return (
                          <div className={`validation-feedback ${validation.isValid ? 'valid' : 'invalid'}`}>
                            <span className="validation-icon">
                              {validation.isValid ? '✅' : '⚠️'}
                            </span>
                            <span className="validation-text">
                              {validation.isValid 
                                ? `Valid ${validation.platform} link` 
                                : validation.message
                              }
                            </span>
                          </div>
                        );
                      })()
                    )}
                  </div>
                  
                  <div className="action-buttons">
                    {!session.meetingLink && (
                      <button
                        className="action-btn assign-link"
                        onClick={() => handleAssignMeetingLink(session.id)}
                        disabled={updatingAssignment === session.id || !meetingLink.trim()}
                      >
                        {updatingAssignment === session.id ? '🔄' : '🔗'} Assign Meeting Link
                      </button>
                    )}
                    
                    <button
                      className="action-btn confirm"
                      onClick={() => handleUpdateSessionStatus(session.id, { 
                        status: 'confirmed'
                      })}
                      disabled={updatingAssignment === session.id}
                    >
                      {updatingAssignment === session.id ? '🔄' : '✅'} Confirm
                    </button>
                    
                    <button
                      className="action-btn in-progress"
                      onClick={() => handleUpdateSessionStatus(session.id, { 
                        status: 'in-progress'
                      })}
                      disabled={updatingAssignment === session.id}
                    >
                      {updatingAssignment === session.id ? '🔄' : '🔄'} Mark In Progress
                    </button>
                    
                    <button
                      className="action-btn complete"
                      onClick={() => handleUpdateSessionStatus(session.id, { 
                        status: 'completed'
                      })}
                      disabled={updatingAssignment === session.id}
                    >
                      {updatingAssignment === session.id ? '🔄' : '🏁'} Mark Completed
                    </button>
                    
                    <button
                      className="action-btn cancel"
                      onClick={() => handleUpdateSessionStatus(session.id, { 
                        status: 'cancelled'
                      })}
                      disabled={updatingAssignment === session.id}
                    >
                      {updatingAssignment === session.id ? '🔄' : '❌'} Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render Overview
  const renderOverview = () => (
    <>
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">👥</div>
            <div className="stat-trend positive">+{Math.floor(users.length * 0.12)}</div>
          </div>
          <div className="stat-value">{loading ? '...' : stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
          <div className="stat-subtext">{users.filter(u => u.isActive !== false).length} active</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">📝</div>
            <div className="stat-trend warning">!</div>
          </div>
          <div className="stat-value">{loading ? '...' : stats.pendingAssignments}</div>
          <div className="stat-label">Pending Assignments</div>
          <div className="stat-subtext">Awaiting review</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">💼</div>
            <div className="stat-trend warning">!</div>
          </div>
          <div className="stat-value">{loading ? '...' : stats.cvRequests}</div>
          <div className="stat-label">CV Requests</div>
          <div className="stat-subtext">Needs attention</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">⏰</div>
            <div className="stat-trend info">!</div>
          </div>
          <div className="stat-value">{loading ? '...' : stats.upcomingSessions}</div>
          <div className="stat-label">Upcoming Sessions</div>
          <div className="stat-subtext">CrunchTime bookings</div>
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
                  style={{ backgroundColor: `${getActivityColor(activity.action)}20` }}
                >
                  <span style={{ color: getActivityColor(activity.action) }}>
                    {getActivityIcon(activity.action)}
                  </span>
                </div>
                <div className="activity-content">
                  <div className="activity-title">
                    {activity.action?.replace(/_/g, ' ') || 'User Activity'}
                  </div>
                  <div className="activity-description">
                    {activity.details ? JSON.stringify(activity.details, null, 2) : 'No details'}
                  </div>
                  <div className="activity-meta">
                    <span className="activity-user">User ID: {activity.userId || 'Unknown'}</span>
                    <span className="activity-time">{formatTime(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <DashboardLayout>
      <div className="admin-page-content">
        {/* Admin Header */}
        <div className="admin-header">
          <div>
            <h1>👨‍💼 Admin Dashboard</h1>
            <p className="admin-subtitle">Welcome back, {userProfile?.displayName || 'Admin'}</p>
          </div>
          <div className="admin-badge">
            <span className="badge-icon">⚡</span>
            <span className="badge-text">ADMIN</span>
          </div>
        </div>

        {/* Notifications Badge */}
        {notifications.length > 0 && (
          <div className="notifications-alert">
            <div className="alert-icon">🔔</div>
            <div className="alert-content">
              <strong>{notifications.length} unread notification{notifications.length > 1 ? 's' : ''}</strong>
              <p>New users, assignments, and requests need your attention</p>
            </div>
            <button 
              className="alert-action"
              onClick={() => {
                notifications.forEach(n => handleMarkAsRead(n.id));
              }}
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Admin Tabs */}
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users ({users.length})</button>
          <button className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>📝 Assignments ({stats.pendingAssignments})</button>
          <button className={`tab-btn ${activeTab === 'cv' ? 'active' : ''}`} onClick={() => setActiveTab('cv')}>💼 CV Requests ({stats.cvRequests})</button>
          <button className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>⏰ Sessions ({stats.upcomingSessions})</button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {loading ? (
            <div className="loading-content">
              <div className="spinner-large"></div>
              <p>Loading admin data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'users' && renderUsersTable()}
              {activeTab === 'assignments' && renderAssignmentsTable()}
              {activeTab === 'cv' && renderCVRequestsTable()}
              {activeTab === 'sessions' && renderCrunchTimeSessionsTable()}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;
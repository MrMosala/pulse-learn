// frontend/src/pages/Assignments.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function Assignments() {
  const [file, setFile] = useState(null);
  const [assignmentType, setAssignmentType] = useState('question');
  const [urgency, setUrgency] = useState('1week');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const { currentUser, userProfile } = useAuth();

  // Fetch user's submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!currentUser) return;
      
      try {
        const q = query(
          collection(db, 'assignments'),
          where('studentId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const subs = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          subs.push({ 
            id: doc.id, 
            ...data,
            submittedAt: data.submittedAt?.toDate() || new Date()
          });
        });
        
        // Sort by most recent
        subs.sort((a, b) => b.submittedAt - a.submittedAt);
        setSubmissions(subs);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoadingSubmissions(false);
      }
    };
    
    fetchSubmissions();
  }, [currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setMessage('');

      // Upload file to Firebase Storage
      const fileRef = ref(storage, `assignments/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      // Create assignment document in Firestore
      await addDoc(collection(db, 'assignments'), {
        studentId: currentUser.uid,
        studentName: userProfile?.displayName || 'Student',
        studentNumber: userProfile?.studentNumber || '',
        fileURL: fileURL,
        fileName: file.name,
        type: assignmentType,
        urgency: urgency,
        status: 'pending',
        submittedAt: serverTimestamp(),
        completedAt: null,
        solutionURL: null
      });

      setMessage('✅ Assignment submitted successfully!');
      setFile(null);
      e.target.reset();
      
      // Refresh submissions list
      window.location.reload();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setMessage('❌ Error submitting assignment. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const getUrgencyDisplay = (urgency) => {
    switch (urgency) {
      case '24hours': return { text: '24 Hours', color: '#EF4444', icon: '🚨' };
      case '48hours': return { text: '48 Hours', color: '#F59E0B', icon: '⚡' };
      case '1week': return { text: '1 Week', color: '#10B981', icon: '📅' };
      default: return { text: 'Standard', color: '#6B7280', icon: '📋' };
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return { text: 'Completed', color: '#10B981', icon: '✅' };
      case 'reviewing': return { text: 'Reviewing', color: '#3B82F6', icon: '📝' };
      case 'in_progress': return { text: 'In Progress', color: '#8B5CF6', icon: '🔄' };
      default: return { text: 'Pending', color: '#F59E0B', icon: '⏳' };
    }
  };

  const getTypeDisplay = (type) => {
    switch (type) {
      case 'question': return { text: 'Question Help', icon: '❓' };
      case 'full': return { text: 'Full Assignment', icon: '📚' };
      case 'quiz': return { text: 'Quiz Prep', icon: '📝' };
      case 'study': return { text: 'Study Guide', icon: '📖' };
      default: return { text: 'Assignment', icon: '📄' };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="assignments-page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>📝 Assignment Support</h1>
          <p>Get expert help with your academic assignments and questions</p>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-card-icon">🎯</div>
          <div className="info-card-content">
            <h3>How It Works</h3>
            <p>Upload your assignment, select the type of help needed, and choose urgency. Our tutors will provide detailed solutions and explanations.</p>
          </div>
        </div>

        {/* Upload Form */}
        <div className="upload-form-card">
          <div className="form-header">
            <h2>Upload New Assignment</h2>
            <span className="form-subtitle">Get help from expert tutors</span>
          </div>

          {message && (
            <div className={`message-alert ${message.includes('✅') ? 'success' : 'error'}`}>
              <div className="alert-icon">{message.includes('✅') ? '✅' : '❌'}</div>
              <div className="alert-message">{message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* File Upload */}
            <div className="upload-section">
              <h3>Upload Assignment File</h3>
              <div 
                className={`upload-area-large ${file ? 'has-file' : ''}`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{display: 'none'}}
                  disabled={uploading}
                />
                <div className="upload-icon-large">📤</div>
                <h3>{file ? file.name : 'Drag & drop or click to upload'}</h3>
                <p>Supports: PDF, DOCX, Word, Images • Max 10MB</p>
                {file && (
                  <div className="file-details">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment Details */}
            <div className="form-details-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Assignment Type</label>
                  <div className="select-wrapper">
                    <select 
                      value={assignmentType} 
                      onChange={(e) => setAssignmentType(e.target.value)} 
                      disabled={uploading}
                      className="form-select"
                    >
                      <option value="question">❓ Question Help</option>
                      <option value="full">📚 Full Assignment</option>
                      <option value="quiz">📝 Quiz Preparation</option>
                      <option value="study">📖 Study Guide</option>
                      <option value="essay">✍️ Essay Writing</option>
                      <option value="project">💻 Project Help</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Urgency Level</label>
                  <div className="urgency-buttons">
                    <button
                      type="button"
                      className={`urgency-btn ${urgency === '1week' ? 'active' : ''}`}
                      onClick={() => setUrgency('1week')}
                      disabled={uploading}
                    >
                      📅 1 Week
                    </button>
                    <button
                      type="button"
                      className={`urgency-btn ${urgency === '48hours' ? 'active' : ''}`}
                      onClick={() => setUrgency('48hours')}
                      disabled={uploading}
                    >
                      ⚡ 48 Hours
                    </button>
                    <button
                      type="button"
                      className={`urgency-btn ${urgency === '24hours' ? 'active' : ''}`}
                      onClick={() => setUrgency('24hours')}
                      disabled={uploading}
                    >
                      🚨 24 Hours
                    </button>
                  </div>
                </div>
              </div>

              {/* Urgency Info */}
              <div className="urgency-info">
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <div>
                    <strong>1 Week</strong>
                    <p>Standard review with detailed feedback</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">⚡</span>
                  <div>
                    <strong>48 Hours</strong>
                    <p>Priority service with quick turnaround</p>
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-icon">🚨</span>
                  <div>
                    <strong>24 Hours</strong>
                    <p>Express service for urgent deadlines</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-button"
              disabled={uploading || !file}
            >
              {uploading ? (
                <>
                  <span className="spinner-small"></span>
                  UPLOADING...
                </>
              ) : (
                '🚀 SUBMIT ASSIGNMENT'
              )}
            </button>
          </form>
        </div>

        {/* Previous Submissions */}
        <div className="submissions-section">
          <div className="section-header">
            <h2>📋 Your Submissions</h2>
            <span className="submissions-count">{submissions.length} total</span>
          </div>

          {loadingSubmissions ? (
            <div className="loading-submissions">
              <div className="spinner"></div>
              <p>Loading your submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="empty-submissions">
              <div className="empty-icon">📭</div>
              <h3>No submissions yet</h3>
              <p>Upload your first assignment above to get started!</p>
            </div>
          ) : (
            <div className="submissions-grid">
              {submissions.map((submission) => {
                const urgencyDisplay = getUrgencyDisplay(submission.urgency);
                const statusDisplay = getStatusDisplay(submission.status);
                const typeDisplay = getTypeDisplay(submission.type);
                
                return (
                  <div key={submission.id} className="submission-card">
                    <div className="submission-header">
                      <div className="submission-type">
                        <span className="type-icon">{typeDisplay.icon}</span>
                        <span className="type-label">{typeDisplay.text}</span>
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
                    
                    <div className="submission-body">
                      <h3>{submission.fileName}</h3>
                      
                      <div className="submission-meta">
                        <div className="meta-item">
                          <span className="meta-label">Submitted</span>
                          <span className="meta-value">{formatDate(submission.submittedAt)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Urgency</span>
                          <span 
                            className="meta-value urgency-value"
                            style={{ color: urgencyDisplay.color }}
                          >
                            {urgencyDisplay.icon} {urgencyDisplay.text}
                          </span>
                        </div>
                      </div>
                      
                      {submission.solutionURL && (
                        <div className="solution-available">
                          <span className="solution-icon">✅</span>
                          <span>Solution available!</span>
                          <a 
                            href={submission.solutionURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-solution-btn"
                          >
                            View Solution
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <div className="submission-actions">
                      <a 
                        href={submission.fileURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="action-btn"
                      >
                        📄 View Original
                      </a>
                      <button className="action-btn" disabled={!submission.solutionURL}>
                        {submission.solutionURL ? '💬 Chat with Tutor' : '⏳ Awaiting Response'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Support Information */}
        <div className="support-info">
          <h3>📞 Need Immediate Help?</h3>
          <div className="support-options">
            <div className="support-option">
              <div className="option-icon">💬</div>
              <div className="option-content">
                <strong>Live Chat Support</strong>
                <p>Chat directly with tutors for quick questions</p>
              </div>
            </div>
            <div className="support-option">
              <div className="option-icon">📧</div>
              <div className="option-content">
                <strong>Email Support</strong>
                <p>support@pulselearn.app</p>
              </div>
            </div>
            <div className="support-option">
              <div className="option-icon">📱</div>
              <div className="option-content">
                <strong>WhatsApp Support</strong>
                <p>+27 12 345 6789</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Assignments;
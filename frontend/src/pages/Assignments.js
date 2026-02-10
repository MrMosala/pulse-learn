// frontend/src/pages/Assignments.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { uploadAssignment, logUserActivity } from '../services/firebase';
import '../App.css';

// Assignment Plan options
const ASSIGNMENT_PLANS = {
  standard: {
    id: 'standard',
    name: 'Standard Plan',
    icon: '📅',
    price: 249,
    features: ['Delivery in 7 days', 'Detailed, step-by-step solution', 'Plagiarism check included'],
    popular: false,
    turnaround: '7 days',
    tagline: 'Best for planning ahead'
  },
  priority: {
    id: 'priority',
    name: 'Priority Plan',
    icon: '⚡',
    price: 349,
    features: ['Delivery in 48 hours', 'Everything in Standard, but faster', 'For upcoming deadlines'],
    popular: true,
    turnaround: '48 hours',
    tagline: 'For upcoming deadlines'
  },
  express: {
    id: 'express',
    name: 'Express Plan',
    icon: '🚨',
    price: 449,
    features: ['Delivery in 24 hours', 'Urgent, high-priority service', 'For last-minute emergencies'],
    popular: false,
    turnaround: '24 hours',
    tagline: 'For last-minute emergencies'
  }
};

function Assignments() {
  const [file, setFile] = useState(null);
  const [assignmentType, setAssignmentType] = useState('question');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('priority'); // Default to most popular
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
        const { getAllUserAssignments } = await import('../services/firebase');
        const userAssignments = await getAllUserAssignments(currentUser.uid);
        
        const sortedAssignments = userAssignments.sort((a, b) => 
          b.createdAt?.toDate() - a.createdAt?.toDate()
        );
        
        setSubmissions(sortedAssignments);
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

    if (!subject.trim()) {
      setMessage('Please enter the subject');
      return;
    }

    const plan = ASSIGNMENT_PLANS[selectedPlan];

    try {
      setUploading(true);
      setMessage('');

      const assignmentData = {
        subject: subject.trim(),
        topic: topic.trim(),
        instructions: instructions.trim(),
        deadline: deadline || null,
        urgency: selectedPlan,
        type: assignmentType,
        planName: plan.name,
        priceEstimate: plan.price,
        turnaround: plan.turnaround
      };

      const result = await uploadAssignment(
        currentUser.uid,
        {
          firstName: userProfile?.firstName || userProfile?.displayName?.split(' ')[0] || '',
          lastName: userProfile?.lastName || userProfile?.displayName?.split(' ').slice(1).join(' ') || '',
          email: userProfile?.email || currentUser.email,
          totalUploads: userProfile?.totalUploads || 0
        },
        file,
        assignmentData
      );

      if (result.success) {
        setMessage(`✅ Assignment submitted! ${plan.name} — estimated delivery: ${plan.turnaround}`);
        setFile(null);
        setSubject('');
        setTopic('');
        setInstructions('');
        setDeadline('');
        e.target.reset();
        
        await logUserActivity(currentUser.uid, 'ASSIGNMENT_UPLOADED', {
          assignmentId: result.assignmentId,
          fileName: file.name,
          subject: assignmentData.subject,
          plan: selectedPlan,
          price: plan.price
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to upload assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return { text: 'Completed', color: '#10B981', icon: '✅' };
      case 'in-progress': return { text: 'In Progress', color: '#3B82F6', icon: '🔄' };
      case 'reviewing': return { text: 'Reviewing', color: '#8B5CF6', icon: '📝' };
      case 'revision-requested': return { text: 'Revision Requested', color: '#F59E0B', icon: '📝' };
      default: return { text: 'Pending', color: '#F59E0B', icon: '⏳' };
    }
  };

  const getTypeDisplay = (type) => {
    switch (type) {
      case 'question': return { text: 'Question Help', icon: '❓' };
      case 'full': return { text: 'Full Assignment', icon: '📚' };
      case 'quiz': return { text: 'Quiz Prep', icon: '📝' };
      case 'study': return { text: 'Study Guide', icon: '📖' };
      case 'essay': return { text: 'Essay Writing', icon: '✍️' };
      case 'project': return { text: 'Project Help', icon: '💻' };
      default: return { text: 'Assignment', icon: '📄' };
    }
  };

  const getPlanDisplay = (planId) => {
    const plan = ASSIGNMENT_PLANS[planId];
    if (plan) return { text: plan.name, icon: plan.icon, price: `R${plan.price}`, turnaround: plan.turnaround };
    // Backwards compatibility with old urgency values
    switch (planId) {
      case '24hours': return { text: 'Express Plan', icon: '🚨', price: 'R449', turnaround: '24 hours' };
      case '48hours': return { text: 'Priority Plan', icon: '⚡', price: 'R349', turnaround: '48 hours' };
      case '1week': return { text: 'Standard Plan', icon: '📅', price: 'R249', turnaround: '7 days' };
      default: return { text: 'Standard Plan', icon: '📋', price: 'R249', turnaround: '7 days' };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleRequestRevision = async (assignmentId) => {
    const revisionNotes = prompt('Please explain what needs revision:');
    if (!revisionNotes || revisionNotes.trim() === '') return;
    
    try {
      const { requestAssignmentRevision } = await import('../services/firebase');
      const result = await requestAssignmentRevision(assignmentId, currentUser.uid, revisionNotes.trim());
      
      if (result.success) {
        setMessage('✅ Revision requested successfully! Tutor will review your request.');
        window.location.reload();
      } else {
        throw new Error(result.error || 'Failed to request revision');
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleDeleteSubmission = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this submission? This cannot be undone.')) {
      return;
    }
    
    try {
      const { deleteUserAssignment } = await import('../services/firebase');
      const result = await deleteUserAssignment(assignmentId, currentUser.uid);
      
      if (result.success) {
        setMessage('✅ Submission deleted successfully!');
        setSubmissions(submissions.filter(sub => sub.id !== assignmentId));
      } else {
        throw new Error(result.error || 'Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  // Get current selected plan
  const currentPlan = ASSIGNMENT_PLANS[selectedPlan];

  return (
    <DashboardLayout>
      <div className="assignments-page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>📚 Assignment Help</h1>
          <p>Get the marks you deserve — expert help with your assignments</p>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-card-icon">🎯</div>
          <div className="info-card-content">
            <h3>How It Works</h3>
            <ol className="how-it-works">
              <li>📤 Upload your assignment file (PDF, DOCX, Images)</li>
              <li>📝 Provide assignment details and instructions</li>
              <li>📦 Choose your delivery plan</li>
              <li>✅ Receive expert solution with step-by-step explanations</li>
              <li>💬 Request revisions if needed</li>
            </ol>
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
              <h3>1. Upload Assignment File</h3>
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
              <h3>2. Assignment Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Mathematics, Physics, Accounting"
                    disabled={uploading}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Topic (Optional)</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Calculus, Thermodynamics"
                    disabled={uploading}
                    className="form-input"
                  />
                </div>
              </div>

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
                  <label>Deadline (Optional)</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={uploading}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions (Optional)</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Any specific requirements or instructions for the tutor..."
                  disabled={uploading}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>

            {/* ===== STEP 3: PLAN SELECTOR ===== */}
            <div className="form-details-section">
              <h3>3. Choose Your Deadline</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                Price is all-inclusive. No hidden fees.
              </p>
              <div className="cv-package-grid">
                {Object.values(ASSIGNMENT_PLANS).map((plan) => (
                  <div
                    key={plan.id}
                    className={`cv-package-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                    onClick={() => !uploading && setSelectedPlan(plan.id)}
                    style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="cv-package-popular-badge">MOST POPULAR</div>
                    )}

                    {/* Icon */}
                    <div className="cv-package-icon">{plan.icon}</div>

                    {/* Name */}
                    <div className="cv-package-name">{plan.name}</div>

                    {/* Price */}
                    <div className="cv-package-price">R{plan.price}</div>

                    {/* Features */}
                    <ul className="cv-package-features">
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>
                          <span className="cv-feature-check">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Tagline */}
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.78rem',
                      color: selectedPlan === plan.id ? '#a78bfa' : '#64748b',
                      fontStyle: 'italic'
                    }}>
                      {plan.tagline}
                    </div>

                    {/* Selected indicator */}
                    {selectedPlan === plan.id && (
                      <div className="cv-package-selected-badge">✔ Selected</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Final Quote Guarantee */}
              <div style={{
                background: 'rgba(139, 92, 246, 0.06)',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>💡</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Final Quote Guarantee
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5' }}>
                    The final price is fixed based on your chosen plan above. If the assignment is exceptionally complex (e.g., a full thesis chapter), we will notify you <strong style={{ color: '#a78bfa' }}>BEFORE</strong> starting and agree on a small complexity fee.
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-button"
              disabled={uploading || !file || !subject.trim()}
            >
              {uploading ? (
                <>
                  <span className="spinner-small"></span>
                  UPLOADING...
                </>
              ) : (
                `${currentPlan.icon} SUBMIT ASSIGNMENT • R${currentPlan.price}`
              )}
            </button>
            
            <div className="price-info">
              <p>📦 Selected: <strong>{currentPlan.icon} {currentPlan.name}</strong> — <strong>R{currentPlan.price}</strong> (Delivery: {currentPlan.turnaround})</p>
              <p>💬 Need help? WhatsApp us for advice!</p>
            </div>
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
                const planDisplay = getPlanDisplay(submission.urgency);
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
                      <p className="subject-text">{submission.subject || 'General'}</p>

                      {/* Plan badge */}
                      {(submission.planName || submission.urgency) && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          color: '#a78bfa',
                          fontWeight: '600',
                          marginBottom: '10px'
                        }}>
                          {planDisplay.icon} {submission.planName || planDisplay.text} • {submission.priceEstimate ? `R${submission.priceEstimate}` : planDisplay.price}
                        </div>
                      )}
                      
                      <div className="submission-meta">
                        <div className="meta-item">
                          <span className="meta-label">Submitted</span>
                          <span className="meta-value">{formatDate(submission.createdAt)}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Delivery</span>
                          <span className="meta-value">
                            {planDisplay.icon} {submission.turnaround || planDisplay.turnaround}
                          </span>
                        </div>
                        {submission.priceEstimate && (
                          <div className="meta-item">
                            <span className="meta-label">Price</span>
                            <span className="meta-value price-value">
                              R{submission.priceEstimate}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {submission.adminNotes && (
                        <div className="admin-notes">
                          <strong>Tutor Notes:</strong>
                          <p>{submission.adminNotes}</p>
                        </div>
                      )}
                      
                      {/* Original File */}
                      {submission.fileUrl && (
                        <div className="file-available">
                          <span className="file-icon">📄</span>
                          <span>Your uploaded file:</span>
                          <a 
                            href={submission.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="download-btn"
                          >
                            Download Original
                          </a>
                        </div>
                      )}

                      {/* Solution File */}
                      {submission.solutionUrl && (
                        <div className="solution-available">
                          <span className="solution-icon">✅</span>
                          <span>Solution available:</span>
                          <a 
                            href={submission.solutionUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-solution-btn"
                          >
                            Download Solution
                          </a>
                          {submission.solutionFileName && (
                            <span className="file-name">({submission.solutionFileName})</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="submission-actions">
                      {submission.fileUrl && (
                        <a 
                          href={submission.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="action-btn"
                        >
                          📄 View Original File
                        </a>
                      )}
                      {submission.solutionUrl && (
                        <a 
                          href={submission.solutionUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="action-btn success"
                        >
                          ✅ Download Solution
                        </a>
                      )}
                      <button 
                        className="action-btn"
                        onClick={() => handleRequestRevision(submission.id)}
                        disabled={submission.status !== 'completed' || submission.status === 'revision-requested'}
                      >
                        {submission.status === 'revision-requested' ? '📝 Revision Requested' : 
                         submission.status === 'completed' ? '💬 Request Revision' : '⏳ Awaiting Review'}
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteSubmission(submission.id)}
                        disabled={!['pending', 'reviewing'].includes(submission.status)}
                      >
                        🗑️ Delete
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
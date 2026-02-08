// frontend/src/pages/CVBuilder.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  submitCVRequest, 
  getAllUserCVRequests,
  uploadCVFile,
  logUserActivity,
  deleteUserCVRequest 
} from '../services/firebase';
import '../App.css';

function CVBuilder() {
  const [jobPosting, setJobPosting] = useState(null);
  const [currentCV, setCurrentCV] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    industry: '',
    experienceLevel: 'entry',
    keySkills: '',
    achievements: '',
    targetCompanies: '',
    deadline: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const { currentUser, userProfile } = useAuth();

  // Fetch user's previous CV requests
  useEffect(() => {
    const fetchUserApplications = async () => {
      if (!currentUser) return;
      
      try {
        const userRequests = await getAllUserCVRequests(currentUser.uid);
        
        // Sort by most recent
        const sortedRequests = userRequests.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        
        setApplications(sortedRequests);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setMessage('❌ Error loading your previous requests');
      } finally {
        setLoadingApplications(false);
      }
    };
    
    fetchUserApplications();
  }, [currentUser]);

  // Handle delete CV request
  const handleDeleteCVRequest = async (requestId) => {
    if (!currentUser) return;
    
    if (!window.confirm('Are you sure you want to delete this CV request?')) {
      return;
    }
    
    try {
      const result = await deleteUserCVRequest(requestId, currentUser.uid);
      
      if (result.success) {
        setMessage('✅ CV request deleted successfully');
        // Refresh applications list
        const updatedApplications = applications.filter(app => app.id !== requestId);
        setApplications(updatedApplications);
        
        // Log activity
        await logUserActivity(currentUser.uid, 'CV_REQUEST_DELETED', {
          requestId: requestId
        });
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  const handleFileUpload = async (file, type) => {
    if (!currentUser || !file) return null;
    
    try {
      setUploadingFile(true);
      const result = await uploadCVFile(currentUser.uid, file);
      
      if (result.success) {
        return result.downloadURL;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setMessage(`❌ Error uploading ${type}: ${error.message}`);
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!currentCV) {
      setMessage('❌ Please upload your current CV');
      return;
    }

    if (!formData.jobTitle.trim()) {
      setMessage('❌ Please enter the job title');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('⏳ Uploading files...');

      // 1. Upload CV file
      const cvFileUrl = await handleFileUpload(currentCV, 'CV');
      if (!cvFileUrl) {
        setMessage('❌ Failed to upload CV file');
        setSubmitting(false);
        return;
      }

      // 2. Upload job posting if provided
      let jobPostingUrl = null;
      if (jobPosting) {
        setMessage('⏳ Uploading job posting...');
        jobPostingUrl = await handleFileUpload(jobPosting, 'job posting');
        // Continue even if job posting upload fails
      }

      setMessage('⏳ Submitting request...');

      // Prepare user data
      const userData = {
        firstName: userProfile?.firstName || currentUser.displayName?.split(' ')[0] || 'User',
        lastName: userProfile?.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: userProfile?.email || currentUser.email || '',
        totalRequests: userProfile?.totalRequests || 0
      };

      // Prepare CV request data
      const cvData = {
        jobTitle: formData.jobTitle.trim(),
        industry: formData.industry.trim(),
        experienceLevel: formData.experienceLevel,
        keySkills: formData.keySkills.split(',').map(skill => skill.trim()).filter(skill => skill),
        achievements: formData.achievements.trim(),
        targetCompanies: formData.targetCompanies.trim(),
        deadline: formData.deadline || null,
        currentCV: cvFileUrl, // Now a URL, not a file
        jobPosting: jobPostingUrl, // URL if uploaded
        notes: formData.notes.trim()
      };

      // Submit CV request
      const result = await submitCVRequest(currentUser.uid, userData, cvData);

      if (result.success) {
        setMessage('✅ CV request submitted successfully! We\'ll notify you when ready.');
        
        // Reset form
        setJobPosting(null);
        setCurrentCV(null);
        setFormData({
          jobTitle: '',
          industry: '',
          experienceLevel: 'entry',
          keySkills: '',
          achievements: '',
          targetCompanies: '',
          deadline: '',
          notes: ''
        });
        
        // Log activity
        await logUserActivity(currentUser.uid, 'CV_REQUEST_SUBMITTED', {
          requestId: result.requestId,
          jobTitle: cvData.jobTitle
        });
        
        // Refresh applications list
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to submit CV request');
      }
    } catch (error) {
      console.error('Error submitting CV request:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': 
        return { 
          text: 'Completed ✅', 
          color: '#10B981', 
          icon: '✅', 
          className: 'status-completed',
          message: 'Your tailored CV is ready!' 
        };
      case 'in-progress': 
        return { 
          text: 'In Progress', 
          color: '#3B82F6', 
          icon: '🔄', 
          className: 'status-progress',
          message: 'Our experts are working on your CV' 
        };
      case 'reviewing': 
        return { 
          text: 'Reviewing', 
          color: '#8B5CF6', 
          icon: '📝', 
          className: 'status-review',
          message: 'Your CV is being reviewed' 
        };
      default: 
        return { 
          text: 'Pending', 
          color: '#F59E0B', 
          icon: '⏳', 
          className: 'status-pending',
          message: 'Awaiting processing' 
        };
    }
  };

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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleFileSelect = (e, setFileFunction, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = {
      cv: ['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      jobPosting: ['.pdf', '.jpg', '.jpeg', '.png', 'image/*', 'application/pdf']
    };
    
    const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
    
    if (!validTypes[fileType].includes(fileExtension) && !validTypes[fileType].includes(file.type)) {
      setMessage(`❌ Invalid file type for ${fileType === 'cv' ? 'CV' : 'job posting'}. Please upload PDF, DOC, or DOCX for CV, or PDF/JPG/PNG for job posting.`);
      e.target.value = ''; // Clear the input
      return;
    }
    
    // Validate file size (10MB for CV, 5MB for job posting)
    const maxSize = fileType === 'cv' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage(`❌ File too large. Maximum size is ${fileType === 'cv' ? '10MB' : '5MB'}`);
      e.target.value = '';
      return;
    }
    
    setFileFunction(file);
    setMessage(`✅ ${fileType === 'cv' ? 'CV' : 'Job posting'} selected: ${file.name}`);
  };

  return (
    <DashboardLayout>
      <div className="cv-builder-page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>💼 Professional CV Builder</h1>
          <p>Get your CV professionally tailored for specific job applications</p>
        </div>

        {/* How It Works Card */}
        <div className="info-card">
          <div className="info-card-icon">💡</div>
          <div className="info-card-content">
            <h3>How It Works</h3>
            <ol className="how-it-works">
              <li>📄 Upload your current CV (required)</li>
              <li>📝 Provide job details and requirements</li>
              <li>🎯 Our experts tailor your CV to match the job</li>
              <li>✅ Receive professionally tailored CV with ATS optimization</li>
              <li>💬 Request revisions if needed</li>
            </ol>
          </div>
        </div>

        {/* Create New CV Form */}
        <div className="cv-form-card">
          <div className="form-header">
            <h2>Request CV Tailoring</h2>
            <span className="form-subtitle">Fill in the job details below</span>
          </div>

          {message && (
            <div className={`message-alert ${message.includes('✅') ? 'success' : message.includes('⏳') ? 'info' : 'error'}`}>
              <div className="alert-icon">
                {message.includes('✅') ? '✅' : message.includes('⏳') ? '⏳' : '❌'}
              </div>
              <div className="alert-message">{message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Upload Section */}
            <div className="upload-section">
              <h3>1. Upload Documents</h3>
              <div className="upload-grid">
                <div 
                  className={`upload-area ${currentCV ? 'has-file' : ''}`}
                  onClick={() => !submitting && !uploadingFile && document.getElementById('cv-input').click()}
                >
                  <input
                    id="cv-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileSelect(e, setCurrentCV, 'cv')}
                    style={{display: 'none'}}
                    disabled={submitting || uploadingFile}
                  />
                  <div className="upload-icon">
                    {uploadingFile ? '⏳' : '📄'}
                  </div>
                  <h4>Your Current CV *</h4>
                  <p>Upload your existing CV (PDF or Word, max 10MB)</p>
                  {currentCV && (
                    <div className="file-info">
                      <span className="file-name">{currentCV.name}</span>
                      <span className="file-size">
                        {(currentCV.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>

                <div 
                  className={`upload-area ${jobPosting ? 'has-file' : ''}`}
                  onClick={() => !submitting && !uploadingFile && document.getElementById('job-posting-input').click()}
                >
                  <input
                    id="job-posting-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,image/*"
                    onChange={(e) => handleFileSelect(e, setJobPosting, 'jobPosting')}
                    style={{display: 'none'}}
                    disabled={submitting || uploadingFile}
                  />
                  <div className="upload-icon">
                    {uploadingFile ? '⏳' : '📸'}
                  </div>
                  <h4>Job Posting (Optional)</h4>
                  <p>Screenshot or PDF of job advertisement (max 5MB)</p>
                  {jobPosting && (
                    <div className="file-info">
                      <span className="file-name">{jobPosting.name}</span>
                      <span className="file-size">
                        {(jobPosting.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Details */}
            <div className="form-details-section">
              <h3>2. Job Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g., Data Scientist, Marketing Manager"
                    required
                    disabled={submitting || uploadingFile}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Finance, Healthcare"
                    disabled={submitting || uploadingFile}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    disabled={submitting || uploadingFile}
                    className="form-select"
                  >
                    <option value="entry">Entry Level / Graduate</option>
                    <option value="junior">Junior (1-3 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior (5+ years)</option>
                    <option value="executive">Executive / Management</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Deadline (Optional)</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    disabled={submitting || uploadingFile}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Key Skills (comma separated)</label>
                <input
                  type="text"
                  name="keySkills"
                  value={formData.keySkills}
                  onChange={handleChange}
                  placeholder="e.g., Python, Data Analysis, Project Management"
                  disabled={submitting || uploadingFile}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Major Achievements</label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  placeholder="List your key achievements, projects, or accomplishments..."
                  rows="3"
                  disabled={submitting || uploadingFile}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Target Companies (Optional)</label>
                <textarea
                  name="targetCompanies"
                  value={formData.targetCompanies}
                  onChange={handleChange}
                  placeholder="Specific companies you're targeting or industry preferences..."
                  rows="2"
                  disabled={submitting || uploadingFile}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any specific requirements, preferred format, or special instructions..."
                  rows="3"
                  disabled={submitting || uploadingFile}
                  className="form-textarea"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={submitting || uploadingFile || !currentCV || !formData.jobTitle.trim()}
            >
              {submitting ? (
                <>
                  <span className="spinner-small"></span>
                  SUBMITTING REQUEST...
                </>
              ) : uploadingFile ? (
                <>
                  <span className="spinner-small"></span>
                  UPLOADING FILES...
                </>
              ) : (
                '🚀 SUBMIT CV REQUEST • R399'
              )}
            </button>
            
            <div className="price-info">
              <p>💡 Standard CV tailoring: <strong>R399</strong> | Express (48h): <strong>R599</strong> | Premium (24h + ATS optimization): <strong>R799</strong></p>
              <p>📞 Need immediate help? WhatsApp: +27 12 345 6789</p>
            </div>
          </form>
        </div>

        {/* Previous Applications */}
        <div className="applications-section">
          <div className="section-header">
            <h2>📋 Your CV Requests</h2>
            <span className="applications-count">{applications.length} total</span>
          </div>

          {loadingApplications ? (
            <div className="loading-applications">
              <div className="spinner"></div>
              <p>Loading your requests...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-applications">
              <div className="empty-icon">📭</div>
              <h3>No requests yet</h3>
              <p>Submit your first CV request above to get started!</p>
            </div>
          ) : (
            <div className="applications-grid">
              {applications.map((app) => {
                const statusDisplay = getStatusDisplay(app.status || 'pending');
                const experienceDisplay = getExperienceDisplay(app.experienceLevel);
                
                return (
                  <div key={app.id} className="application-card">
                    <div className="application-header">
                      <div className="application-type">
                        <span className="type-icon">{experienceDisplay.icon}</span>
                        <span className="type-label">{experienceDisplay.text}</span>
                      </div>
                      <div 
                        className={`status-badge ${statusDisplay.className}`}
                        style={{ 
                          backgroundColor: `${statusDisplay.color}20`,
                          color: statusDisplay.color,
                          borderColor: statusDisplay.color
                        }}
                      >
                        {statusDisplay.icon} {statusDisplay.text}
                      </div>
                      
                      {/* Status Message - Added */}
                      <div style={{marginTop: '8px'}}>
                        <p style={{
                          color: statusDisplay.color,
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {statusDisplay.icon} {statusDisplay.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="application-body">
                      <h3>{app.jobTitle || 'CV Tailoring'}</h3>
                      {app.industry && (
                        <p className="company-name">{app.industry}</p>
                      )}
                      
                      <div className="application-details">
                        {app.keySkills && app.keySkills.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">Skills:</span>
                            <span className="detail-value">{Array.isArray(app.keySkills) ? app.keySkills.join(', ') : app.keySkills}</span>
                          </div>
                        )}
                        
                        <div className="detail-item">
                          <span className="detail-label">Submitted:</span>
                          <span className="detail-value">{formatDate(app.createdAt)}</span>
                        </div>
                        
                        {app.deadline && (
                          <div className="detail-item">
                            <span className="detail-label">Deadline:</span>
                            <span className="detail-value">{app.deadline}</span>
                          </div>
                        )}
                        
                        {app.priceEstimate && (
                          <div className="detail-item">
                            <span className="detail-label">Price:</span>
                            <span className="detail-value price-value">R{app.priceEstimate}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Original CV Section */}
                      {app.currentCV && (
                        <div className="cv-available" style={{marginBottom: '10px'}}>
                          <span className="cv-icon">📄</span>
                          <span>Your Original CV</span>
                          <a 
                            href={app.currentCV} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="download-btn"
                            style={{marginLeft: '10px'}}
                          >
                            Download
                          </a>
                        </div>
                      )}

                      {/* Tailored CV Section - NEW */}
                      {app.tailoredCV && (
                        <div className="tailored-cv-available" style={{
                          background: '#d1fae5',
                          padding: '12px',
                          borderRadius: '8px',
                          marginTop: '10px',
                          border: '1px solid #10b981'
                        }}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'}}>
                            <span style={{fontSize: '20px'}}>✅</span>
                            <strong style={{color: '#047857'}}>Tailored CV Ready!</strong>
                          </div>
                          <p style={{color: '#065f46', fontSize: '14px', marginBottom: '10px'}}>
                            Your professionally tailored CV is ready for download.
                            {app.tailoredFileName && ` File: ${app.tailoredFileName}`}
                          </p>
                          <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                            <a 
                              href={app.tailoredCV} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="download-btn"
                              style={{
                                background: '#10b981',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}
                            >
                              📥 Download Tailored CV
                            </a>
                            {app.tailoredCV.includes('.pdf') && (
                              <a 
                                href={app.tailoredCV} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  padding: '8px 16px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontWeight: '500',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                👁️ View PDF
                              </a>
                            )}
                          </div>
                          {app.completedAt && (
                            <p style={{marginTop: '8px', fontSize: '12px', color: '#047857'}}>
                              Completed: {formatDate(app.completedAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Admin Notes Section */}
                      {app.adminNotes && (
                        <div className="admin-notes" style={{
                          background: '#fef3c7',
                          padding: '12px',
                          borderRadius: '8px',
                          marginTop: '10px',
                          border: '1px solid #f59e0b'
                        }}>
                          <strong>📝 Admin Notes:</strong>
                          <p style={{marginTop: '5px', color: '#92400e'}}>{app.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="application-actions">
                      {app.currentCV && (
                        <a 
                          href={app.currentCV} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="action-btn"
                        >
                          📄 View Original CV
                        </a>
                      )}
                      
                      {/* Delete Button - Only show for pending or reviewing status */}
                      {(app.status === 'pending' || app.status === 'reviewing') ? (
                        <button 
                          onClick={() => handleDeleteCVRequest(app.id)}
                          className="action-btn delete"
                        >
                          🗑️ Delete
                        </button>
                      ) : (
                        <button className="action-btn" disabled>
                          {app.status === 'completed' ? '💬 Request Revision' : '⏳ Awaiting Review'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <h3>💡 Tips for Best Results</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">📄</div>
              <div className="tip-content">
                <strong>Use Word Format</strong>
                <p>Upload .docx files for easier editing and optimization</p>
              </div>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🎯</div>
              <div className="tip-content">
                <strong>Be Specific</strong>
                <p>Include exact job requirements for better tailoring</p>
              </div>
            </div>
            <div className="tip-card">
              <div className="tip-icon">⏰</div>
              <div className="tip-content">
                <strong>Plan Ahead</strong>
                <p>Submit 3-5 days before your application deadline</p>
              </div>
            </div>
            <div className="tip-card">
              <div className="tip-icon">📞</div>
              <div className="tip-content">
                <strong>Get Support</strong>
                <p>Chat with our career advisors for personalized advice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CVBuilder;
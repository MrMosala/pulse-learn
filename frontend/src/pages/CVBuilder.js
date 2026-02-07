// frontend/src/pages/CVBuilder.js
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function CVBuilder() {
  const [jobPosting, setJobPosting] = useState(null);
  const [currentCV, setCurrentCV] = useState(null);
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    applicationType: 'internship',
    notes: ''
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const { currentUser, userProfile } = useAuth();

  // Fetch user's previous applications
// Replace the entire useEffect with:
React.useEffect(() => {
  const fetchUserApplications = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'cvRequests'),
        where('studentId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      const apps = [];
      querySnapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() });
      });
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };
  
  fetchUserApplications();
}, [currentUser]); // Now only depends on currentUser

  async function fetchApplications() {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'cvRequests'),
        where('studentId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      const apps = [];
      querySnapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() });
      });
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!jobPosting || !currentCV) {
      setMessage('Please upload both job posting and your CV');
      return;
    }

    try {
      setUploading(true);
      setMessage('');

      // Upload job posting image
      const jobPostingRef = ref(storage, `cvs/${currentUser.uid}/job-postings/${Date.now()}_${jobPosting.name}`);
      await uploadBytes(jobPostingRef, jobPosting);
      const jobPostingURL = await getDownloadURL(jobPostingRef);

      // Upload current CV
      const cvRef = ref(storage, `cvs/${currentUser.uid}/original/${Date.now()}_${currentCV.name}`);
      await uploadBytes(cvRef, currentCV);
      const cvURL = await getDownloadURL(cvRef);

      // Create CV request in Firestore
      await addDoc(collection(db, 'cvRequests'), {
        studentId: currentUser.uid,
        studentName: userProfile?.displayName || 'Student',
        studentNumber: userProfile?.studentNumber || '',
        university: userProfile?.university || '',
        course: userProfile?.course || '',
        jobPostingURL: jobPostingURL,
        currentCVURL: cvURL,
        position: formData.position,
        company: formData.company,
        applicationType: formData.applicationType,
        notes: formData.notes,
        status: 'pending',
        submittedAt: serverTimestamp(),
        completedAt: null,
        tailoredCVURL: null
      });

      setMessage('✅ CV request submitted! We\'ll notify you when ready.');
      setJobPosting(null);
      setCurrentCV(null);
      setFormData({
        position: '',
        company: '',
        applicationType: 'internship',
        notes: ''
      });
      
      // Refresh applications list
      fetchApplications();
      
      // Reset file inputs
      e.target.reset();
    } catch (error) {
      console.error('Error submitting CV request:', error);
      setMessage('❌ Error submitting request. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return { text: 'Completed', className: 'status-completed', icon: '✅' };
      case 'in_progress': return { text: 'In Progress', className: 'status-progress', icon: '🔄' };
      case 'reviewing': return { text: 'Under Review', className: 'status-review', icon: '📝' };
      default: return { text: 'Pending', className: 'status-pending', icon: '⏳' };
    }
  };

  const getApplicationTypeIcon = (type) => {
    switch (type) {
      case 'internship': return '🎓';
      case 'graduate': return '🎯';
      case 'parttime': return '⏱️';
      case 'bursary': return '💰';
      case 'learnership': return '📚';
      default: return '💼';
    }
  };

  return (
    <DashboardLayout>
      <div className="cv-builder-page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>💼 CV Builder</h1>
          <p>Upload a job posting and your CV. We'll tailor it perfectly for you!</p>
        </div>

        {/* How It Works Card */}
        <div className="info-card">
          <div className="info-card-icon">💡</div>
          <div className="info-card-content">
            <h3>How It Works</h3>
            <p>Upload a job posting image and your current CV. Our experts will analyze the requirements and tailor your CV to match the position perfectly!</p>
            <div className="info-card-steps">
              <div className="step">
                <span className="step-number">1</span>
                <span className="step-text">Upload job posting & CV</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span className="step-text">We analyze & tailor</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-text">Download perfect CV</span>
              </div>
            </div>
          </div>
        </div>

        {/* Create New CV Form */}
        <div className="cv-form-card">
          <div className="form-header">
            <h2>Create New Tailored CV</h2>
            <span className="form-subtitle">Fill in the details below</span>
          </div>

          {message && (
            <div className={`message-alert ${message.includes('✅') ? 'success' : 'error'}`}>
              <div className="alert-icon">{message.includes('✅') ? '✅' : '❌'}</div>
              <div className="alert-message">{message}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Upload Section */}
            <div className="upload-section">
              <h3>Upload Documents</h3>
              <div className="upload-grid">
                <div 
                  className={`upload-area ${jobPosting ? 'has-file' : ''}`}
                  onClick={() => document.getElementById('job-posting-input').click()}
                >
                  <input
                    id="job-posting-input"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setJobPosting(e.target.files[0])}
                    style={{display: 'none'}}
                    disabled={uploading}
                  />
                  <div className="upload-icon">📸</div>
                  <h4>Job Posting</h4>
                  <p>Screenshot or photo of the job advertisement</p>
                  {jobPosting && (
                    <div className="file-info">
                      <span className="file-name">{jobPosting.name}</span>
                      <span className="file-size">
                        {(jobPosting.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>

                <div 
                  className={`upload-area ${currentCV ? 'has-file' : ''}`}
                  onClick={() => document.getElementById('cv-input').click()}
                >
                  <input
                    id="cv-input"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setCurrentCV(e.target.files[0])}
                    style={{display: 'none'}}
                    disabled={uploading}
                  />
                  <div className="upload-icon">📄</div>
                  <h4>Your Current CV</h4>
                  <p>Your existing resume or CV document</p>
                  {currentCV && (
                    <div className="file-info">
                      <span className="file-name">{currentCV.name}</span>
                      <span className="file-size">
                        {(currentCV.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Details */}
            <div className="form-details-section">
              <h3>Application Details</h3>
              
              <div className="form-group">
                <label>Position You're Applying For *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g., Data Science Intern, Junior Developer"
                  required
                  disabled={uploading}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., Deloitte, Amazon, Google"
                    required
                    disabled={uploading}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Application Type *</label>
                  <select
                    name="applicationType"
                    value={formData.applicationType}
                    onChange={handleChange}
                    disabled={uploading}
                    className="form-select"
                  >
                    <option value="internship">Internship</option>
                    <option value="graduate">Graduate Job</option>
                    <option value="parttime">Part-time Job</option>
                    <option value="bursary">Bursary</option>
                    <option value="learnership">Learnership</option>
                    <option value="scholarship">Scholarship</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special requirements, skills to highlight, or specific instructions..."
                  rows="3"
                  disabled={uploading}
                  className="form-textarea"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={uploading || !jobPosting || !currentCV || !formData.position || !formData.company}
            >
              {uploading ? (
                <>
                  <span className="spinner-small"></span>
                  SUBMITTING...
                </>
              ) : (
                '🚀 CREATE TAILORED CV'
              )}
            </button>
          </form>
        </div>

        {/* Previous Applications */}
        <div className="applications-section">
          <div className="section-header">
            <h2>📋 Your Applications</h2>
            <span className="applications-count">{applications.length} total</span>
          </div>

          {loadingApplications ? (
            <div className="loading-applications">
              <div className="spinner"></div>
              <p>Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-applications">
              <div className="empty-icon">📭</div>
              <h3>No applications yet</h3>
              <p>Submit your first CV request above to get started!</p>
            </div>
          ) : (
            <div className="applications-grid">
              {applications.map((app) => {
                const status = getStatusBadge(app.status);
                const typeIcon = getApplicationTypeIcon(app.applicationType);
                const submittedDate = app.submittedAt?.toDate().toLocaleDateString() || 'Recently';
                
                return (
                  <div key={app.id} className="application-card">
                    <div className="application-header">
                      <div className="application-type">
                        <span className="type-icon">{typeIcon}</span>
                        <span className="type-label">{app.applicationType}</span>
                      </div>
                      <div className={`status-badge ${status.className}`}>
                        {status.icon} {status.text}
                      </div>
                    </div>
                    
                    <div className="application-body">
                      <h3>{app.position}</h3>
                      <p className="company-name">{app.company}</p>
                      <p className="application-notes">{app.notes || 'No additional notes'}</p>
                      
                      <div className="application-meta">
                        <div className="meta-item">
                          <span className="meta-label">Submitted</span>
                          <span className="meta-value">{submittedDate}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">CV Status</span>
                          <span className="meta-value">{status.text}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="application-actions">
                      {app.tailoredCVURL ? (
                        <a 
                          href={app.tailoredCVURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="download-btn"
                        >
                          📥 Download CV
                        </a>
                      ) : (
                        <button className="view-btn" disabled>
                          ⏳ Processing
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
          <h3>💡 Tips for Better Results</h3>
          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-icon">📷</div>
              <div className="tip-content">
                <strong>Clear Job Posting Screenshot</strong>
                <p>Make sure all requirements are visible in your screenshot</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">📄</div>
              <div className="tip-content">
                <strong>Use Word Format</strong>
                <p>Upload .docx files for easier editing and better results</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">🎯</div>
              <div className="tip-content">
                <strong>Be Specific</strong>
                <p>Include all relevant skills and experiences in your notes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CVBuilder;
// frontend/src/pages/CVBuilder.js
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

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
  const { currentUser } = useAuth();

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
      e.target.reset();
    } catch (error) {
      console.error('Error submitting CV request:', error);
      setMessage('❌ Error submitting request. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page cv-builder-page">
      <h1 className="section-title">💼 CV Builder</h1>

      <div className="alert alert-info">
        <span style={{fontSize: '1.5rem'}}>💡</span>
        <div>
          <strong>How it works:</strong> Upload a job posting image and your current CV. 
          We'll tailor your CV to match the position perfectly!
        </div>
      </div>

      <div className="glass-card">
        <h3>Create New Tailored CV</h3>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="upload-grid">
            <div className="upload-area" onClick={() => document.getElementById('job-posting-input').click()}>
              <div className="upload-icon">📸</div>
              <h3>Job Posting</h3>
              <p>{jobPosting ? jobPosting.name : 'Upload screenshot or photo'}</p>
              <input
                id="job-posting-input"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setJobPosting(e.target.files[0])}
                style={{display: 'none'}}
                disabled={uploading}
              />
            </div>

            <div className="upload-area" onClick={() => document.getElementById('cv-input').click()}>
              <div className="upload-icon">📄</div>
              <h3>Your Current CV</h3>
              <p>{currentCV ? currentCV.name : 'Upload your template/resume'}</p>
              <input
                id="cv-input"
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setCurrentCV(e.target.files[0])}
                style={{display: 'none'}}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Position You're Applying For</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Data Science Intern at IBM"
              required
              disabled={uploading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g., Deloitte"
                required
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>Application Type</label>
              <select
                name="applicationType"
                value={formData.applicationType}
                onChange={handleChange}
                disabled={uploading}
              >
                <option value="internship">Internship</option>
                <option value="graduate">Graduate Job</option>
                <option value="parttime">Part-time Job</option>
                <option value="bursary">Bursary</option>
                <option value="learnership">Learnership</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special requirements or things to highlight?"
              rows="3"
              disabled={uploading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={uploading || !jobPosting || !currentCV}>
            {uploading ? 'SUBMITTING...' : 'CREATE TAILORED CV'}
          </button>
        </form>
      </div>

      <h3 className="section-title" style={{fontSize: '1.5rem'}}>Your Applications</h3>
      <div className="applications-list">
        <div className="application-item glass-card">
          <div className="application-info">
            <h3>Example Application</h3>
            <span className="company-tag">Company Name</span>
            <p>Submitted: Just now</p>
          </div>
          <span className="status-badge status-review">In Review</span>
        </div>
      </div>
    </div>
  );
}

export default CVBuilder;

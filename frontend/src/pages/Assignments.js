// frontend/src/pages/Assignments.js
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

function Assignments() {
  const [file, setFile] = useState(null);
  const [assignmentType, setAssignmentType] = useState('question');
  const [urgency, setUrgency] = useState('1week');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();

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
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setMessage('❌ Error submitting assignment. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="page assignments-page">
      <h1 className="section-title">📝 Assignment Support</h1>

      <div className="glass-card">
        <h3>Upload New Assignment</h3>
        
        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
            <div className="upload-icon">📤</div>
            <h3>{file ? file.name : 'Click to upload file'}</h3>
            <p>PDF, DOCX, Images • Max 10MB</p>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              style={{display: 'none'}}
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label>Assignment Type</label>
            <select value={assignmentType} onChange={(e) => setAssignmentType(e.target.value)} disabled={uploading}>
              <option value="question">Question Help</option>
              <option value="full">Full Assignment</option>
              <option value="quiz">Quiz Preparation</option>
              <option value="study">Study Guide</option>
            </select>
          </div>

          <div className="form-group">
            <label>Urgency</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)} disabled={uploading}>
              <option value="1week">1 Week (Standard)</option>
              <option value="48hours">48 Hours (Priority)</option>
              <option value="24hours">24 Hours (Express)</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={uploading || !file}>
            {uploading ? 'UPLOADING...' : 'SUBMIT ASSIGNMENT'}
          </button>
        </form>
      </div>

      <h3 className="section-title" style={{fontSize: '1.5rem'}}>Your Submissions</h3>
      <div className="assignments-list">
        <div className="assignment-item glass-card">
          <div className="assignment-info">
            <h3>Example Assignment</h3>
            <p>Status: Pending review</p>
          </div>
          <span className="status-badge status-pending">In Progress</span>
        </div>
      </div>
    </div>
  );
}

export default Assignments;

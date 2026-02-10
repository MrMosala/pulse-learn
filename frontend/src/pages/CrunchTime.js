// frontend/src/pages/CrunchTime.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  bookCrunchTimeSession,
  getUserCrunchTimeSessions,
  requestSessionCancellation
} from '../services/firebase';
import '../App.css';

// Education level tiers
const SESSION_TIERS = {
  highschool: {
    id: 'highschool',
    name: 'High School',
    icon: '🏫',
    price: 249,
    duration: '2 hours',
    subjects: [
      'Mathematics (Grades 8-12)',
      'Physical Sciences (Physics & Chemistry)',
      'Life Sciences (Biology)',
      'English Home / First Additional Language',
      'And most other subjects'
    ],
    tagline: 'Get clear explanations and exam prep for:'
  },
  firstyear: {
    id: 'firstyear',
    name: 'First-Year University',
    icon: '🎓',
    price: 299,
    duration: '2 hours',
    subjects: [
      'Mathematics I / Calculus I',
      'Introduction to Computer Science',
      'Physics I',
      'Statistics I',
      'Business Statistics'
    ],
    tagline: 'Build a strong foundation in:'
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced University',
    icon: '⚡',
    price: 349,
    duration: '2 hours',
    subjects: [
      'Calculus II & III',
      'Data Structures & Programming',
      'Advanced Physics',
      'Econometrics / Finance Maths',
      'Linear Algebra'
    ],
    tagline: 'Tackle complex topics in:'
  }
};

function CrunchTime() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [bookingData, setBookingData] = useState({
    subject: '',
    topic: '',
    date: '',
    time: '',
    duration: 120,
    notes: '',
    platform: 'Zoom'
  });
  const [userSessions, setUserSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  // Cancellation state
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellingSession, setCancellingSession] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  
  const { currentUser, userProfile } = useAuth();

  // Fetch user's sessions
  useEffect(() => {
    const fetchUserSessions = async () => {
      if (!currentUser) return;
      try {
        const sessions = await getUserCrunchTimeSessions(currentUser.uid);
        setUserSessions(sessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setMessage('❌ Error loading your sessions');
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchUserSessions();
  }, [currentUser]);

  // Handle cancellation request
  const handleRequestCancellation = async (sessionId) => {
    if (!currentUser) {
      setMessage('❌ Please login to request cancellation');
      return;
    }
    if (!cancellationReason.trim()) {
      setMessage('❌ Please provide a reason for cancellation');
      return;
    }
    try {
      setSubmitting(true);
      setMessage('⏳ Submitting cancellation request...');
      const result = await requestSessionCancellation(sessionId, currentUser.uid, cancellationReason);
      if (result.success) {
        setMessage(`✅ ${result.message || 'Cancellation request submitted! Admin will review your request.'}`);
        setShowCancellationModal(false);
        setCancellationReason('');
        setCancellingSession(null);
        const sessions = await getUserCrunchTimeSessions(currentUser.uid);
        setUserSessions(sessions);
      } else {
        throw new Error(result.error || 'Failed to submit cancellation request');
      }
    } catch (error) {
      console.error('Error requesting cancellation:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookClick = (tier) => {
    setSelectedTier(tier);
    setBookingData({
      subject: '',
      topic: '',
      date: '',
      time: '',
      duration: 120,
      notes: '',
      platform: 'Zoom'
    });
    setShowBookingModal(true);
  };

  const handleInputChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!currentUser) { setMessage('❌ Please login to book a session'); return; }
    if (!bookingData.date || !bookingData.time) { setMessage('❌ Please select date and time'); return; }
    if (!bookingData.subject.trim()) { setMessage('❌ Please select or enter your subject'); return; }

    const tier = SESSION_TIERS[selectedTier];

    try {
      setSubmitting(true);
      setMessage('⏳ Processing your booking...');
      const dateTime = new Date(`${bookingData.date}T${bookingData.time}`);

      const userData = {
        firstName: userProfile?.firstName || currentUser.displayName?.split(' ')[0] || 'User',
        lastName: userProfile?.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: userProfile?.email || currentUser.email || '',
        totalSessions: userProfile?.totalSessions || 0
      };

      const sessionData = {
        subject: bookingData.subject,
        topic: bookingData.topic,
        dateTime: dateTime.toISOString(),
        duration: bookingData.duration,
        platform: bookingData.platform,
        notes: bookingData.notes,
        price: tier.price,
        tierName: tier.name,
        tierId: tier.id
      };

      const result = await bookCrunchTimeSession(currentUser.uid, userData, sessionData);

      if (result.success) {
        setMessage(`✅ ${tier.name} session booked! We'll confirm your slot shortly.`);
        setShowBookingModal(false);
        setBookingData({ subject: '', topic: '', date: '', time: '', duration: 120, notes: '', platform: 'Zoom' });
        const sessions = await getUserCrunchTimeSessions(currentUser.uid);
        setUserSessions(sessions);
      } else {
        throw new Error(result.error || 'Failed to book session');
      }
    } catch (error) {
      console.error('Error booking session:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'confirmed': return { text: 'Confirmed', color: '#10B981', icon: '✅' };
      case 'completed': return { text: 'Completed', color: '#3B82F6', icon: '🏁' };
      case 'cancelled': return { text: 'Cancelled', color: '#EF4444', icon: '❌' };
      default: return { text: 'Requested', color: '#F59E0B', icon: '⏳' };
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour += 2) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get subject options for the selected tier
  const getSubjectOptions = () => {
    if (!selectedTier) return [];
    const tier = SESSION_TIERS[selectedTier];
    // Return clean subject names without parenthetical details for the dropdown
    return tier.subjects.filter(s => !s.startsWith('And ')).map(s => s);
  };

  return (
    <DashboardLayout>
      <div className="crunchtime-page-content">

        {/* Page Header */}
        <div className="page-header">
          <h1>⏰ PulseTime Tutoring</h1>
          <p>Master your subjects with focused, 2-hour sessions</p>
        </div>

        {/* How It Works */}
        <div className="info-card">
          <div className="info-card-icon">🎯</div>
          <div className="info-card-content">
            <h3>How It Works</h3>
            <ol className="how-it-works">
              <li>📚 Choose your subject and education level below</li>
              <li>📅 Book a date and time that works for you</li>
              <li>💳 Pay securely online to confirm your slot</li>
              <li>🎥 Join the live video session and get the help you need</li>
            </ol>
            <p style={{ marginTop: '0.75rem', color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
              We're a small, dedicated team of tutors committed to your success.
            </p>
          </div>
        </div>

        {message && (
          <div className={`message-alert ${message.includes('✅') ? 'success' : message.includes('⏳') ? 'info' : 'error'}`}>
            <div className="alert-icon">{message.includes('✅') ? '✅' : message.includes('⏳') ? '⏳' : '❌'}</div>
            <div className="alert-message">{message}</div>
          </div>
        )}

        {/* ===== PRICING TIERS ===== */}
        <div className="sessions-section">
          <div className="section-header">
            <h2>📚 Choose Your Subject & Level</h2>
          </div>

          <div className="cv-package-grid">
            {Object.values(SESSION_TIERS).map((tier) => (
              <div key={tier.id} className="cv-package-card" style={{ textAlign: 'left' }}>
                {/* Icon & Name */}
                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                  <div className="cv-package-icon">{tier.icon}</div>
                  <div className="cv-package-name">{tier.name}</div>
                  <div className="cv-package-price">R{tier.price} <span style={{ fontSize: '0.8rem', fontWeight: '500', color: '#94a3b8' }}>/ 2hrs</span></div>
                </div>

                {/* Tagline */}
                <div style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  marginBottom: '0.75rem',
                  fontStyle: 'italic'
                }}>
                  {tier.tagline}
                </div>

                {/* Subjects */}
                <ul className="cv-package-features">
                  {tier.subjects.map((subject, idx) => (
                    <li key={idx}>
                      <span className="cv-feature-check">✓</span>
                      {subject}
                    </li>
                  ))}
                </ul>

                {/* Book Button */}
                <button 
                  className="submit-button"
                  style={{ marginTop: '1.25rem', fontSize: '0.9rem', padding: '0.85rem' }}
                  onClick={() => handleBookClick(tier.id)}
                >
                  📅 Book a {tier.name.split(' ')[0]} Session
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ===== YOUR SESSIONS ===== */}
        <div className="bookings-section">
          <div className="section-header">
            <h2>📋 Your Sessions</h2>
            <span className="sessions-count">
              {userSessions.filter(s => s.status !== 'cancelled').length} active
            </span>
          </div>

          {loadingSessions ? (
            <div className="loading-sessions">
              <div className="spinner"></div>
              <p>Loading your sessions...</p>
            </div>
          ) : userSessions.length === 0 ? (
            <div className="empty-bookings">
              <div className="empty-icon">📭</div>
              <h3>No sessions booked yet</h3>
              <p>Choose a level above to book your first tutoring session!</p>
            </div>
          ) : (
            <div className="sessions-list">
              {userSessions.filter(s => s.status !== 'cancelled').map((session) => {
                const statusDisplay = getStatusDisplay(session.status);
                
                return (
                  <div key={session.id} className="session-booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>{session.subject}</h3>
                        <p className="booking-topic">{session.topic || 'General Tutoring'}</p>
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

                    {/* Tier badge */}
                    {session.tierName && (
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
                        📚 {session.tierName} • R{session.price}
                      </div>
                    )}
                    
                    <div className="booking-details">
                      <div className="detail-item">
                        <span className="detail-label">Date & Time:</span>
                        <span className="detail-value">{formatDate(session.dateTime)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Duration:</span>
                        <span className="detail-value">{session.duration || 120} minutes</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Platform:</span>
                        <span className="detail-value">{session.platform || 'Zoom'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value price">R{session.price || 299}</span>
                      </div>
                    </div>
                    
                    {session.meetingLink && (
                      <div className="meeting-link">
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="join-btn">
                          🔗 Join Meeting
                        </a>
                      </div>
                    )}

                    {session.cancellationRequested && (
                      <div className="cancellation-status">
                        <div className="status-badge warning">⚠️ Cancellation Requested</div>
                        <p><strong>Status:</strong> {session.cancellationStatus || 'Pending admin review'}</p>
                        {session.cancellationReason && <p><strong>Reason:</strong> {session.cancellationReason}</p>}
                        {session.cancellationPenaltyCalculated && (
                          <p className="penalty-note">
                            <strong>Penalty:</strong> R{session.cancellationPenaltyCalculated}
                            {session.cancellationRefundCalculated && (
                              <span> • <strong>Refund:</strong> R{session.cancellationRefundCalculated}</span>
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {session.status === 'confirmed' && !session.cancellationRequested && (
                      <button 
                        className="cancel-btn secondary"
                        onClick={() => { setCancellingSession(session.id); setShowCancellationModal(true); }}
                      >
                        🚫 Request Cancellation
                      </button>
                    )}
                    
                    {session.adminNotes && (
                      <div className="admin-notes">
                        <strong>Admin Notes:</strong>
                        <p>{session.adminNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Steps Section */}
        <div className="how-it-works">
          <h2>🔄 How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Choose Level</h3>
                <p>Pick High School, First-Year, or Advanced</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Pick Time Slot</h3>
                <p>Choose a convenient 2-hour time slot</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Join Session</h3>
                <p>Connect via video call with your tutor</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Learn & Excel</h3>
                <p>Get personalized attention and master concepts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOOKING MODAL ===== */}
      {showBookingModal && selectedTier && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{SESSION_TIERS[selectedTier].icon} Book {SESSION_TIERS[selectedTier].name} Session</h2>
              <button className="close-modal" onClick={() => setShowBookingModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitBooking}>
              <div className="form-group">
                <label>Subject *</label>
                <select
                  name="subject"
                  value={bookingData.subject}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a subject</option>
                  {getSubjectOptions().map((subject, idx) => (
                    <option key={idx} value={subject}>{subject}</option>
                  ))}
                  <option value="Other">Other (specify in notes)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Specific Topic (Optional)</label>
                <input
                  type="text"
                  name="topic"
                  value={bookingData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Integration by parts, Newton's laws"
                  className="form-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <select
                    name="time"
                    value={bookingData.time}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map((time, idx) => (
                      <option key={idx} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    name="duration"
                    value={bookingData.duration}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="120">2 hours (Standard)</option>
                    <option value="180">3 hours (Extended)</option>
                    <option value="60">1 hour (Quick)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Platform</label>
                  <select
                    name="platform"
                    value={bookingData.platform}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleInputChange}
                  placeholder="Specific areas to focus on, learning style preferences, etc."
                  rows="3"
                  className="form-textarea"
                />
              </div>
              
              <div className="price-summary">
                <div className="price-item">
                  <span>{SESSION_TIERS[selectedTier].icon} {SESSION_TIERS[selectedTier].name}:</span>
                  <span>R{SESSION_TIERS[selectedTier].price}</span>
                </div>
                <div className="price-total">
                  <strong>Total:</strong>
                  <strong>R{SESSION_TIERS[selectedTier].price}</strong>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowBookingModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm"
                  disabled={submitting || !bookingData.date || !bookingData.time || !bookingData.subject}
                >
                  {submitting ? (
                    <><span className="spinner-small"></span> PROCESSING...</>
                  ) : (
                    `🚀 BOOK NOW • R${SESSION_TIERS[selectedTier].price}`
                  )}
                </button>
              </div>
              
              <div className="payment-notice">
                <p>💳 Payment will be processed after admin confirms your session</p>
                <p>📞 Need help? WhatsApp us for support!</p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== CANCELLATION MODAL ===== */}
      {showCancellationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🚫 Request Session Cancellation</h2>
              <button className="close-modal" onClick={() => { setShowCancellationModal(false); setCancellationReason(''); setCancellingSession(null); }}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="warning-card">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h3>Cancellation Policy</h3>
                  <ul>
                    <li>Within 24 hours: 50% penalty</li>
                    <li>Within 48 hours: 25% penalty</li>
                    <li>More than 48 hours: 10% penalty</li>
                    <li>More than 7 days: No penalty (full refund)</li>
                    <li>Admin approval required for all cancellations</li>
                  </ul>
                </div>
              </div>
              
              <div className="form-group">
                <label>Reason for Cancellation *</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please explain why you need to cancel this session..."
                  rows="4"
                  className="form-textarea"
                  required
                />
                <small className="form-hint">Your reason will be reviewed by admin.</small>
              </div>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => { setShowCancellationModal(false); setCancellationReason(''); setCancellingSession(null); }} disabled={submitting}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-warning"
                onClick={() => handleRequestCancellation(cancellingSession)}
                disabled={submitting || !cancellationReason.trim()}
              >
                {submitting ? (<><span className="spinner-small"></span> SUBMITTING...</>) : ('🚫 Submit Cancellation Request')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CrunchTime;
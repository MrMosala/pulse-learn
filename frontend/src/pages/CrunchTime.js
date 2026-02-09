import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { 
  bookCrunchTimeSession,
  getUserCrunchTimeSessions,
  requestSessionCancellation  // NEW: Add this import
} from '../services/firebase';
import '../App.css';

function CrunchTime() {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [bookingData, setBookingData] = useState({
    subject: '',
    topic: '',
    date: '',
    time: '',
    duration: 120, // 2 hours in minutes
    notes: '',
    platform: 'Zoom'
  });
  const [userSessions, setUserSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  // Add these new state variables
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellingSession, setCancellingSession] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  
  const { currentUser, userProfile } = useAuth();

  // Available tutoring sessions
  const tutoringSessions = [
    { id: 1, subject: 'Mathematics', tutor: 'Dr. Smith', duration: '2 hours', price: 299, icon: '🧮', category: 'math' },
    { id: 2, subject: 'Data Science', tutor: 'Prof. Johnson', duration: '2 hours', price: 349, icon: '💻', category: 'tech' },
    { id: 3, subject: 'Statistics', tutor: 'Ms. Williams', duration: '2 hours', price: 279, icon: '📊', category: 'math' },
    { id: 4, subject: 'Calculus', tutor: 'Dr. Brown', duration: '2 hours', price: 319, icon: '🔢', category: 'math' },
    { id: 5, subject: 'Programming', tutor: 'Mr. Davis', duration: '2 hours', price: 329, icon: '👨‍💻', category: 'tech' },
    { id: 6, subject: 'Finance', tutor: 'Prof. Wilson', duration: '2 hours', price: 359, icon: '💰', category: 'business' },
  ];

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

  // New function: Handle cancellation request
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
      
      const result = await requestSessionCancellation(
        sessionId, 
        currentUser.uid, 
        cancellationReason
      );
      
      if (result.success) {
        setMessage(`✅ ${result.message || 'Cancellation request submitted! Admin will review your request.'}`);
        setShowCancellationModal(false);
        setCancellationReason('');
        setCancellingSession(null);
        
        // Refresh sessions list
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

  const handleBookingClick = (session) => {
    setSelectedSession(session);
    setBookingData({
      ...bookingData,
      subject: session.subject,
      duration: 120
    });
    setShowBookingModal(true);
  };

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setMessage('❌ Please login to book a session');
      return;
    }
    
    if (!bookingData.date || !bookingData.time) {
      setMessage('❌ Please select date and time');
      return;
    }
    
    try {
      setSubmitting(true);
      setMessage('⏳ Processing your booking...');
      
      // Combine date and time
      const dateTime = new Date(`${bookingData.date}T${bookingData.time}`);
      
      // Prepare user data
      const userData = {
        firstName: userProfile?.firstName || currentUser.displayName?.split(' ')[0] || 'User',
        lastName: userProfile?.lastName || currentUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: userProfile?.email || currentUser.email || '',
        totalSessions: userProfile?.totalSessions || 0
      };
      
      // Prepare session data
      const sessionData = {
        subject: bookingData.subject,
        topic: bookingData.topic,
        dateTime: dateTime.toISOString(),
        duration: bookingData.duration,
        platform: bookingData.platform,
        notes: bookingData.notes,
        price: selectedSession?.price || 299
      };
      
      // Book session
      const result = await bookCrunchTimeSession(currentUser.uid, userData, sessionData);
      
      if (result.success) {
        setMessage(`✅ Session booked successfully! Session ID: ${result.sessionId}`);
        
        // Reset form
        setShowBookingModal(false);
        setBookingData({
          subject: '',
          topic: '',
          date: '',
          time: '',
          duration: 120,
          notes: '',
          platform: 'Zoom'
        });
        
        // Refresh sessions list
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  // Generate time slots (every 2 hours from 8am to 8pm)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour += 2) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    return slots;
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <DashboardLayout>
      <div className="crunchtime-page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>⏰ CrunchTime Tutoring</h1>
          <p>Book 2-hour intensive tutoring sessions with expert tutors</p>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <div className="info-card-icon">🎯</div>
          <div className="info-card-content">
            <h3>How It Works</h3>
            <p>Book a 2-hour focused session with an expert tutor to master difficult concepts, prepare for exams, or get help with specific topics.</p>
            <ul className="how-it-works-list">
              <li>1. Choose subject & tutor</li>
              <li>2. Select date & time</li>
              <li>3. Pay securely online</li>
              <li>4. Join video session</li>
            </ul>
          </div>
        </div>

        {message && (
          <div className={`message-alert ${message.includes('✅') ? 'success' : 'error'}`}>
            <div className="alert-icon">
              {message.includes('✅') ? '✅' : '❌'}
            </div>
            <div className="alert-message">{message}</div>
          </div>
        )}

        {/* Available Sessions */}
        <div className="sessions-section">
          <div className="section-header">
            <h2>📚 Available Sessions</h2>
            <span className="sessions-count">{tutoringSessions.length} sessions</span>
          </div>

          <div className="sessions-grid">
            {tutoringSessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <div className="session-icon">{session.icon}</div>
                  <div>
                    <div className="session-subject">{session.subject}</div>
                    <div className="session-tutor">{session.tutor}</div>
                  </div>
                </div>
                
                <div className="session-details">
                  <div className="detail-item">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{session.duration}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price</span>
                    <span className="detail-value price">R{session.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{session.category}</span>
                  </div>
                </div>

                <button 
                  className="book-btn"
                  onClick={() => handleBookingClick(session)}
                >
                  📅 Book Session
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Your Upcoming Sessions */}
        <div className="bookings-section">
          <div className="section-header">
            <h2>📋 Your Sessions</h2>
            <span className="sessions-count">
              {userSessions.filter(s => s.status === 'confirmed').length} upcoming
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
              <p>Book your first tutoring session above!</p>
            </div>
          ) : (
            <div className="sessions-list">
              {userSessions.map((session) => {
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
                    
                    {/* Meeting Link */}
                    {session.meetingLink && (
                      <div className="meeting-link">
                        <a 
                          href={session.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="join-btn"
                        >
                          🔗 Join Meeting
                        </a>
                      </div>
                    )}

                    {/* Cancellation Status */}
                    {session.cancellationRequested && (
                      <div className="cancellation-status">
                        <div className="status-badge warning">
                          ⚠️ Cancellation Requested
                        </div>
                        <p><strong>Status:</strong> {session.cancellationStatus || 'Pending admin review'}</p>
                        {session.cancellationReason && (
                          <p><strong>Reason:</strong> {session.cancellationReason}</p>
                        )}
                        {session.cancellationPenaltyCalculated && (
                          <p className="penalty-note">
                            <strong>Calculated Penalty:</strong> R{session.cancellationPenaltyCalculated}
                            {session.cancellationRefundCalculated && (
                              <span> • <strong>Refund:</strong> R{session.cancellationRefundCalculated}</span>
                            )}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Cancellation Button - Only show if session is confirmed and no cancellation requested */}
                    {session.status === 'confirmed' && !session.cancellationRequested && (
                      <button 
                        className="cancel-btn secondary"
                        onClick={() => {
                          setCancellingSession(session.id);
                          setShowCancellationModal(true);
                        }}
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

        {/* How It Works */}
        <div className="how-it-works">
          <h2>🔄 How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Choose Subject</h3>
                <p>Select from available subjects and tutors</p>
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

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>📅 Book {selectedSession?.subject} Session</h2>
              <button 
                className="close-modal"
                onClick={() => setShowBookingModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitBooking}>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={bookingData.subject}
                  readOnly
                  className="form-input"
                  style={{backgroundColor: '#f3f4f6'}}
                />
              </div>
              
              <div className="form-group">
                <label>Specific Topic (Optional)</label>
                <input
                  type="text"
                  name="topic"
                  value={bookingData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Calculus Integration, Python Pandas"
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
                    {generateTimeSlots().map((time, index) => (
                      <option key={index} value={time}>{time}</option>
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
                  placeholder="Specific areas you want to focus on, preferred teaching style, etc."
                  rows="3"
                  className="form-textarea"
                />
              </div>
              
              <div className="price-summary">
                <div className="price-item">
                  <span>Session Fee:</span>
                  <span>R{selectedSession?.price || 299}</span>
                </div>
                <div className="price-total">
                  <strong>Total:</strong>
                  <strong>R{selectedSession?.price || 299}</strong>
                </div>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowBookingModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-confirm"
                  disabled={submitting || !bookingData.date || !bookingData.time}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-small"></span>
                      PROCESSING...
                    </>
                  ) : (
                    `🚀 BOOK NOW • R${selectedSession?.price || 299}`
                  )}
                </button>
              </div>
              
              <div className="payment-notice">
                <p>💳 Payment will be processed after admin confirms your session</p>
                <p>📞 Need help? WhatsApp: +27 12 345 6789</p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Request Modal */}
      {showCancellationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🚫 Request Session Cancellation</h2>
              <button 
                className="close-modal"
                onClick={() => {
                  setShowCancellationModal(false);
                  setCancellationReason('');
                  setCancellingSession(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-card">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h3>Cancellation Policy</h3>
                  <ul>
                    <li>Cancellations within 24 hours: 50% penalty</li>
                    <li>Cancellations within 48 hours: 25% penalty</li>
                    <li>Cancellations more than 48 hours: 10% penalty</li>
                    <li>Cancellations more than 7 days: No penalty (full refund)</li>
                    <li>Admin approval required for all cancellations</li>
                  </ul>
                  <p className="policy-note">
                    Penalties are calculated automatically based on time remaining.
                  </p>
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
                <small className="form-hint">
                  Your reason will be reviewed by admin. Be specific to help with the review process.
                </small>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowCancellationModal(false);
                  setCancellationReason('');
                  setCancellingSession(null);
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-warning"
                onClick={() => handleRequestCancellation(cancellingSession)}
                disabled={submitting || !cancellationReason.trim()}
              >
                {submitting ? (
                  <>
                    <span className="spinner-small"></span>
                    SUBMITTING...
                  </>
                ) : (
                  '🚫 Submit Cancellation Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CrunchTime;
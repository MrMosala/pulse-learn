// frontend/src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// ==================== DATABASE COLLECTIONS ====================
export const DB_COLLECTIONS = {
  USERS: 'users',
  ASSIGNMENTS: 'assignments',
  ASSIGNMENTS_ARCHIVE: 'assignments_archive',
  CV_REQUESTS: 'cv_requests',
  CRUNCHTIME_SESSIONS: 'crunchtime_sessions',
  ACTIVITY_LOGS: 'activity_logs',
  ADMIN_NOTIFICATIONS: 'admin_notifications',
  MESSAGES: 'messages',
  COURSES: 'courses'
};

// ==================== HELPER FUNCTIONS ====================
export const isAdmin = (email) => {
  const adminEmails = process.env.REACT_APP_ADMIN_EMAIL?.split(',').map(e => e.trim()) || [];
  return adminEmails.includes(email?.trim());
};

// ==================== USER MANAGEMENT ====================
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, DB_COLLECTIONS.USERS, userId);
    await setDoc(userRef, {
      ...userData,
      uid: userId,
      role: 'student',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      subscriptionStatus: 'active',
      subscriptionExpiry: null,
      totalUploads: 0,
      totalRequests: 0,
      totalSessions: 0
    });
    
    // Log user creation activity
    await logUserActivity(userId, 'USER_SIGNUP', {
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`
    });
    
    // Create admin notification for new user
    await createAdminNotification('NEW_USER', {
      userId,
      userName: `${userData.firstName} ${userData.lastName}`,
      userEmail: userData.email
    });
    
    return { success: true, userId };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, DB_COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, DB_COLLECTIONS.USERS, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ASSIGNMENT UPLOADS ====================
export const uploadAssignment = async (userId, userData, file, assignmentData) => {
  try {
    // 1. Upload file to Firebase Storage
    const fileRef = ref(storage, `assignments/${userId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(fileRef);
    
    // 2. Save assignment record to Firestore
    const assignmentRef = await addDoc(collection(db, DB_COLLECTIONS.ASSIGNMENTS), {
      userId,
      userName: `${userData.firstName} ${userData.lastName}`,
      userEmail: userData.email,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      fileType: file.type,
      subject: assignmentData.subject || 'General',
      topic: assignmentData.topic || '',
      deadline: assignmentData.deadline || null,
      instructions: assignmentData.instructions || '',
      status: 'pending', // pending, in-progress, completed
      adminNotes: '',
      priceEstimate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 3. Update user's upload count
    await updateUserProfile(userId, {
      totalUploads: userData.totalUploads ? userData.totalUploads + 1 : 1
    });
    
    // 4. Log activity
    await logUserActivity(userId, 'ASSIGNMENT_UPLOADED', {
      assignmentId: assignmentRef.id,
      fileName: file.name,
      subject: assignmentData.subject
    });
    
    // 5. Create admin notification
    await createAdminNotification('NEW_ASSIGNMENT', {
      userId,
      userName: `${userData.firstName} ${userData.lastName}`,
      assignmentId: assignmentRef.id,
      fileName: file.name,
      subject: assignmentData.subject
    });
    
    return { 
      success: true, 
      assignmentId: assignmentRef.id,
      fileUrl 
    };
  } catch (error) {
    console.error('Error uploading assignment:', error);
    return { success: false, error: error.message };
  }
};

// ==================== CV REQUESTS ====================
export const uploadCVFile = async (userId, file) => {
  try {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF and Word documents are allowed');
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `cv_uploads/${userId}/${timestamp}.${fileExtension}`;
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return { 
      success: true, 
      downloadURL, 
      fileName: file.name 
    };
  } catch (error) {
    console.error('Error uploading CV file:', error);
    return { success: false, error: error.message };
  }
};

export const submitCVRequest = async (userId, userData, cvData) => {
  try {
    const cvRequestRef = await addDoc(collection(db, DB_COLLECTIONS.CV_REQUESTS), {
      userId,
      userName: `${userData.firstName} ${userData.lastName}`,
      userEmail: userData.email,
      jobTitle: cvData.jobTitle,
      industry: cvData.industry,
      experienceLevel: cvData.experienceLevel,
      keySkills: cvData.keySkills || [],
      achievements: cvData.achievements || '',
      targetCompanies: cvData.targetCompanies || '',
      deadline: cvData.deadline || null,
      currentCV: cvData.currentCV || null, // URL if uploaded
      status: 'pending', // pending, reviewing, in-progress, completed
      adminAssigned: null,
      adminNotes: '',
      priceEstimate: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user request count
    await updateUserProfile(userId, {
      totalRequests: userData.totalRequests ? userData.totalRequests + 1 : 1
    });
    
    // Log activity
    await logUserActivity(userId, 'CV_REQUEST_SUBMITTED', {
      requestId: cvRequestRef.id,
      jobTitle: cvData.jobTitle
    });
    
    // Create admin notification
    await createAdminNotification('NEW_CV_REQUEST', {
      userId,
      userName: `${userData.firstName} ${userData.lastName}`,
      requestId: cvRequestRef.id,
      jobTitle: cvData.jobTitle
    });
    
    return { success: true, requestId: cvRequestRef.id };
  } catch (error) {
    console.error('Error submitting CV request:', error);
    return { success: false, error: error.message };
  }
};

// Upload tailored CV and update request status
export const uploadTailoredCV = async (requestId, file, adminNotes) => {
  try {
    // 1. Upload tailored CV to storage
    const fileRef = ref(storage, `tailored_cvs/${requestId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    
    // 2. Update CV request with tailored CV
    const cvRef = doc(db, DB_COLLECTIONS.CV_REQUESTS, requestId);
    await updateDoc(cvRef, {
      tailoredCV: downloadURL,
      tailoredFileName: file.name,
      tailoredFileSize: file.size,
      adminNotes: adminNotes || '',
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 3. Create notification for user
    await createAdminNotification('CV_TAILORED', {
      requestId,
      fileName: file.name
    });
    
    return { success: true, downloadURL };
  } catch (error) {
    console.error('Error uploading tailored CV:', error);
    return { success: false, error: error.message };
  }
};

// For user to delete their own CV request
export const deleteUserCVRequest = async (requestId, userId) => {
  try {
    const cvRef = doc(db, DB_COLLECTIONS.CV_REQUESTS, requestId);
    const cvDoc = await getDoc(cvRef);
    
    if (!cvDoc.exists()) {
      throw new Error('CV request not found');
    }
    
    const cvData = cvDoc.data();
    
    // Check if user owns the request
    if (cvData.userId !== userId) {
      throw new Error('You can only delete your own CV requests');
    }
    
    // Check if status allows deletion (only pending and reviewing)
    if (!['pending', 'reviewing'].includes(cvData.status)) {
      throw new Error(`Cannot delete CV requests with status: ${cvData.status}`);
    }
    
    await deleteDoc(cvRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting CV request:', error);
    return { success: false, error: error.message };
  }
};

// For admin to delete any CV request
export const deleteCVRequest = async (requestId) => {
  try {
    const cvRef = doc(db, DB_COLLECTIONS.CV_REQUESTS, requestId);
    await deleteDoc(cvRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting CV request:', error);
    return { success: false, error: error.message };
  }
};

// ==================== CRUNCHTIME SESSIONS ====================
export const bookCrunchTimeSession = async (userId, userData, sessionData) => {
  try {
    const sessionRef = await addDoc(collection(db, DB_COLLECTIONS.CRUNCHTIME_SESSIONS), {
      userId,
      userName: `${userData.firstName} ${userData.lastName}`,
      userEmail: userData.email,
      subject: sessionData.subject,
      topic: sessionData.topic,
      dateTime: sessionData.dateTime,
      duration: sessionData.duration || 120, // 2 hours in minutes
      platform: sessionData.platform || 'Zoom',
      meetingLink: null, // To be set by admin
      status: 'requested', // requested, confirmed, completed, cancelled
      adminAssigned: null,
      notes: sessionData.notes || '',
      price: sessionData.price || 0,
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user session count
    await updateUserProfile(userId, {
      totalSessions: userData.totalSessions ? userData.totalSessions + 1 : 1
    });
    
    // Log activity
    await logUserActivity(userId, 'CRUNCHTIME_BOOKED', {
      sessionId: sessionRef.id,
      subject: sessionData.subject,
      dateTime: sessionData.dateTime
    });
    
    // Create admin notification
    await createAdminNotification('NEW_CRUNCHTIME_SESSION', {
      userId,
      userName: `${userData.firstName} ${userData.lastName}`,
      sessionId: sessionRef.id,
      subject: sessionData.subject,
      dateTime: sessionData.dateTime
    });
    
    return { success: true, sessionId: sessionRef.id };
  } catch (error) {
    console.error('Error booking CrunchTime session:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ACTIVITY LOGGING ====================
export const logUserActivity = async (userId, action, details = {}) => {
  try {
    await addDoc(collection(db, DB_COLLECTIONS.ACTIVITY_LOGS), {
      userId,
      action,
      details,
      timestamp: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error logging activity:', error);
    return { success: false };
  }
};

// ==================== ADMIN NOTIFICATIONS ====================
export const createAdminNotification = async (type, data) => {
  try {
    await addDoc(collection(db, DB_COLLECTIONS.ADMIN_NOTIFICATIONS), {
      type,
      data,
      read: false,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating admin notification:', error);
    return { success: false };
  }
};

// ==================== ADMIN QUERY FUNCTIONS ====================
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, DB_COLLECTIONS.USERS);
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const getAllCVRequests = async () => {
  try {
    const cvRef = collection(db, DB_COLLECTIONS.CV_REQUESTS);
    const q = query(cvRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ 
        id: doc.id, 
        ...doc.data() 
      });
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting all CV requests:', error);
    return [];
  }
};

export const getPendingAssignments = async () => {
  try {
    const assignmentsRef = collection(db, DB_COLLECTIONS.ASSIGNMENTS);
    const q = query(assignmentsRef, 
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const assignments = [];
    querySnapshot.forEach((doc) => {
      assignments.push({ id: doc.id, ...doc.data() });
    });
    
    return assignments;
  } catch (error) {
    console.error('Error getting pending assignments:', error);
    return [];
  }
};

export const getPendingCVRequests = async () => {
  try {
    const cvRef = collection(db, DB_COLLECTIONS.CV_REQUESTS);
    const q = query(cvRef, 
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting pending CV requests:', error);
    return [];
  }
};

export const getUpcomingSessions = async () => {
  try {
    const sessionsRef = collection(db, DB_COLLECTIONS.CRUNCHTIME_SESSIONS);
    const q = query(sessionsRef, 
      where('status', 'in', ['requested', 'confirmed']),
      orderBy('dateTime', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    
    return sessions;
  } catch (error) {
    console.error('Error getting upcoming sessions:', error);
    return [];
  }
};

export const getRecentActivity = async (limitCount = 50) => {
  try {
    const activityRef = collection(db, DB_COLLECTIONS.ACTIVITY_LOGS);
    const q = query(activityRef, 
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    
    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
};

export const getUnreadNotifications = async () => {
  try {
    const notificationsRef = collection(db, DB_COLLECTIONS.ADMIN_NOTIFICATIONS);
    const q = query(notificationsRef, 
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    return notifications;
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
};

// ==================== USER QUERY FUNCTIONS ====================
/**
 * Get all assignments for a specific user
 * Useful for: User dashboard, assignment history, admin viewing user's assignments
 * @param {string} userId - The user's ID
 * @returns {Array} List of user's assignments sorted by creation date (newest first)
 */
export const getAllUserAssignments = async (userId) => {
  try {
    const assignmentsRef = collection(db, DB_COLLECTIONS.ASSIGNMENTS);
    const q = query(
      assignmentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const assignments = [];
    querySnapshot.forEach((doc) => {
      assignments.push({ id: doc.id, ...doc.data() });
    });
    
    return assignments;
  } catch (error) {
    console.error('Error getting user assignments:', error);
    return [];
  }
};

/**
 * Get all CV requests for a specific user
 * Useful for: User dashboard, CV request history, admin viewing user's CV requests
 * @param {string} userId - The user's ID
 * @returns {Array} List of user's CV requests sorted by creation date (newest first)
 */
export const getAllUserCVRequests = async (userId) => {
  try {
    const cvRef = collection(db, DB_COLLECTIONS.CV_REQUESTS);
    
    // Query ONLY user's own documents
    const q = query(
      cvRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ 
        id: doc.id, 
        ...doc.data() 
      });
    });
    
    return requests;
  } catch (error) {
    console.error('Error getting user CV requests:', error);
    // If error is about index, fall back to manual filtering
    if (error.code === 'failed-precondition') {
      console.log('Index missing, using manual filter...');
      return await getAllUserCVRequestsManual(userId);
    }
    return [];
  }
};

// Fallback function if index is missing
const getAllUserCVRequestsManual = async (userId) => {
  try {
    const cvRef = collection(db, DB_COLLECTIONS.CV_REQUESTS);
    const querySnapshot = await getDocs(cvRef);
    
    const allRequests = [];
    querySnapshot.forEach((doc) => {
      allRequests.push({ id: doc.id, ...doc.data() });
    });
    
    // Filter for current user
    const userRequests = allRequests.filter(request => request.userId === userId);
    
    // Sort manually
    userRequests.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    
    return userRequests;
  } catch (error) {
    console.error('Error in manual fallback:', error);
    return [];
  }
};

// ==================== ASSIGNMENT MANAGEMENT FUNCTIONS ====================
export const requestAssignmentRevision = async (assignmentId, userId, revisionNotes) => {
  try {
    const assignmentRef = doc(db, DB_COLLECTIONS.ASSIGNMENTS, assignmentId);
    
    await updateDoc(assignmentRef, {
      status: 'revision-requested',
      revisionNotes: revisionNotes || '',
      revisionRequestedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Log activity
    await logUserActivity(userId, 'REVISION_REQUESTED', {
      assignmentId,
      revisionNotes
    });
    
    // Create admin notification
    await createAdminNotification('REVISION_REQUESTED', {
      assignmentId,
      userId,
      revisionNotes
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error requesting revision:', error);
    return { success: false, error: error.message };
  }
};

export const deleteUserAssignment = async (assignmentId, userId) => {
  try {
    const assignmentRef = doc(db, DB_COLLECTIONS.ASSIGNMENTS, assignmentId);
    const assignmentDoc = await getDoc(assignmentRef);
    
    if (!assignmentDoc.exists()) {
      throw new Error('Assignment not found');
    }
    
    const assignmentData = assignmentDoc.data();
    
    // Check if user owns the assignment
    if (assignmentData.userId !== userId) {
      throw new Error('You can only delete your own assignments');
    }
    
    // Check if status allows deletion (only pending and reviewing)
    if (!['pending', 'reviewing'].includes(assignmentData.status)) {
      throw new Error(`Cannot delete assignments with status: ${assignmentData.status}`);
    }
    
    await deleteDoc(assignmentRef);
    
    // Log activity
    await logUserActivity(userId, 'ASSIGNMENT_DELETED', {
      assignmentId,
      fileName: assignmentData.fileName
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return { success: false, error: error.message };
  }
};

export const archiveOldAssignments = async (monthsOld = 2) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);
    
    const assignmentsRef = collection(db, DB_COLLECTIONS.ASSIGNMENTS);
    const q = query(
      assignmentsRef,
      where('createdAt', '<', cutoffDate),
      where('status', 'in', ['completed', 'cancelled'])
    );
    
    const querySnapshot = await getDocs(q);
    const archivePromises = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const archiveRef = doc(db, DB_COLLECTIONS.ASSIGNMENTS_ARCHIVE, doc.id);
      
      archivePromises.push(setDoc(archiveRef, {
        ...data,
        archivedAt: serverTimestamp(),
        originalId: doc.id
      }));
      
      archivePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(archivePromises);
    return { 
      success: true, 
      archivedCount: querySnapshot.size 
    };
  } catch (error) {
    console.error('Error archiving assignments:', error);
    return { success: false, error: error.message };
  }
};

export const updateAssignmentSolution = async (assignmentId, newFile, adminNotes) => {
  try {
    let updates = {
      adminNotes: adminNotes || '',
      updatedAt: serverTimestamp()
    };
    
    // If new file provided, upload it
    if (newFile) {
      const fileRef = ref(storage, `solutions/${assignmentId}/${Date.now()}_${newFile.name}`);
      await uploadBytes(fileRef, newFile);
      const solutionUrl = await getDownloadURL(fileRef);
      
      updates.solutionUrl = solutionUrl;
      updates.solutionFileName = newFile.name;
      updates.solutionUpdatedAt = serverTimestamp();
    }
    
    const assignmentRef = doc(db, DB_COLLECTIONS.ASSIGNMENTS, assignmentId);
    await updateDoc(assignmentRef, updates);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating solution:', error);
    return { success: false, error: error.message };
  }
};

// ==================== ADMIN UPDATE FUNCTIONS ====================
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, DB_COLLECTIONS.ADMIN_NOTIFICATIONS, notificationId);
    await updateDoc(notificationRef, { read: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
};

export const updateAssignmentStatus = async (assignmentId, updates) => {
  try {
    const assignmentRef = doc(db, DB_COLLECTIONS.ASSIGNMENTS, assignmentId);
    
    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(assignmentRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating assignment:', error);
    return { success: false, error: error.message };
  }
};

export const uploadAssignmentSolution = async (assignmentId, file, adminNotes) => {
  try {
    // 1. Upload solution file
    const fileRef = ref(storage, `solutions/${assignmentId}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const solutionUrl = await getDownloadURL(fileRef);
    
    // 2. Update assignment with solution
    const assignmentRef = doc(db, DB_COLLECTIONS.ASSIGNMENTS, assignmentId);
    await updateDoc(assignmentRef, {
      solutionUrl,
      solutionFileName: file.name,
      status: 'completed',
      adminNotes: adminNotes || '',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 3. Create admin notification
    await createAdminNotification('ASSIGNMENT_COMPLETED', {
      assignmentId,
      solutionFileName: file.name
    });
    
    return { success: true, solutionUrl };
  } catch (error) {
    console.error('Error uploading solution:', error);
    return { success: false, error: error.message };
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    const assignmentRef = doc(db, DB_COLLECTIONS.ASSIGNMENTS, assignmentId);
    await deleteDoc(assignmentRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return { success: false, error: error.message };
  }
};

export const updateCVRequestStatus = async (requestId, updates) => {
  try {
    const cvRef = doc(db, DB_COLLECTIONS.CV_REQUESTS, requestId);
    await updateDoc(cvRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating CV request:', error);
    return { success: false, error: error.message };
  }
};

export const updateSessionStatus = async (sessionId, updates) => {
  try {
    const sessionRef = doc(db, DB_COLLECTIONS.CRUNCHTIME_SESSIONS, sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating session:', error);
    return { success: false, error: error.message };
  }
};

export default app;
// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isAdmin, createUserProfile } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password - USING firebase.js function
  async function signup(email, password, userData) {
    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Update Firebase Auth profile with display name
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });
      
      // 3. Create user profile in Firestore with ALL user data
      const result = await createUserProfile(user.uid, userData);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create user profile');
      }
      
      // 4. Immediately fetch the new profile
      await fetchUserProfile(user.uid);
      
      return userCredential;
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      throw error; // Re-throw for Signup.js to handle
    }
  }

  // Login with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Login with Google
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Check if user profile exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user profile for Google sign-in using firebase.js function
        const nameParts = user.displayName?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const result = await createUserProfile(user.uid, {
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          studentNumber: '',
          university: '',
          course: '',
          phoneNumber: '',
          registrationSource: 'google'
        });
        
        if (!result.success) {
          console.error('Failed to create Google user profile:', result.error);
        }
      }
      
      // Fetch user profile
      await fetchUserProfile(user.uid);
      
      return userCredential;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Logout
  function logout() {
    setUserProfile(null); // Clear profile on logout
    return signOut(auth);
  }

  // ADD THIS FUNCTION: Password Reset
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email, {
        // Optional: Customize the email
        url: window.location.origin + '/login', // Redirect to login after reset
        handleCodeInApp: true // Recommended for best user experience
      });
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error; // Let Login.js handle the specific error
    }
  }

  // Fetch user profile from Firestore - UPDATED VERSION
  async function fetchUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        
        // Ensure all fields are present with defaults
        const completeProfile = {
          // Basic info (with defaults)
          uid: uid,
          email: profileData.email || '',
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          displayName: profileData.displayName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
          
          // User type information (CRITICAL FIX)
          userType: profileData.userType || 'student', // This was missing!
          category: profileData.category || 'general',
          role: profileData.role || 'student',
          
          // Student-specific fields
          studentNumber: profileData.studentNumber || '',
          university: profileData.university || '',
          course: profileData.course || '',
          level: profileData.level || 1,
          xp: profileData.xp || 0,
          
          // Professional fields
          profession: profileData.profession || '',
          
          // Contact info
          phoneNumber: profileData.phoneNumber || '',
          
          // System fields
          isActive: profileData.isActive !== undefined ? profileData.isActive : true,
          isEducational: profileData.isEducational || false,
          isProfessional: profileData.isProfessional || false,
          profileComplete: profileData.profileComplete || false,
          registrationSource: profileData.registrationSource || 'website',
          subscriptionStatus: profileData.subscriptionStatus || 'active',
          subscriptionExpiry: profileData.subscriptionExpiry || null,
          totalUploads: profileData.totalUploads || 0,
          totalRequests: profileData.totalRequests || 0,
          totalSessions: profileData.totalSessions || 0,
          createdAt: profileData.createdAt,
          updatedAt: profileData.updatedAt,
          lastLogin: profileData.lastLogin
        };
        
        setUserProfile(completeProfile);
        
        // Also update current user's display name if different
        if (auth.currentUser && completeProfile.displayName !== auth.currentUser.displayName) {
          await updateProfile(auth.currentUser, {
            displayName: completeProfile.displayName
          });
        }
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    if (!currentUser) return;
    
    try {
      // Import updateUserProfile from firebase.js
      const { updateUserProfile: updateFirestoreProfile } = await import('../services/firebase');
      const result = await updateFirestoreProfile(currentUser.uid, updates);
      
      if (result.success) {
        await fetchUserProfile(currentUser.uid);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    isAdmin: userProfile?.role === 'admin' || isAdmin(userProfile?.email)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isAdmin } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  async function signup(email, password, displayName, studentNumber, university, course) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userDoc = {
      email: user.email,
      displayName: displayName,
      studentNumber: studentNumber,
      university: university,
      course: course,
      role: isAdmin(email) ? 'admin' : 'student',
      subscriptionTier: 'free',
      subscriptionStatus: 'inactive',
      level: 1,
      xp: 0,
      createdAt: serverTimestamp(),
      stripeCustomerId: null
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);
    
    return userCredential;
  }

  // Login with email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Login with Google
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if user profile exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user profile for Google sign-in
      await setDoc(userDocRef, {
        email: user.email,
        displayName: user.displayName,
        studentNumber: '',
        university: '',
        course: '',
        role: isAdmin(user.email) ? 'admin' : 'student',
        subscriptionTier: 'free',
        subscriptionStatus: 'inactive',
        level: 1,
        xp: 0,
        createdAt: serverTimestamp(),
        stripeCustomerId: null
      });
    }
    
    return userCredential;
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    if (!currentUser) return;
    
    await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true });
    await fetchUserProfile(currentUser.uid);
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
    updateUserProfile,
    isAdmin: userProfile?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

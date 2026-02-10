// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import LearnerDashboard from './pages/LearnerDashboard';
import Courses from './pages/Courses';
import Assignments from './pages/Assignments';
import CVBuilder from './pages/CVBuilder';
import Finance from './pages/Finance';
import CrunchTime from './pages/CrunchTime';
import Subscribe from './pages/Subscribe';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Components
import Navbar from './components/Navbar';
import ParticleBackground from './components/ParticleBackground';

// Styles
import './styles/App.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

// Admin Route wrapper
function AdminRoute({ children }) {
  const { currentUser, isAdmin } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

// Smart Dashboard - renders correct dashboard based on userType
function SmartDashboard() {
  const { userProfile } = useAuth();
  
  const userType = userProfile?.userType?.toLowerCase();
  
  if (userType === 'professional') {
    return <ProfessionalDashboard />;
  } else if (userType === 'learner') {
    return <LearnerDashboard />;
  } else {
    // Default: student dashboard (covers 'student' and any other/undefined type)
    return <Dashboard />;
  }
}

// Component to conditionally show Navbar
function AppContent() {
  const location = useLocation();
  
  // List of routes where navbar should be HIDDEN (protected pages with DashboardLayout)
  const hideNavbarRoutes = [
    '/dashboard',
    '/courses',
    '/assignments',
    '/cv-builder',
    '/finance',
    '/crunch-time',
    '/subscribe',
    '/profile',
    '/admin'
  ];
  
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app">
      <ParticleBackground />
      
      {/* Show Navbar only on public pages */}
      {shouldShowNavbar && <Navbar />}
      
      <main className="main-content">
        <Routes>
          {/* Public Routes (WITH Navbar) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Smart Dashboard - automatically shows correct dashboard per user type */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <SmartDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared Features (accessible to all user types) */}
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/assignments" 
            element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cv-builder" 
            element={
              <ProtectedRoute>
                <CVBuilder />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/finance" 
            element={
              <ProtectedRoute>
                <Finance />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/crunch-time" 
            element={
              <ProtectedRoute>
                <CrunchTime />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/subscribe" 
            element={
              <ProtectedRoute>
                <Subscribe />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes (WITHOUT Navbar, use DashboardLayout) */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          
          {/* Legacy routes redirect to smart dashboard */}
          <Route path="/professional-dashboard" element={<Navigate to="/dashboard" />} />
          <Route path="/learner-dashboard" element={<Navigate to="/dashboard" />} />
          <Route path="/main-dashboard" element={<Navigate to="/dashboard" />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
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

// User Type Redirect Component - ADD THIS NEW COMPONENT
function UserTypeRedirect() {
  const { userProfile } = useAuth();
  
  // Redirect based on userType
  if (userProfile?.userType === 'professional') {
    return <Navigate to="/professional-dashboard" />;
  } else if (userProfile?.userType === 'learner') {
    return <Navigate to="/learner-dashboard" />;
  } else {
    // Default to student dashboard
    return <Navigate to="/dashboard" />;
  }
}

// Component to conditionally show Navbar
function AppContent() {
  const location = useLocation();
  
  // List of routes where navbar should be HIDDEN (protected pages with DashboardLayout)
  const hideNavbarRoutes = [
    '/dashboard',
    '/professional-dashboard',
    '/learner-dashboard',
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
          
          {/* Main Dashboard Redirect - ADD THIS ROUTE */}
          <Route 
            path="/main-dashboard" 
            element={
              <ProtectedRoute>
                <UserTypeRedirect />
              </ProtectedRoute>
            } 
          />
          
          {/* User Type Specific Dashboards (WITHOUT Navbar, use DashboardLayout) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/professional-dashboard" 
            element={
              <ProtectedRoute>
                <ProfessionalDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/learner-dashboard" 
            element={
              <ProtectedRoute>
                <LearnerDashboard />
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
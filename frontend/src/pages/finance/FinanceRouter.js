// frontend/src/pages/finance/FinanceRouter.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StudentFinance from './dashboards/StudentFinance';
import LearnerFinance from './dashboards/LearnerFinance';
import ProfessionalFinance from './dashboards/ProfessionalFinance';
import GentleAlerts from './components/GentleAlerts';
import './styles/gentle-alerts.css';

function FinanceRouter() {
  const { userProfile } = useAuth();
  const userType = userProfile?.userType?.toLowerCase() || 'student';
  
  if (!userProfile) {
    return (
      <div className="finance-loading">
        <div className="loading-spinner">💰</div>
        <p>Loading your financial tools...</p>
      </div>
    );
  }
  
  // Render the appropriate dashboard based on user type
  const renderDashboard = () => {
    switch(userType) {
      case 'student':
        return <StudentFinance />;
      case 'learner':
        return <LearnerFinance />;
      case 'professional':
        return <ProfessionalFinance />;
      default:
        return <StudentFinance />;
    }
  };
  
  return (
    <div className="finance-page">
      {/* Gentle Alerts - Shows encouraging notifications based on user data */}
      <GentleAlerts />
      
      {/* Main Finance Dashboard */}
      {renderDashboard()}
    </div>
  );
}

export default FinanceRouter;
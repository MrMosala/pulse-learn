// frontend/src/pages/finance/dashboards/LearnerFinance.js
import React, { useState } from 'react';
import SchoolBusinessHelper from '../components/SchoolBusinessHelper';
import TransportStretcher from '../components/TransportStretcher';
import ProgressCelebrations from '../components/ProgressCelebrations';
import '../../../styles/learner-dashboard.css';
import '../styles/learner-finance.css';

function LearnerFinance() {
  const [activeTab, setActiveTab] = useState('business'); // 'business', 'transport', or 'progress'

  return (
    <div className="learner-finance-dashboard">
      {/* ── HEADER ── */}
      <div className="finance-header">
        <h1>📚 School Hustle</h1>
        <p>Build income responsibly while focusing on your studies</p>
      </div>
      
      {/* ── TABS (matching Student Dashboard) ── */}
      <div className="finance-tabs">
        <button 
          className={`finance-tab ${activeTab === 'business' ? 'active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          <span className="tab-icon">🏫</span>
          <span className="tab-text">School Business</span>
        </button>
        
        <button 
          className={`finance-tab ${activeTab === 'transport' ? 'active' : ''}`}
          onClick={() => setActiveTab('transport')}
        >
          <span className="tab-icon">🚌</span>
          <span className="tab-text">Transport</span>
        </button>
        
        <button 
          className={`finance-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <span className="tab-icon">🎯</span>
          <span className="tab-text">Progress</span>
        </button>
      </div>
      
      {/* ── TAB CONTENT ── */}
      <div className="finance-tab-content">
        {activeTab === 'business' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>🏫 Start a Small Business (With Permission)</h2>
              <p className="section-subtitle">Choose a school-appropriate business idea:</p>
            </div>
            <SchoolBusinessHelper />
          </div>
        )}
        
        {activeTab === 'transport' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>🚌 Manage Your Transport Costs</h2>
              <p className="section-subtitle">Typlearner budget: R500/week for transport</p>
            </div>
            <TransportStretcher />
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>🎯 Track Your Progress</h2>
              <p className="section-subtitle">Celebrate your savings and achievements</p>
            </div>
            <ProgressCelebrations />
          </div>
        )}
      </div>
    </div>
  );
}

export default LearnerFinance;
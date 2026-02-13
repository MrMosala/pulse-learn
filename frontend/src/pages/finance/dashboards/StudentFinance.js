// frontend/src/pages/finance/dashboards/StudentFinance.js
import React, { useState } from 'react';
import FoodBudgetHelper from '../components/FoodBudgetHelper';
import ResHustleHub from '../components/ResHustleHub';
import TransportStretcher from '../components/TransportStretcher';
import '../../../styles/student-dashboard.css';
import '../styles/student-finance.css';

function StudentFinance() {
  const [activeTab, setActiveTab] = useState('food'); // 'food', 'hustle', or 'transport'

  return (
    <div className="student-finance-dashboard">
      {/* ── HEADER ── */}
      <div className="finance-header">
        <h1>🎓 Campus Survival</h1>
        <p>Tools to stretch your budget and build income while studying</p>
      </div>
      
      {/* ── TABS (like Admin Dashboard) ── */}
      <div className="finance-tabs">
        <button 
          className={`finance-tab ${activeTab === 'food' ? 'active' : ''}`}
          onClick={() => setActiveTab('food')}
        >
          <span className="tab-icon">🍽️</span>
          <span className="tab-text">Feed Yourself First</span>
        </button>
        
        <button 
          className={`finance-tab ${activeTab === 'hustle' ? 'active' : ''}`}
          onClick={() => setActiveTab('hustle')}
        >
          <span className="tab-icon">💼</span>
          <span className="tab-text">Res Hustle Hub</span>
        </button>
        
        <button 
          className={`finance-tab ${activeTab === 'transport' ? 'active' : ''}`}
          onClick={() => setActiveTab('transport')}
        >
          <span className="tab-icon">🚌</span>
          <span className="tab-text">Transport Stretcher</span>
        </button>
      </div>
      
      {/* ── TAB CONTENT ── */}
      <div className="finance-tab-content">
        {activeTab === 'food' && (
          <div className="tab-panel">
            <FoodBudgetHelper />
          </div>
        )}
        
        {activeTab === 'hustle' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>💼 Choose Your Campus Business Idea:</h2>
            </div>
            <ResHustleHub />
          </div>
        )}
        
        {activeTab === 'transport' && (
          <div className="tab-panel">
            <TransportStretcher />
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentFinance;
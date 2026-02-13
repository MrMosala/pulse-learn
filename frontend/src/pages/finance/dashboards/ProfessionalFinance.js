// frontend/src/pages/finance/dashboards/ProfessionalFinance.js
import React, { useState, useCallback } from 'react';
import GentleSpendingView from '../components/GentleSpendingView';
import FamilySupportPlanner from '../components/FamilySupportPlanner';
import WalletRestingHelper from '../components/WalletRestingHelper';
import CommuteShareHelper from '../components/CommuteShareHelper';
import '../../../styles/professional-dashboard.css';
import '../styles/professional-finance.css';

// ══════════════════════════════════════════════
// SA TAX CALCULATOR (2024 brackets) — SINGLE SOURCE OF TRUTH
// ══════════════════════════════════════════════
const calculateSATakeHomePay = (grossSalary) => {
  const annualSalary = grossSalary * 12;

  let tax = 0;
  if (annualSalary <= 237100) {
    tax = annualSalary * 0.18;
  } else if (annualSalary <= 370500) {
    tax = 42678 + (annualSalary - 237100) * 0.26;
  } else if (annualSalary <= 512800) {
    tax = 77362 + (annualSalary - 370500) * 0.31;
  } else if (annualSalary <= 673000) {
    tax = 121475 + (annualSalary - 512800) * 0.36;
  } else if (annualSalary <= 857900) {
    tax = 179147 + (annualSalary - 673000) * 0.39;
  } else if (annualSalary <= 1817000) {
    tax = 251258 + (annualSalary - 857900) * 0.41;
  } else {
    tax = 644489 + (annualSalary - 1817000) * 0.45;
  }

  const monthlyTax = tax / 12;
  const uif = Math.min(grossSalary * 0.01, 177.12);
  const medicalAid = 1200;
  const retirement = grossSalary * 0.075;
  const totalDeductions = monthlyTax + uif + medicalAid + retirement;
  const takeHomePay = grossSalary - totalDeductions;

  return {
    takeHomePay: Math.round(takeHomePay),
    deductions: {
      tax: Math.round(monthlyTax),
      uif: Math.round(uif),
      medicalAid: Math.round(medicalAid),
      retirement: Math.round(retirement),
      total: Math.round(totalDeductions),
    },
  };
};

function ProfessionalFinance() {
  const [activeTab, setActiveTab] = useState('spending');
  const [grossSalary, setGrossSalary] = useState(35000);

  // Single calculation shared across all tabs
  const takeHomeData = calculateSATakeHomePay(grossSalary);

  const handleSalaryChange = useCallback((newGross) => {
    setGrossSalary(newGross);
  }, []);

  return (
    <div className="professional-finance-dashboard">
      {/* ── HEADER ── */}
      <div className="finance-header">
        <h1>💼 Month-End Master</h1>
        <p>Gentle financial planning with dignity and clarity</p>
      </div>

      {/* ── SHARED SALARY DISPLAY ── */}
      <div className="shared-salary-bar">
        <div className="shared-salary-left">
          <span className="shared-salary-label">Gross Salary</span>
          <span className="shared-salary-value">R{grossSalary.toLocaleString()}</span>
        </div>
        <div className="shared-salary-arrow">→</div>
        <div className="shared-salary-right">
          <span className="shared-salary-label">Take-Home Pay</span>
          <span className="shared-salary-value take-home">R{takeHomeData.takeHomePay.toLocaleString()}</span>
        </div>
        <span className="shared-salary-hint">Edit in Gentle Spending tab</span>
      </div>

      {/* ── TABS ── */}
      <div className="finance-tabs">
        <button
          className={`finance-tab ${activeTab === 'spending' ? 'active' : ''}`}
          onClick={() => setActiveTab('spending')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-text">Gentle Spending</span>
        </button>

        <button
          className={`finance-tab ${activeTab === 'family' ? 'active' : ''}`}
          onClick={() => setActiveTab('family')}
        >
          <span className="tab-icon">👨‍👩‍👧‍👦</span>
          <span className="tab-text">Family Support</span>
        </button>

        <button
          className={`finance-tab ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          <span className="tab-icon">🛌</span>
          <span className="tab-text">Wallet Resting</span>
        </button>

        <button
          className={`finance-tab ${activeTab === 'commute' ? 'active' : ''}`}
          onClick={() => setActiveTab('commute')}
        >
          <span className="tab-icon">🚗</span>
          <span className="tab-text">Commute Share</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="finance-tab-content">
        {activeTab === 'spending' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>📊 Gentle Spending View</h2>
              <p className="section-subtitle">Track your monthly income and expenses without judgment</p>
            </div>
            <GentleSpendingView
              grossSalary={grossSalary}
              takeHomeData={takeHomeData}
              onGrossSalaryChange={handleSalaryChange}
            />
          </div>
        )}

        {activeTab === 'family' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>👨‍👩‍👧‍👦 Family Support Planner</h2>
              <p className="section-subtitle">Plan your family support with clarity and boundaries</p>
            </div>
            <FamilySupportPlanner
              takeHomePay={takeHomeData.takeHomePay}
            />
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>🛌 Wallet Resting Helper</h2>
              <p className="section-subtitle">Let your money work for you while it rests</p>
            </div>
            <WalletRestingHelper
              grossSalary={grossSalary}
              takeHomePay={takeHomeData.takeHomePay}
            />
          </div>
        )}

        {activeTab === 'commute' && (
          <div className="tab-panel">
            <div className="section-header">
              <h2>🚗 Commute Share Helper</h2>
              <p className="section-subtitle">Manage your work transport costs efficiently</p>
            </div>
            <CommuteShareHelper
              takeHomePay={takeHomeData.takeHomePay}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfessionalFinance;
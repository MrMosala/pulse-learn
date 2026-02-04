// frontend/src/pages/Finance.js
import React from 'react';

function Finance() {
  return (
    <div className="page finance-page">
      <h1 className="section-title">💰 Financial Dashboard</h1>
      
      <div className="alert alert-success">
        <span style={{fontSize: '1.5rem'}}>✅</span>
        <div><strong>Great job!</strong> You're R1,200 under budget this month!</div>
      </div>

      <div className="finance-overview">
        <div className="finance-card glass-card">
          <div className="finance-icon">💵</div>
          <div className="finance-amount" style={{color: '#10B981'}}>R11,500</div>
          <div className="finance-label">Monthly Income</div>
          <div className="progress-container">
            <div className="progress-bar" style={{width: '100%'}}></div>
          </div>
        </div>

        <div className="finance-card glass-card">
          <div className="finance-icon">💸</div>
          <div className="finance-amount" style={{color: '#F59E0B'}}>R8,300</div>
          <div className="finance-label">Total Expenses</div>
          <div className="progress-container">
            <div className="progress-bar" style={{width: '72%'}}></div>
          </div>
        </div>

        <div className="finance-card glass-card">
          <div className="finance-icon">💰</div>
          <div className="finance-amount" style={{color: '#10B981'}}>R3,200</div>
          <div className="finance-label">Available</div>
          <div className="progress-container">
            <div className="progress-bar" style={{width: '28%'}}></div>
          </div>
        </div>
      </div>

      <div className="budget-section glass-card">
        <h3>This Month's Spending</h3>
        <div className="expense-item">
          <div className="expense-info">
            <div className="expense-icon">🏠</div>
            <div><h4>Rent</h4><p>R3,500 / R3,500</p></div>
          </div>
          <div className="expense-amount">R3,500</div>
        </div>
        <div className="expense-item">
          <div className="expense-info">
            <div className="expense-icon">🍕</div>
            <div><h4>Food</h4><p>R1,800 / R2,500</p></div>
          </div>
          <div className="expense-amount">R1,800</div>
        </div>
        <div className="expense-item">
          <div className="expense-info">
            <div className="expense-icon">🚌</div>
            <div><h4>Transport</h4><p>R650 / R800</p></div>
          </div>
          <div className="expense-amount">R650</div>
        </div>
      </div>

      <h3 className="section-title" style={{fontSize: '1.5rem'}}>Savings Goals</h3>
      <div className="goals-grid">
        <div className="goal-card glass-card">
          <div className="goal-header">
            <div className="goal-title">Emergency Fund</div>
            <div className="goal-icon">🚨</div>
          </div>
          <div className="goal-percentage">68%</div>
          <div className="goal-progress">
            <div className="goal-amounts">
              <span>R3,400</span>
              <span>R5,000</span>
            </div>
            <div className="progress-container">
              <div className="progress-bar" style={{width: '68%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Finance;

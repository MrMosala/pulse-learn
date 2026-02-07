// frontend/src/pages/Finance.js
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import '../App.css';

function Finance() {
  const expenses = [
    { id: 1, category: 'Rent', amount: 3500, budget: 3500, icon: '🏠', color: '#EF4444' },
    { id: 2, category: 'Food', amount: 1800, budget: 2500, icon: '🍕', color: '#F59E0B' },
    { id: 3, category: 'Transport', amount: 650, budget: 800, icon: '🚌', color: '#3B82F6' },
    { id: 4, category: 'Utilities', amount: 850, budget: 1000, icon: '💡', color: '#10B981' },
    { id: 5, category: 'Entertainment', amount: 400, budget: 600, icon: '🎬', color: '#8B5CF6' },
    { id: 6, category: 'Study Materials', amount: 300, budget: 500, icon: '📚', color: '#06B6D4' },
  ];

  const savingsGoals = [
    { id: 1, title: 'Emergency Fund', current: 3400, target: 5000, icon: '🚨', color: '#EF4444' },
    { id: 2, title: 'New Laptop', current: 4200, target: 10000, icon: '💻', color: '#3B82F6' },
    { id: 3, title: 'Graduation Trip', current: 1500, target: 15000, icon: '✈️', color: '#10B981' },
    { id: 4, title: 'Investment Fund', current: 5000, target: 25000, icon: '📈', color: '#F59E0B' },
  ];

  const totalIncome = 11500;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const available = totalIncome - totalExpenses;
  const budgetPercentage = Math.round((totalExpenses / totalIncome) * 100);

  return (
    <DashboardLayout>
      <div className="finance-page-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>💰 Financial Dashboard</h1>
          <p>Track your spending and manage your budget effectively</p>
        </div>

        {/* Success Alert */}
        <div className="finance-success-alert">
          <div className="alert-icon">✅</div>
          <div className="alert-content">
            <strong>Great job! You're R{available} under budget this month!</strong>
            <p>Keep up the good financial habits</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="finance-overview-grid">
          <div className="overview-card income-card">
            <div className="card-header">
              <div className="card-icon">💵</div>
              <div className="card-title">Monthly Income</div>
            </div>
            <div className="card-amount">R{totalIncome.toLocaleString()}</div>
            <div className="card-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="overview-card expense-card">
            <div className="card-header">
              <div className="card-icon">💸</div>
              <div className="card-title">Total Expenses</div>
            </div>
            <div className="card-amount">R{totalExpenses.toLocaleString()}</div>
            <div className="card-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${budgetPercentage}%` }}></div>
              </div>
              <div className="progress-label">{budgetPercentage}% of budget</div>
            </div>
          </div>

          <div className="overview-card available-card">
            <div className="card-header">
              <div className="card-icon">💰</div>
              <div className="card-title">Available</div>
            </div>
            <div className="card-amount" style={{ color: available > 0 ? '#10B981' : '#EF4444' }}>
              R{available.toLocaleString()}
            </div>
            <div className="card-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${100 - budgetPercentage}%` }}></div>
              </div>
              <div className="progress-label">{100 - budgetPercentage}% remaining</div>
            </div>
          </div>

          <div className="overview-card savings-card">
            <div className="card-header">
              <div className="card-icon">🏦</div>
              <div className="card-title">Total Savings</div>
            </div>
            <div className="card-amount" style={{ color: '#10B981' }}>
              R{savingsGoals.reduce((sum, goal) => sum + goal.current, 0).toLocaleString()}
            </div>
            <div className="card-progress">
              <div className="progress-label">Across {savingsGoals.length} goals</div>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="expense-breakdown">
          <div className="section-header">
            <h2>Monthly Spending Breakdown</h2>
            <button className="add-expense-btn">+ Add Expense</button>
          </div>
          
          <div className="expenses-list">
            {expenses.map((expense) => {
              const percentage = Math.round((expense.amount / expense.budget) * 100);
              return (
                <div key={expense.id} className="expense-item">
                  <div className="expense-icon" style={{ backgroundColor: `${expense.color}20` }}>
                    <span style={{ color: expense.color }}>{expense.icon}</span>
                  </div>
                  <div className="expense-details">
                    <div className="expense-title">{expense.category}</div>
                    <div className="expense-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: expense.color
                          }}
                        ></div>
                      </div>
                      <div className="expense-stats">
                        <span>R{expense.amount} / R{expense.budget}</span>
                        <span>{percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="expense-amount">R{expense.amount}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Savings Goals */}
        <div className="savings-goals">
          <div className="section-header">
            <h2>Savings Goals</h2>
            <button className="add-goal-btn">+ New Goal</button>
          </div>
          
          <div className="goals-grid">
            {savingsGoals.map((goal) => {
              const percentage = Math.round((goal.current / goal.target) * 100);
              return (
                <div key={goal.id} className="goal-card">
                  <div className="goal-header">
                    <div className="goal-icon" style={{ color: goal.color }}>
                      {goal.icon}
                    </div>
                    <div className="goal-title">{goal.title}</div>
                  </div>
                  
                  <div className="goal-progress">
                    <div className="goal-percentage">{percentage}%</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: goal.color
                        }}
                      ></div>
                    </div>
                    <div className="goal-amounts">
                      <span>R{goal.current.toLocaleString()}</span>
                      <span>R{goal.target.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="goal-status">
                    {percentage >= 100 ? (
                      <span className="status-completed">🎉 Completed!</span>
                    ) : (
                      <span className="status-in-progress">
                        R{(goal.target - goal.current).toLocaleString()} to go
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Tips */}
        <div className="financial-tips">
          <h3>💡 Financial Tips</h3>
          <div className="tips-list">
            <div className="tip-item">
              <div className="tip-icon">📊</div>
              <div className="tip-content">
                <strong>Track Daily Expenses</strong>
                <p>Small purchases add up quickly</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">🎯</div>
              <div className="tip-content">
                <strong>Set Clear Goals</strong>
                <p>Specific targets are easier to achieve</p>
              </div>
            </div>
            <div className="tip-item">
              <div className="tip-icon">⏳</div>
              <div className="tip-content">
                <strong>Review Monthly</strong>
                <p>Adjust your budget as needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Finance;
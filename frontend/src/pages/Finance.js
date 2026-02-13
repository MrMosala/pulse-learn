// frontend/src/pages/Finance.js
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import FinanceRouter from './finance/FinanceRouter';
// import './finance/styles/finance-common.css'; // Temporarily comment this line
import '../App.css';

function Finance() {
  return (
    <DashboardLayout>
      <div className="finance-page-content">
        <FinanceRouter />
      </div>
    </DashboardLayout>
  );
}

export default Finance;
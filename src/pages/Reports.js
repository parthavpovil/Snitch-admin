import React from 'react';
import Navbar from '../components/Navbar';
import ComplaintsDisplay from '../components/ComplaintsDisplay';
import '../styles/Reports.css';

const Reports = () => {
  const selectedRole = localStorage.getItem('selectedRole');
  const account = localStorage.getItem('account');

  if (!selectedRole || !account) {
    return window.location.href = '/';
  }

  return (
    <div className="reports-page">
      <Navbar />
      <div className="reports-container">
        <div className="dashboard-header">
          <div className="role-info">
            <h1>{selectedRole.toUpperCase()} DASHBOARD</h1>
            <p className="account-info">
              <span className="dot"></span>
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          </div>
        </div>
        <ComplaintsDisplay selectedRole={selectedRole} />
      </div>
    </div>
  );
};

export default Reports; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/ConnectWallet.css';

const ConnectWallet = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleWalletConnect = async () => {
    if (!selectedRole) {
      setError('Please select your role before connecting wallet');
      return;
    }
    
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        console.log('Wallet connected:', account);
        
        localStorage.setItem('selectedRole', selectedRole);
        localStorage.setItem('account', account);
        
        navigate('/reports');
      } else {
        setError('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet: ' + error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="connect-wallet-container">
        <div className="decoration decoration-1"></div>
        <div className="decoration decoration-2"></div>

        <div className="wallet-content">
          <h1 className="admin-title">Snitch Admin</h1>
          
          <p className="welcome-text">
            Welcome to the administrative portal. Please select your department and connect your wallet to continue.
          </p>

          <div className="department-section">
            <label className="section-label">Select Department</label>
            <select 
              className="role-selector"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setError('');
              }}
            >
              <option value="">Choose your department</option>
              <option value="police">Police Department</option>
              <option value="customs">Customs Department</option>
              <option value="income-tax">Income Tax Department</option>
            </select>
          </div>

          <button 
            className="connect-button"
            onClick={handleWalletConnect}
          >
            <i className="fas fa-wallet"></i>
            Connect Wallet
          </button>
          
          {error && <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>}
        </div>
      </div>
    </>
  );
};

export default ConnectWallet; 
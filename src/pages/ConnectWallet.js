import React, { useState } from 'react';
import WalletButton from '../components/WalletButton';
import Navbar from '../components/Navbar';
import ComplaintsDisplay from '../components/ComplaintsDisplay';
import '../styles/ConnectWallet.css';

const ConnectWallet = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');

  const handleWalletConnect = async () => {
    if (!selectedRole) {
      setError('Please select your role before connecting wallet');
      return;
    }
    
    try {
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        console.log('Wallet connected:', account);
        
        // Set the connected account and connection status
        setAccount(account);
        setIsConnected(true);
        setError('');

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setIsConnected(false);
            setAccount('');
          }
        });

      } else {
        setError('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet: ' + error.message);
    }
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setError('');
  };

  return (
    <>
      <Navbar />
      <div className="connect-wallet-container">
        {!isConnected ? (
          <div className="wallet-content">
            <h1 className="admin-title">Snitch Admin</h1>
            
            <select 
              className="role-selector"
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="">Select Your Role</option>
              <option value="police">Police Department</option>
              <option value="customs">Customs Department</option>
              <option value="income-tax">Income Tax Department</option>
            </select>

            <WalletButton onClick={handleWalletConnect} />
            
            {error && <p className="error-message">{error}</p>}
          </div>
        ) : (
          <>
            <div className="connected-status">
              <p>Connected Account: {account.slice(0, 6)}...{account.slice(-4)}</p>
              <p>Department: {selectedRole.toUpperCase()}</p>
            </div>
            <ComplaintsDisplay selectedRole={selectedRole} />
          </>
        )}
      </div>
    </>
  );
};

export default ConnectWallet; 
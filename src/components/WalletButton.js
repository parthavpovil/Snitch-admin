import React from 'react';
import '../styles/WalletButton.css';

const WalletButton = ({ onClick }) => {
  return (
    <button className="wallet-button" onClick={onClick}>
      Connect Wallet
    </button>
  );
};

export default WalletButton; 
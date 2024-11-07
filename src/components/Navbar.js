import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const account = localStorage.getItem('account');

  const handleLogout = () => {
    localStorage.removeItem('selectedRole');
    localStorage.removeItem('account');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate('/')}>
        <span className="logo-text">Snitch.io</span>
      </div>
      {account && (
        <button onClick={handleLogout} className="logout-button">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar; 
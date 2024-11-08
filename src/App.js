import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ConnectWallet from './pages/ConnectWallet';
import ComplaintsDisplay from './components/ComplaintsDisplay';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content-with-navbar">
          <Routes>
            <Route path="/" element={<ConnectWallet />} />
            <Route path="/reports" element={<ComplaintsDisplay />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

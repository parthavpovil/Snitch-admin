import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConnectWallet from './pages/ConnectWallet';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConnectWallet />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;

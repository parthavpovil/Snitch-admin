import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../styles/ComplaintsDisplay.css';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractConfig';

const ComplaintsDisplay = ({ selectedRole }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getComplaintsArray = async (contract, role) => {
    let complaints = [];
    let index = 0;
    
    while (true) {
      try {
        let complaint;
        switch(role) {
          case 'police':
            complaint = await contract.policeComplaints(index);
            break;
          case 'customs':
            complaint = await contract.customsComplaints(index);
            break;
          case 'income-tax':
            complaint = await contract.incomeTaxComplaints(index);
            break;
          default:
            throw new Error('Invalid role');
        }
        
        complaints.push({
          reporter: complaint.reporter,
          reportText: complaint.reportText,
          category: complaint.category,
          location: complaint.location,
          city: complaint.city,
          mediaCID: complaint.mediaCID,
          timestamp: complaint.timestamp.toNumber(),
          isValid: complaint.isValid
        });
        
        index++;
      } catch (error) {
        // When we reach the end of the array, break the loop
        break;
      }
    }
    
    return complaints;
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        throw new Error('Please install MetaMask!');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const fetchedComplaints = await getComplaintsArray(contract, selectedRole);
      
      // Sort complaints by timestamp (newest first)
      const sortedComplaints = fetchedComplaints.sort((a, b) => b.timestamp - a.timestamp);
      
      setComplaints(sortedComplaints);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Error fetching complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      fetchComplaints();
    }
  }, [selectedRole]);

  return (
    <div className="complaints-container">
      <div className="complaints-header">
        <h2>{selectedRole.toUpperCase()} Department Reports</h2>
        <button onClick={fetchComplaints} className="refresh-button">
          Refresh Data
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading complaints...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="complaints-grid">
        {complaints.map((complaint, index) => (
          <div key={index} className="complaint-card">
            <div className="complaint-header">
              <span className="complaint-timestamp">
                {new Date(complaint.timestamp * 1000).toLocaleString()}
              </span>
              <span className={`status ${complaint.isValid ? 'valid' : 'pending'}`}>
                {complaint.isValid ? 'Verified' : 'Pending'}
              </span>
            </div>
            
            <div className="reporter-address">
              Reporter: {complaint.reporter.slice(0, 6)}...{complaint.reporter.slice(-4)}
            </div>
            
            <div className="complaint-content">
              <p className="report-text">{complaint.reportText}</p>
              <div className="complaint-details">
                <p><strong>Category:</strong> {complaint.category}</p>
                <p><strong>Location:</strong> {complaint.location}</p>
                <p><strong>City:</strong> {complaint.city}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplaintsDisplay; 
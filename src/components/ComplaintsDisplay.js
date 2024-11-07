import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../styles/ComplaintsDisplay.css';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractConfig';

const ComplaintCard = ({ complaint }) => {
  const [imageError, setImageError] = useState(false);

  const isImage = (cid) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => complaint.mediaCID.toLowerCase().includes(ext));
  };

  const renderMediaPreview = () => {
    if (!complaint.mediaCID) return null;

    const ipfsUrl = `https://ipfs.io/ipfs/${complaint.mediaCID}`;

    if (isImage(complaint.mediaCID) && !imageError) {
      return (
        <div className="media-preview">
          <img 
            src={ipfsUrl}
            alt="Report Evidence"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return (
      <a 
        href={ipfsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="evidence-link"
      >
        <i className="fas fa-file-alt"></i>
        View Evidence
      </a>
    );
  };

  return (
    <div className="complaint-card">
      <div className="complaint-meta">
        <span className="timestamp">
          <i className="far fa-clock"></i>
          {new Date(complaint.timestamp * 1000).toLocaleString()}
        </span>
        <span className={`status-badge ${complaint.isValid ? 'valid' : 'pending'}`}>
          {complaint.isValid ? 'Verified' : 'Pending'}
        </span>
      </div>
      
      <div className="complaint-body">
        <div className="reporter">
          <i className="far fa-user"></i>
          Reporter: {complaint.reporter.slice(0, 6)}...{complaint.reporter.slice(-4)}
        </div>

        <div className="complaint-section">
          <div className="section-title">Report Details</div>
          <p className="report-text">{complaint.reportText}</p>
        </div>

        {complaint.mediaCID && (
          <div className="media-section">
            <div className="section-title">Evidence</div>
            {renderMediaPreview()}
          </div>
        )}

        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Category</span>
            <span className="detail-value">{complaint.category}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Location</span>
            <span className="detail-value">{complaint.location}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">City</span>
            <span className="detail-value">{complaint.city}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComplaintsDisplay = ({ selectedRole }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getComplaintsArray = async (contract, role) => {
    let complaints = [];
    let index = 0;
    let continueLoop = true;

    while (continueLoop && index < 100) {
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

        if (complaint.reporter === '0x0000000000000000000000000000000000000000') {
          continueLoop = false;
          break;
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
        console.log("Reached end of complaints or error:", error);
        continueLoop = false;
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
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const fetchedComplaints = await getComplaintsArray(contract, selectedRole);
      
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
        <div className="header-left">
          <h2>Recent Reports</h2>
          <span className="report-count">{complaints.length} reports</span>
        </div>
        <button onClick={fetchComplaints} className="refresh-button">
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reports...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="complaints-grid">
        {complaints.map((complaint, index) => (
          <ComplaintCard key={index} complaint={complaint} />
        ))}
      </div>

      {!loading && complaints.length === 0 && (
        <div className="no-data">
          <i className="far fa-folder-open"></i>
          <p>No reports found for {selectedRole} department</p>
        </div>
      )}
    </div>
  );
};

export default ComplaintsDisplay; 
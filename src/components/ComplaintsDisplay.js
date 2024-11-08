import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../styles/ComplaintsDisplay.css';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contractConfig';

const ComplaintCard = ({ complaint }) => {
  const [imageError, setImageError] = useState(false);

  const isImage = (cid) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => cid.toLowerCase().includes(ext));
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

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Determine which array to fetch based on selectedRole
        let complaintArray = [];
        let index = 0;
        let hasMore = true;

        while (hasMore) {
          try {
            let complaint;
            if (selectedRole === 'police') {
              complaint = await contract.policeComplaints(index);
            } else if (selectedRole === 'customs') {
              complaint = await contract.customsComplaints(index);
            } else if (selectedRole === 'incometax') {
              complaint = await contract.incomeTaxComplaints(index);
            }

            if (complaint && complaint.reporter !== '0x0000000000000000000000000000000000000000') {
              complaintArray.push({
                reporter: complaint.reporter,
                reportText: complaint.reportText,
                category: complaint.category,
                location: complaint.location,
                city: complaint.city,
                mediaCID: complaint.mediaCID,
                timestamp: complaint.timestamp.toString(),
                isValid: complaint.isValid
              });
              index++;
            } else {
              hasMore = false;
            }
          } catch (err) {
            console.log('Reached end of array or error:', err);
            hasMore = false;
          }
        }

        console.log('Fetched complaints:', complaintArray);
        setComplaints(complaintArray);
      } else {
        throw new Error('MetaMask is not installed');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to fetch reports: ' + err.message);
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

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

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
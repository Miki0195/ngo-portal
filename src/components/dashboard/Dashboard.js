import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Get current user info
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to the NGO Portal</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>Welcome, {user.ngoName}!</h2>
          <p>You are successfully logged in to your NGO portal.</p>
        </div>
        
        <div className="dashboard-info">
          <h3>Your NGO Information</h3>
          <p><strong>NGO ID:</strong> {user.ngoId}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
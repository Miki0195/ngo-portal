import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import '../../styles/Dashboard.css';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [navigate]);

  if (!user) {
    return <div className="loading">{t('dashboard.loading')}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{t('dashboard.welcomeTo')}</h1>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>{t('dashboard.welcome')}, {user.ngoName}!</h2>
          <p>{t('dashboard.successfullyLogedIn')}</p>
        </div>
        
        <div className="dashboard-info">
          <h3>{t('dashboard.ngoInfo')}</h3>
          <p><strong>NGO ID:</strong> {user.ngoId}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
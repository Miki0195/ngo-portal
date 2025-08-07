import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import LanguagePicker from '../common/LanguagePicker';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/#/login';
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <h1>NGO Portal</h1>
        </Link>
      </div>
      
      <div className="navbar-menu">
        <ul className="navbar-nav">
          <li className={`nav-item ${isActive('/dashboard')}`}>
            <Link to="/dashboard" className="nav-link">{t('navigation.dashboard')}</Link>
          </li>
          <li className={`nav-item ${isActive('/events')}`}>
            <Link to="/events" className="nav-link">{t('navigation.events')}</Link>
          </li>
          <li className={`nav-item ${isActive('/applications')}`}>
            <Link to="/applications" className="nav-link">{t('navigation.applications')}</Link>
          </li>
          <li className={`nav-item ${isActive('/profile')}`}>
            <Link to="/profile" className="nav-link">{t('navigation.profile')}</Link>
          </li>
        </ul>
      </div>
      
      <div className="navbar-user">
        <LanguagePicker />
        <span className="user-name">{user.ngoName}</span>
        <button className="logout-btn" onClick={handleLogout}>
          {t('navigation.logout')}
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 
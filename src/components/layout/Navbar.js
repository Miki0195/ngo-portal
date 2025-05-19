import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import '../../styles/Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
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
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </li>
          <li className={`nav-item ${isActive('/events')}`}>
            <Link to="/events" className="nav-link">Events</Link>
          </li>
          <li className={`nav-item ${isActive('/applications')}`}>
            <Link to="/applications" className="nav-link">Applications</Link>
          </li>
          <li className={`nav-item ${isActive('/profile')}`}>
            <Link to="/profile" className="nav-link">Profile</Link>
          </li>
        </ul>
      </div>
      
      <div className="navbar-user">
        <span className="user-name">{user.ngoName}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 
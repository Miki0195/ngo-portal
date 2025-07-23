import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authService from '../../services/authService';
import '../../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    
    if (errorParam) {
      setError(errorParam);
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Check for success message from registration
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the state to prevent showing the message on refresh
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-box">
        <h1 className="login-title">NGO Portal Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="form-footer">
            <p>Don't have an account? <Link to="/register" className="register-link">Register your NGO</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 
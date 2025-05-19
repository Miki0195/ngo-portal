import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * A route wrapper that protects routes by checking authentication status
 * and automatically refreshes tokens if they're about to expire.
 */
const ProtectedRoute = ({ children }) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!authService.isAuthenticated()) {
        setIsAuthenticated(false);
        setIsAuthChecked(true);
        return;
      }

      if (authService.isTokenExpired()) {
        try {
          const refreshResult = await authService.refreshToken();
          
          if (refreshResult.success) {
            setIsAuthenticated(true);
          } else {
            setAuthError('Your session has expired. Please login again.');
            setIsAuthenticated(false);
            
            authService.logout();
          }
        } catch (error) {
          setAuthError('Authentication error. Please login again.');
          setIsAuthenticated(false);
          
          authService.logout();
        }
      } else {
        setIsAuthenticated(true);
      }
      
      setIsAuthChecked(true);
    };

    checkAuthentication();
  }, []);

  if (!isAuthChecked) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
        <p>Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = authError 
      ? `/login?error=${encodeURIComponent(authError)}` 
      : '/login';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute; 
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from '../pages/Register';
import Dashboard from './dashboard/Dashboard';
import EventsList from './events/EventsList';
import EventDetails from './events/EventDetails';
import CreateEvent from './events/CreateEvent';
import EditEvent from './events/EditEvent';
import Layout from './layout/Layout';
import Profile from '../pages/Profile';
import Applications from '../pages/Applications';
import authService from '../services/authService';
import { FilterProvider } from '../context/FilterContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <div className="App">
      <Router>
        <FilterProvider>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Dashboard */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Events */}
              <Route path="events" element={<EventsList />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="events/:id/edit" element={<EditEvent />} />
              
              {/* Profile */}
              <Route path="profile" element={<Profile />} />
              
              {/* Applications */}
              <Route path="applications" element={<Applications />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </FilterProvider>
      </Router>
    </div>
  );
}

export default App; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Dashboard from './dashboard/Dashboard';
import EventsList from './events/EventsList';
import EventDetails from './events/EventDetails';
import CreateEvent from './events/CreateEvent';
import EditEvent from './events/EditEvent';
import Layout from './layout/Layout';
import authService from '../services/authService';
import { FilterProvider } from '../context/FilterContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <FilterProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with Layout */}
            <Route path="/dashboard" element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            } />
            
            <Route path="/events" element={
              <ProtectedLayout>
                <EventsList />
              </ProtectedLayout>
            } />
            
            <Route path="/events/create" element={
              <ProtectedLayout>
                <CreateEvent />
              </ProtectedLayout>
            } />
            
            <Route path="/events/:id" element={
              <ProtectedLayout>
                <EventDetails />
              </ProtectedLayout>
            } />
            
            <Route path="/events/:eventId/edit" element={
              <ProtectedLayout>
                <EditEvent />
              </ProtectedLayout>
            } />
            
            {/* Redirect root to login or dashboard based on auth status */}
            <Route path="/" element={
              authService.isAuthenticated() 
                ? <Navigate to="/dashboard" /> 
                : <Navigate to="/login" />
            } />
            
            {/* Catch all route - redirect to dashboard if authenticated */}
            <Route path="*" element={
              authService.isAuthenticated() 
                ? <Navigate to="/dashboard" /> 
                : <Navigate to="/login" />
            } />
          </Routes>
        </FilterProvider>
      </div>
    </Router>
  );
}

export default App;

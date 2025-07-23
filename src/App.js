import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/dashboard/Dashboard";
import EventsList from "./components/events/EventsList";
import Applications from "./pages/Applications";

function App() {
  return (
    <div className="App">
      <div className="main-content">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate replace to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/applications" element={<Applications />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App; 
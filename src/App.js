import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage'; 
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';


function AppRoutes() {
  const { user, loading} = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Login />;
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/project/:projectId" element={<ProjectPage />} />
    </Routes>
  );
}

function App() {
  return (
    
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
    
  );
}

export default App;

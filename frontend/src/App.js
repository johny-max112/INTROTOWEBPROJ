import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import EventsPage from './pages/EventsPage';
import SuggestionsPage from './pages/SuggestionsPage';
import DiscussionsPage from './pages/DiscussionsPage';
import ConcernsPage from './pages/ConcernsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnnouncementsManager from './pages/AdminAnnouncementsManager';
import AdminEventsManager from './pages/AdminEventsManager';
import UserProfile from './pages/UserProfile';

import { AuthProvider } from './auth/AuthContext';
import AuthContext from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';

function AppContent(){
  const { user, logout } = useContext(AuthContext);
  return (
    <Router>
      <div className="App">
        {/* Top navigation removed — Home page provides header and tiles */}

        <main>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/discussions" element={<DiscussionsPage />} />
            <Route path="/concerns" element={<ConcernsPage />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncementsManager /></AdminRoute>} />
            <Route path="/admin/events" element={<AdminRoute><AdminEventsManager /></AdminRoute>} />
            <Route path="/profile/:id" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App(){
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

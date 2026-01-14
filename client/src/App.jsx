import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import CharacterCreatePage from './pages/CharacterCreatePage';
import GamePage from './pages/GamePage';
import GMDashboard from './pages/GMDashboard';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-void-900">
    <div className="text-center">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-3 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <h2 className="font-display text-2xl text-purple-400 text-glow-sm">
        AWAKENING...
      </h2>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children, requireCharacter = false }) => {
  const { isAuthenticated, character, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireCharacter && !character) {
    return <Navigate to="/create-character" replace />;
  }
  
  return children;
};

// GM route wrapper
const GMRoute = ({ children }) => {
  const { isGM, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  if (!isGM) {
    return <Navigate to="/game" replace />;
  }
  
  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/create-character" element={
          <ProtectedRoute>
            <CharacterCreatePage />
          </ProtectedRoute>
        } />
        
        <Route path="/game" element={
          <ProtectedRoute requireCharacter>
            <GamePage />
          </ProtectedRoute>
        } />
        
        <Route path="/gm" element={
          <GMRoute>
            <GMDashboard />
          </GMRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;

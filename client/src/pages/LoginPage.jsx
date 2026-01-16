import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  
  const { login, isAuthenticated, character, isGM, loading } = useAuth();
  const navigate = useNavigate();

  // FIX #1: Only redirect when NOT loading and properly authenticated
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (loading) return;
    
    if (isAuthenticated) {
      console.log('Auth state:', { isAuthenticated, isGM, hasCharacter: !!character });
      
      if (isGM) {
        navigate('/gm', { replace: true });
      } else if (character) {
        navigate('/game', { replace: true });
      } else {
        navigate('/create-character', { replace: true });
      }
    }
  }, [isAuthenticated, character, isGM, navigate, loading]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    console.log('Login result:', result);
    
    if (result.success) {
      // FIX #1: Navigate immediately based on login result, don't wait for useEffect
      // This is more reliable because we have fresh data from the server
      if (result.isGM) {
        console.log('Redirecting GM to /gm');
        navigate('/gm', { replace: true });
      } else if (result.hasCharacter) {
        console.log('Redirecting player with character to /game');
        navigate('/game', { replace: true });
      } else {
        console.log('Redirecting new player to /create-character');
        navigate('/create-character', { replace: true });
      }
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  // Intro animation
  if (showIntro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void-900 overflow-hidden">
        <div className="text-center animate-pulse">
          <div className="relative">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 text-glow animate-pulse">
              AWAKENED
            </h1>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-gray-400 tracking-[0.3em] mt-2">
              PROTOCOL
            </h2>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-purple-500"></div>
              <span className="font-display text-2xl text-purple-400">ZERO</span>
              <div className="w-16 h-[2px] bg-gradient-to-l from-transparent to-purple-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-purple-500/5 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-purple-500/10 rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            AWAKENED
          </h1>
          <h2 className="font-display text-xl text-gray-500 tracking-[0.2em] mt-1">
            PROTOCOL : ZERO
          </h2>
        </div>

        {/* Login Card */}
        <div className="bg-void-800/80 backdrop-blur-sm rounded-xl p-8 neon-border">
          <div className="text-center mb-8">
            <h3 className="font-display text-xl text-gray-200">HUNTER LOGIN</h3>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                HUNTER ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2 font-medium">
                ACCESS CODE
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>CONNECTING...</span>
                </>
              ) : (
                <>
                  <span>⚔️</span>
                  <span>ENTER THE TOWER</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-gray-500 text-sm">
              No account? Contact the <span className="text-purple-400">Game Master</span> to register.
            </p>
          </div>
        </div>

        {/* Version info */}
        <div className="mt-6 text-center text-gray-600 text-xs">
          <p>Phase 7.2 • Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

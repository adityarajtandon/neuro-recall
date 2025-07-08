import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import NoteDetail from './components/NoteDetail';
import QuizPage from './components/QuizPage';
import ReviewPage from './components/ReviewPage';
import neonBulb from './assets/neon-bulb.png';

// Theme toggle button
function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="ml-4 p-2 rounded-full border border-gray-300 dark:border-transparent bg-gray-100 dark:bg-dark-800 hover:ring-2 hover:ring-accent transition shadow-glow flex items-center justify-center"
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
      )}
    </button>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [theme, setTheme] = useState('dark');

  const API_BASE = 'http://localhost:5001/api';

  // Theme effect
  useEffect(() => {
    // Load theme from localStorage or system
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
    else setTheme('light');
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleAuth = async (formData, mode) => {
    setIsLoading(true);
    setAuthError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const response = await axios.post(`${API_BASE}${endpoint}`, {
        email: formData.email,
        password: formData.password
      });

      const { token, user: userData } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set user state
      setUser(userData);
      
    } catch (error) {
      console.error('Auth error:', error);
      setAuthError(error.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Fetch user info from backend
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      // fallback: logout if error
      handleLogout();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
          {/* Public routes */}
        <Routes>
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : (
                <AuthForm 
                  mode="login" 
                  onSubmit={(formData) => handleAuth(formData, 'login')}
                  isLoading={isLoading}
                  error={authError}
                />
              )
            } 
          />
          <Route 
            path="/signup" 
            element={
              user ? <Navigate to="/dashboard" replace /> : (
                <AuthForm 
                  mode="signup" 
                  onSubmit={(formData) => handleAuth(formData, 'signup')}
                  isLoading={isLoading}
                  error={authError}
                />
              )
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              user ? <Dashboard user={user} onLogout={handleLogout} onNoteUpload={fetchUserInfo} themeToggle={<ThemeToggle theme={theme} setTheme={setTheme} />} /> : <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/note/:id" 
            element={user ? <NoteDetail /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/quiz/:quizId" 
            element={user ? <QuizPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/review" 
            element={user ? <ReviewPage /> : <Navigate to="/login" replace />} 
          />
          
          {/* Landing page */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LandingPage themeToggle={<ThemeToggle theme={theme} setTheme={setTheme} />} />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

// Replace the LandingPage component with a SaaS-style hero section
function LandingPage({ themeToggle }) {
  return (
    <div className="min-h-screen bg-dark text-white flex flex-col" style={{backgroundImage: 'radial-gradient(ellipse at 50% 30%, #23263a 0%, #10131a 100%)'}}>
      {/* Navigation */}
      <nav className="bg-dark-900 shadow-lg border-b border-dark-800 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-accent flex items-center">
              <span className="mr-2">🧠</span> NeuroRecall
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {themeToggle}
            <a
              href="/login"
              className="text-gray-300 hover:text-accent px-3 py-2 rounded-md text-sm font-medium transition"
            >
              Login
            </a>
            <a
              href="/signup"
              className="pill-btn glow-btn animate-fade-in-up"
            >
              Sign Up
            </a>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center px-4 py-16 md:py-24 lg:py-32 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center w-full gap-12">
          {/* Left: Text */}
          <div className="flex-1 text-left animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-accent via-accent-blue to-accent-pink bg-clip-text text-transparent">
              Master Your Learning<br />with <span className="text-accent">AI-Powered Recall</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl animate-fade-in-up" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
              Upload your notes, generate intelligent quizzes, and optimize your learning with neuroscience-backed spaced repetition. Track your progress and unlock your full cognitive potential.
            </p>
            <div className="flex gap-4 animate-fade-in-up" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
              <a href="/signup" className="pill-btn glow-btn text-lg px-10 py-4 font-bold shadow-neon-pink animate-pulse-glow">Get Started</a>
              <a href="/login" className="pill-btn bg-dark-800 text-accent border border-accent hover:bg-dark-900 hover:text-accent-blue text-lg px-10 py-4 font-bold transition">Learn More</a>
            </div>
          </div>
          {/* Right: Neon Bulb Illustration */}
          <div className="flex-1 flex items-center justify-center animate-fade-in-up" style={{animationDelay: '0.6s', animationFillMode: 'both'}}>
            <div className="glass-card p-8 flex items-center justify-center shadow-neon-blue" style={{backdropFilter: 'blur(16px)'}}>
              <img src={neonBulb} alt="Neon Bulb" className="w-64 h-64 object-contain drop-shadow-glow" />
            </div>
          </div>
        </div>
      </div>
      {/* Features Section (unchanged for now) */}
      <div className="py-12 bg-dark-900 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-accent font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to optimize learning
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-accent text-white shadow-glow">
                  📚
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-white">Smart Note Upload</p>
                <p className="mt-2 ml-16 text-base text-gray-300">
                  Upload PDFs, text files, or write notes directly. Our AI processes and organizes your content intelligently.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-accent text-white shadow-glow">
                  🧠
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-white">AI Quiz Generation</p>
                <p className="mt-2 ml-16 text-base text-gray-300">
                  Generate flashcards, multiple choice questions, and fill-in-the-blanks from your notes automatically.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-accent text-white shadow-glow">
                  ⏰
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-white">Spaced Repetition</p>
                <p className="mt-2 ml-16 text-base text-gray-300">
                  Based on neuroscience research, our algorithm optimizes review timing for maximum retention.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-accent text-white shadow-glow">
                  📊
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-white">Progress Analytics</p>
                <p className="mt-2 ml-16 text-base text-gray-300">
                  Track your learning progress with detailed analytics and cognitive heatmaps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

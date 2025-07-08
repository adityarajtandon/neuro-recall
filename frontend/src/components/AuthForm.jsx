import React, { useState, useEffect, useRef } from 'react';

const AuthForm = ({ mode, onSubmit, isLoading, error }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.classList.add('animate-fade-in-up');
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark bg-gradient-to-br from-dark-900 via-dark-800 to-dark px-4">
      <div
        ref={cardRef}
        className="glass-card max-w-md w-full p-8 md:p-10 rounded-2xl shadow-glow border border-white border-opacity-10 backdrop-blur-lg relative animate-fade-in-up"
        style={{ animationDuration: '0.7s' }}
        aria-label={isSignup ? 'Sign Up Form' : 'Login Form'}
      >
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-wide text-accent mb-2 text-center font-sora">
          {isSignup ? 'Create your account' : 'Welcome back!'}
        </h2>
        <p className="text-gray-400 text-center mb-8 font-medium font-sans tracking-wide">
          {isSignup ? 'Sign up to start optimizing your learning.' : 'Log in to continue your journey.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-7 font-sans">
          {/* Email */}
          <div className="relative flex items-center justify-center">
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`peer w-full px-4 pt-6 pb-2 bg-glass-light bg-opacity-60 border border-accent/30 focus:border-accent focus:ring-2 focus:ring-accent outline-none rounded-xl text-white placeholder-transparent transition-all duration-200 shadow-inner font-medium text-center ${touched.email && !form.email ? 'border-red-500' : ''}`}
              placeholder="Email address"
              aria-label="Email address"
            />
            <label
              htmlFor="email"
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-base font-semibold tracking-wide pointer-events-none transition-all duration-200 text-center w-full font-sans
                peer-focus:top-2 peer-focus:left-1/2 peer-focus:-translate-x-1/2 peer-focus:-translate-y-0 peer-focus:scale-90 peer-focus:text-accent
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal
                ${form.email ? '!top-2 !left-1/2 !-translate-x-1/2 !-translate-y-0 !scale-90 !text-accent' : ''}`}
            >
              Email address
            </label>
          </div>
          {/* Password */}
          <div className="relative flex items-center justify-center">
            <input
              type="password"
              name="password"
              id="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`peer w-full px-4 pt-6 pb-2 bg-glass-light bg-opacity-60 border border-accent/30 focus:border-accent focus:ring-2 focus:ring-accent outline-none rounded-xl text-white placeholder-transparent transition-all duration-200 shadow-inner font-medium text-center ${touched.password && !form.password ? 'border-red-500' : ''}`}
              placeholder="Password"
              aria-label="Password"
            />
            <label
              htmlFor="password"
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-400 text-base font-semibold tracking-wide pointer-events-none transition-all duration-200 text-center w-full font-sans
                peer-focus:top-2 peer-focus:left-1/2 peer-focus:-translate-x-1/2 peer-focus:-translate-y-0 peer-focus:scale-90 peer-focus:text-accent
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:left-1/2 peer-placeholder-shown:-translate-x-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal
                ${form.password ? '!top-2 !left-1/2 !-translate-x-1/2 !-translate-y-0 !scale-90 !text-accent' : ''}`}
            >
              Password
            </label>
          </div>
          {/* Error message */}
          {error && (
            <div className="w-full text-center font-sans">
              <div className="bg-red-500/90 text-white rounded-lg px-4 py-2 mt-2 mb-2 animate-fade-in-up shadow-glow text-sm font-semibold inline-block tracking-wide">
                {error}
              </div>
            </div>
          )}
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-accent via-accent-blue to-accent-pink shadow-glow hover:from-accent-blue hover:to-accent-pink focus:ring-2 focus:ring-accent focus:outline-none transition-all duration-200 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed pulse-glow tracking-wide font-sora"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center font-sans">
                <svg className="animate-spin h-6 w-6 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                {isSignup ? 'Signing Up...' : 'Logging In...'}
              </span>
            ) : (
              isSignup ? 'Sign Up' : 'Log In'
            )}
          </button>
        </form>
        <div className="mt-6 text-center text-gray-400 text-sm font-sans tracking-wide">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <a href="/login" className="text-accent hover:text-accent-blue font-semibold transition font-sans">Log in</a>
            </>
          ) : (
            <>
              Don&apos;t have an account?{' '}
              <a href="/signup" className="text-accent hover:text-accent-blue font-semibold transition font-sans">Sign up</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 
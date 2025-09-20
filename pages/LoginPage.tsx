

import React, { useState } from 'react';
// FIX: Use named imports for react-router-dom components and hooks.
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LogIn, AlertTriangle } from 'lucide-react';
import Spinner from '../components/Spinner';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAppContext();
  // FIX: Use the useNavigate hook directly.
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      const fromLocation = location.state?.from as { pathname: string; search: string; hash: string } | undefined;
      // For HashRouter, the intended path is in the hash. We must reconstruct
      // the path from it to ensure correct redirection after login.
      const redirectTo = fromLocation?.hash ? fromLocation.hash.substring(1) : '/';
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-indigo-600">InterPrepAI</h1>
        <p className="text-slate-600 mt-2 text-md sm:text-lg">Welcome Back! Please log in to continue.</p>
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">Log In</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertTriangle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {isLoading ? <Spinner size="h-6 w-6" /> : <><LogIn className="mr-3" size={20}/> Log In</>}
              </button>
            </div>
          </form>
           <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            {/* FIX: Use the Link component directly. */}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
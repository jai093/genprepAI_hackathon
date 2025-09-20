

import React, { useState } from 'react';
// FIX: Use named imports for react-router-dom components and hooks.
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { UserPlus, AlertTriangle, User, Briefcase } from 'lucide-react';
import Spinner from '../components/Spinner';
import type { UserRole } from '../types';

const SignupPage: React.FC = () => {
  const { signup, login } = useAppContext();
  // FIX: Use the useNavigate hook directly.
  const navigate = useNavigate();
  const location = useLocation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      // FIX: The signup function expects two arguments: a userData object and a role string.
      await signup({ name, email, password }, role);
      await login({ email, password }); // Log in the new user automatically
      const fromLocation = location.state?.from as { pathname: string; search: string; hash: string } | undefined;
      // For HashRouter, the intended path is in the hash. We must reconstruct
      // the path from it to ensure correct redirection after signup.
      const redirectTo = fromLocation?.hash ? fromLocation.hash.substring(1) : '/';
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-indigo-600">InterPrepAI</h1>
        <p className="text-slate-600 mt-2 text-md sm:text-lg">Create Your Account to Get Started</p>
      </div>
      <div className="w-full max-w-md">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">Sign Up</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-slate-700">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setRole('candidate')} className={`flex items-center justify-center p-3 border rounded-md transition-colors ${role === 'candidate' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                        <User size={16} className="mr-2"/> Candidate
                    </button>
                    <button type="button" onClick={() => setRole('recruiter')} className={`flex items-center justify-center p-3 border rounded-md transition-colors ${role === 'recruiter' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                        <Briefcase size={16} className="mr-2"/> Recruiter
                    </button>
                </div>
            </div>

            {error && (
              <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                <AlertTriangle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center mt-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                {isLoading ? <Spinner size="h-6 w-6" /> : <><UserPlus className="mr-3" size={20}/> Create Account</>}
              </button>
            </div>
          </form>
           <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            {/* FIX: Use the Link component directly. */}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
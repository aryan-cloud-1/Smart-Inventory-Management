import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, Shield, User, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-lg shadow-primary-600/30 mb-3">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Inventory System</h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise Warehouse & Procurement Management</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Username / Email</label>
            <div className="relative">
              <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm shadow-md shadow-primary-600/30 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In with JWT'}
          </button>

          {/* Quick Credential Fillers for Testing & Demo */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Demo Test Accounts (Click to Fill)
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Password@123')}
                className="py-1.5 px-2 bg-purple-50 text-purple-700 rounded-md font-semibold hover:bg-purple-100 transition border border-purple-200"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager', 'Password@123')}
                className="py-1.5 px-2 bg-blue-50 text-blue-700 rounded-md font-semibold hover:bg-blue-100 transition border border-blue-200"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('cashier1', 'Password@123')}
                className="py-1.5 px-2 bg-emerald-50 text-emerald-700 rounded-md font-semibold hover:bg-emerald-100 transition border border-emerald-200"
              >
                Staff
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

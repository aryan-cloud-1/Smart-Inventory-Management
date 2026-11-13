import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User as UserIcon, Shield, Layers } from 'lucide-react';

const Navbar = ({ lowStockCount = 0, onNavigateTab }) => {
  const { user, logout, isAdmin, isManager } = useAuth();

  const getRoleBadge = () => {
    if (isAdmin) return <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-purple-200">Admin</span>;
    if (isManager) return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-blue-200">Manager</span>;
    return <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">Staff / Cashier</span>;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary-600/30">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            SmartInventory
          </span>
          <span className="text-xs text-slate-400 font-mono ml-2">v1.0.0</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Low Stock Alert Button */}
        {lowStockCount > 0 && (
          <button
            onClick={() => onNavigateTab('products', { filterLowStock: true })}
            className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Bell className="h-4 w-4 text-amber-600 animate-pulse" />
            <span>{lowStockCount} Low Stock Alert{lowStockCount > 1 ? 's' : ''}</span>
          </button>
        )}

        {/* User Profile & Role Info */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className="h-9 w-9 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm border border-slate-200">
            {user?.fullName ? user.fullName.charAt(0) : <UserIcon className="h-4 w-4" />}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.fullName || user?.username}
            </div>
            <div className="mt-0.5">
              {getRoleBadge()}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;

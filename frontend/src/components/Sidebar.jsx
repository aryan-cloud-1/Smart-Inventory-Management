import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  ShoppingCart, 
  FileText, 
  ShieldAlert,
  Download
} from 'lucide-react';
import { reportApi } from '../services/api';

const Sidebar = ({ activeTab, onSelectTab }) => {
  const { isManager } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, managerOnly: false },
    { id: 'products', label: 'Product Catalog', icon: Package, managerOnly: false },
    { id: 'transactions', label: 'Stock Movement', icon: ArrowLeftRight, managerOnly: false },
    { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart, managerOnly: false },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Core Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Report Exports Section */}
        {isManager && (
          <div>
            <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Instant Reports</span>
              <Download className="h-3.5 w-3.5 text-slate-500" />
            </div>
            <div className="space-y-1.5 px-1">
              <button
                onClick={reportApi.downloadInventoryPdf}
                className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition border border-slate-800 hover:border-slate-700"
              >
                <FileText className="h-3.5 w-3.5 text-rose-400" />
                <span>Inventory Valuation (PDF)</span>
              </button>
              <button
                onClick={reportApi.downloadInventoryCsv}
                className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition border border-slate-800 hover:border-slate-700"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span>Products List (CSV)</span>
              </button>
              <button
                onClick={reportApi.downloadTransactionsCsv}
                className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition border border-slate-800 hover:border-slate-700"
              >
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                <span>Audit Logs Ledger (CSV)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Database & System info footer */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
        <div className="flex items-center space-x-2 text-slate-400">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-medium text-slate-300">MySQL 8.0 & Spring Boot</span>
        </div>
        <div>Transactions: ACID Verified</div>
        <div>Auth: Stateless JWT (RBAC)</div>
      </div>
    </aside>
  );
};

export default Sidebar;

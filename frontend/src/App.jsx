import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import TransactionsPage from './pages/TransactionsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import LoginPage from './pages/LoginPage';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [productPageOptions, setProductPageOptions] = useState({ filterLowStock: false });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigateTab = (tabId, options = {}) => {
    setActiveTab(tabId);
    if (tabId === 'products' && options.filterLowStock !== undefined) {
      setProductPageOptions({ filterLowStock: options.filterLowStock });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onNavigateTab={handleNavigateTab} />
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} onSelectTab={(tab) => handleNavigateTab(tab)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardPage onNavigateTab={handleNavigateTab} />}
          {activeTab === 'products' && (
            <ProductsPage initialFilterLowStock={productPageOptions.filterLowStock} />
          )}
          {activeTab === 'transactions' && <TransactionsPage />}
          {activeTab === 'orders' && <PurchaseOrdersPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

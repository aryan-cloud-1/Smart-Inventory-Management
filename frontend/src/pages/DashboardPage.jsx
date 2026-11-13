import React, { useState, useEffect } from 'react';
import { analyticsApi, productApi } from '../services/api';
import StatCard from '../components/StatCard';
import StockMovementModal from '../components/StockMovementModal';
import MovementTrendsChart from '../components/MovementTrendsChart';
import { 
  DollarSign, 
  AlertTriangle, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  ArrowDownRight, 
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';

const DashboardPage = ({ onNavigateTab }) => {
  const [summary, setSummary] = useState(null);
  const [eoqSuggestions, setEoqSuggestions] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, eoqRes, trendsRes] = await Promise.all([
        analyticsApi.getDashboardSummary(),
        productApi.getEoqSuggestions(),
        analyticsApi.getTrends(30),
      ]);
      setSummary(sumRes.data);
      setEoqSuggestions(eoqRes.data || []);
      setTrends(trendsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenMovement = (product) => {
    setSelectedProduct(product);
    setIsMovementModalOpen(true);
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const costValuation = Number(summary?.totalInventoryCostValue || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const retailValuation = Number(summary?.totalInventoryRetailValue || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Inventory Overview</h1>
          <p className="text-sm text-slate-500">Live operational metrics, automated safety stock alarms, and EOQ suggestions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            title="Refresh Metrics"
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-600 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleOpenMovement(null)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-primary-600/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Log Movement</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Inventory Valuation"
          value={costValuation}
          subtitle={`Retail Value: ${retailValuation}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Safety Threshold Alerts"
          value={summary?.lowStockCount || 0}
          subtitle={summary?.lowStockCount > 0 ? 'Requires immediate reorder' : 'All stocks healthy'}
          icon={AlertTriangle}
          color={summary?.lowStockCount > 0 ? 'rose' : 'blue'}
          badge={summary?.lowStockCount > 0 ? 'CRITICAL' : null}
        />
        <StatCard
          title="Total Stock Units"
          value={summary?.totalUnitsInStock?.toLocaleString() || 0}
          subtitle={`Across ${summary?.totalProductsCount || 0} catalog items`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Pending Orders (PO)"
          value={summary?.pendingPurchaseOrdersCount || 0}
          subtitle="Awaiting vendor fulfillment"
          icon={ShoppingCart}
          color="amber"
        />
      </div>

      {/* Smart EOQ Reorder Recommendations Banner */}
      {eoqSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-amber-900 text-sm uppercase tracking-wider">
                Automated Economic Order Quantity (EOQ) Recommendations
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
            >
              Manage Purchase Orders &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {eoqSuggestions.slice(0, 3).map((item) => (
              <div key={item.productId} className="bg-white/80 backdrop-blur rounded-lg border border-amber-200 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800 text-sm truncate">{item.productName}</span>
                    <span className="text-xs font-mono text-slate-500">{item.sku}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Current Stock:</span>
                      <strong className="text-rose-600">{item.currentStock} / {item.minThreshold}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Suggested Reorder:</span>
                      <strong className="text-emerald-700 font-bold">{item.suggestedReorderQuantity} units</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Est. Supplier Cost:</span>
                      <span>${Number(item.estimatedTotalOrderCost || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 truncate max-w-[140px]">{item.supplierName}</span>
                  <button
                    onClick={() => handleOpenMovement(item)}
                    className="text-primary-600 font-semibold hover:text-primary-700"
                  >
                    Quick Stock-In
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle Row: Fast Moving vs Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fast Moving Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">Fast-Moving Inventory (Past 30 Days)</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">By units dispatched</span>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.fastMovingItems?.length > 0 ? (
              summary.fastMovingItems.map((item, idx) => (
                <div key={item.productId} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{item.productName}</div>
                      <div className="text-xs text-slate-400 font-mono">{item.sku}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">{item.unitsDispatched} units</div>
                    <div className="text-xs text-slate-500">${Number(item.revenueGenerated || 0).toFixed(2)} generated</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">No stock-out dispatches recorded in this period</div>
            )}
          </div>
        </div>

        {/* Category Stock Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-base">Category Stock Distribution</h3>
            <span className="text-xs text-slate-400 font-medium">On-hand volume</span>
          </div>

          <div className="space-y-4">
            {summary?.categoryDistribution?.map((cat) => {
              const maxUnits = summary?.totalUnitsInStock || 1;
              const percent = Math.min(100, Math.round(((cat.totalStockUnits || 0) / maxUnits) * 100));
              return (
                <div key={cat.categoryName} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.categoryName}</span>
                    <span className="text-slate-500">{cat.totalStockUnits} units ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Graphical Movement Trends */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Movement Trends (Stock In vs Stock Out)</h3>
            <p className="text-xs text-slate-400">Daily replenishment volume vs dispatch velocity</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold">Past 30 Days</span>
        </div>
        <MovementTrendsChart trends={trends} />
      </div>

      {/* Recent Ledger Audit Trail */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-base">Live Stock Movement Ledger</h3>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            View Full Audit Trail &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">SKU & Item</th>
                <th className="py-2.5 px-3">Movement Qty</th>
                <th className="py-2.5 px-3">Balance Ledger</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.recentTransactions?.slice(0, 6).map((tx) => {
                const isOut = tx.transactionType === 'STOCK_OUT' || tx.transactionType === 'TRANSFER';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-semibold">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] ${
                        isOut ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {isOut ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        <span>{tx.transactionType}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{tx.productName}</div>
                      <div className="font-mono text-slate-400">{tx.productSku}</div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      {isOut ? `-${tx.quantity}` : `+${tx.quantity}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {tx.previousBalance} &rarr; <span className="font-bold text-slate-800">{tx.newBalance}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{tx.operatorUsername}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Modal */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        preselectedProduct={selectedProduct}
        products={summary?.lowStockAlerts || []}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};

export default DashboardPage;

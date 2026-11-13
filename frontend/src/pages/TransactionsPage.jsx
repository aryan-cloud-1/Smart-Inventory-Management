import React, { useState, useEffect } from 'react';
import { transactionApi, reportApi } from '../services/api';
import StockMovementModal from '../components/StockMovementModal';
import { 
  ArrowLeftRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Download, 
  Plus, 
  RefreshCw,
  Search
} from 'lucide-react';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionApi.getRecent();
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to load transaction history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.transactionType !== typeFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tx.productName?.toLowerCase().includes(q) ||
        tx.productSku?.toLowerCase().includes(q) ||
        tx.referenceNumber?.toLowerCase().includes(q) ||
        tx.operatorUsername?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Movement & Audit Trail</h1>
          <p className="text-sm text-slate-500">Immutable ledger of all stock inputs, dispatches, adjustments, and operators</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={reportApi.downloadTransactionsCsv}
            className="flex items-center space-x-2 border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsMovementModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-primary-600/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Movement</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, reference no, operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>

        {/* Movement Type Filter Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
          {['ALL', 'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-md transition ${
                typeFilter === type
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              {type === 'ALL' ? 'All Movements' : type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading audit ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">No movement records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Item & SKU</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Balance Delta</th>
                  <th className="py-3 px-4">Reference No</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => {
                  const isOut = tx.transactionType === 'STOCK_OUT' || tx.transactionType === 'TRANSFER';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-semibold whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isOut ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isOut ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          <span>{tx.transactionType}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{tx.productName}</div>
                        <div className="text-xs text-slate-400 font-mono">{tx.productSku}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {isOut ? `-${tx.quantity}` : `+${tx.quantity}`}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs font-mono">
                        {tx.previousBalance} &rarr; <span className="font-bold text-slate-900">{tx.newBalance}</span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-600">
                        {tx.referenceNumber || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-slate-800">{tx.operatorFullName || tx.operatorUsername}</div>
                        <div className="text-[11px] text-slate-400 font-mono">@{tx.operatorUsername}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {tx.remarks || '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-xs text-slate-400 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
};

export default TransactionsPage;

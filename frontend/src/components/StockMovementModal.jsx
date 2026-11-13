import React, { useState } from 'react';
import { transactionApi } from '../services/api';
import { X, ArrowDownRight, ArrowUpRight, SlidersHorizontal, AlertCircle } from 'lucide-react';

const StockMovementModal = ({ isOpen, onClose, products = [], onSuccess, preselectedProduct = null }) => {
  const [productId, setProductId] = useState(preselectedProduct?.id || '');
  const [transactionType, setTransactionType] = useState('STOCK_IN');
  const [quantity, setQuantity] = useState(1);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedProd = products.find((p) => p.id === (productId || preselectedProduct?.id)) || preselectedProduct;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!productId && !preselectedProduct?.id) {
      setError('Please select a product');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }

    if (transactionType === 'STOCK_OUT' && selectedProd && selectedProd.currentStock < quantity) {
      setError(`Cannot dispatch ${quantity} units! Only ${selectedProd.currentStock} units currently available.`);
      return;
    }

    setLoading(true);
    try {
      await transactionApi.logMovement({
        productId: productId || preselectedProduct?.id,
        transactionType,
        quantity: parseInt(quantity, 10),
        referenceNumber: referenceNumber.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to log stock movement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-700">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Log Inventory Movement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Movement Type Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Movement Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransactionType('STOCK_IN')}
                className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-sm font-semibold border transition ${
                  transactionType === 'STOCK_IN'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                <span>Stock In</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('STOCK_OUT')}
                className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-sm font-semibold border transition ${
                  transactionType === 'STOCK_OUT'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-rose-600" />
                <span>Stock Out</span>
              </button>

              <button
                type="button"
                onClick={() => setTransactionType('ADJUSTMENT')}
                className={`flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-sm font-semibold border transition ${
                  transactionType === 'ADJUSTMENT'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4 text-amber-600" />
                <span>Adjustment</span>
              </button>
            </div>
          </div>

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product</label>
            {preselectedProduct ? (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                <span className="font-semibold text-slate-800">{preselectedProduct.name}</span>
                <span className="text-slate-500 font-mono ml-2">({preselectedProduct.sku})</span>
                <div className="text-xs text-slate-500 mt-1">
                  On Hand Stock: <strong className="text-slate-800">{preselectedProduct.currentStock}</strong> | Threshold: {preselectedProduct.minThreshold}
                </div>
              </div>
            ) : (
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">-- Choose Catalog Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name} (Stock: {p.currentStock})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {transactionType === 'ADJUSTMENT' ? 'New Count Target' : 'Quantity Units'}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Ref / Invoice No</label>
              <input
                type="text"
                placeholder="e.g. PO-8902, DISP-01"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Audit Remarks / Notes</label>
            <input
              type="text"
              placeholder="e.g. Replenishment shipment, Assembly line dispatch"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-primary-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;

import React, { useState } from 'react';
import { purchaseOrderApi } from '../services/api';
import { X, ShoppingBag, Plus, Trash2, AlertCircle } from 'lucide-react';

const PurchaseOrderModal = ({ isOpen, onClose, suppliers = [], products = [], onSuccess }) => {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { productId: products[0]?.id || '', quantityOrdered: 10, unitPrice: products[0]?.unitCost || 10 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultProduct = products[0];
    setItems((prev) => [
      ...prev,
      { productId: defaultProduct?.id || '', quantityOrdered: 10, unitPrice: defaultProduct?.unitCost || 10 },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        if (prod) {
          next[index].unitPrice = prod.unitCost;
        }
      }
      return next;
    });
  };

  const totalAmount = items.reduce((sum, item) => {
    return sum + (Number(item.quantityOrdered) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a supplier');
      return;
    }

    if (items.length === 0) {
      setError('At least one item is required in the purchase order');
      return;
    }

    setLoading(true);
    try {
      await purchaseOrderApi.createOrder({
        supplierId,
        expectedDeliveryDate: expectedDeliveryDate || null,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantityOrdered: parseInt(i.quantityOrdered, 10),
          unitPrice: parseFloat(i.unitPrice),
        })),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to generate Purchase Order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary-100 text-primary-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Generate Purchase Order (PO)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Supplier *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">-- Choose Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.companyName} ({s.country})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase">Order Line Items</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantityOrdered}
                      onChange={(e) => handleItemChange(index, 'quantityOrdered', e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-right bg-white"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs text-right bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between items-center bg-slate-100 px-4 py-2.5 rounded-lg">
              <span className="text-sm font-semibold text-slate-700">Estimated Total Order Cost:</span>
              <span className="text-base font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Order Notes</label>
            <textarea
              rows="2"
              placeholder="Terms, dispatch instructions, urgent tags..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {loading ? 'Submitting...' : 'Issue Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;

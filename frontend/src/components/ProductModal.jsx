import React, { useState, useEffect } from 'react';
import { productApi } from '../services/api';
import { X, PackagePlus, AlertCircle } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product = null, categories = [], suppliers = [], onSuccess }) => {
  const isEdit = Boolean(product);
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: '',
    supplierId: '',
    unitCost: '',
    sellingPrice: '',
    currentStock: '0',
    minThreshold: '10',
    reorderQuantity: '50',
    annualDemand: '600',
    orderCost: '50.00',
    holdingCostPercent: '20.00',
    storageLocation: 'Warehouse-A / Shelf-01',
    unitOfMeasure: 'UNIT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        supplierId: product.supplierId || '',
        unitCost: product.unitCost || '',
        sellingPrice: product.sellingPrice || '',
        currentStock: String(product.currentStock ?? 0),
        minThreshold: String(product.minThreshold ?? 10),
        reorderQuantity: String(product.reorderQuantity ?? 50),
        annualDemand: String(product.annualDemand ?? 600),
        orderCost: String(product.orderCost ?? 50.0),
        holdingCostPercent: String(product.holdingCostPercent ?? 20.0),
        storageLocation: product.storageLocation || 'Warehouse-A / Shelf-01',
        unitOfMeasure: product.unitOfMeasure || 'UNIT',
      });
    } else {
      setFormData({
        sku: '',
        barcode: '',
        name: '',
        description: '',
        categoryId: categories[0]?.id || '',
        supplierId: suppliers[0]?.id || '',
        unitCost: '',
        sellingPrice: '',
        currentStock: '0',
        minThreshold: '10',
        reorderQuantity: '50',
        annualDemand: '600',
        orderCost: '50.00',
        holdingCostPercent: '20.00',
        storageLocation: 'Warehouse-A / Shelf-01',
        unitOfMeasure: 'UNIT',
      });
    }
  }, [product, isOpen, categories, suppliers]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        supplierId: formData.supplierId || null,
        unitCost: parseFloat(formData.unitCost),
        sellingPrice: parseFloat(formData.sellingPrice),
        currentStock: parseInt(formData.currentStock, 10),
        minThreshold: parseInt(formData.minThreshold, 10),
        reorderQuantity: parseInt(formData.reorderQuantity, 10),
        annualDemand: parseInt(formData.annualDemand, 10),
        orderCost: parseFloat(formData.orderCost),
        holdingCostPercent: parseFloat(formData.holdingCostPercent),
      };

      if (isEdit) {
        await productApi.updateProduct(product.id, payload);
      } else {
        await productApi.createProduct(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save product');
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
              <PackagePlus className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">
              {isEdit ? `Edit Product: ${product.sku}` : 'Add New Catalog Item'}
            </h3>
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
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">SKU *</label>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. SKU-ELEC-100"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Barcode / QR Code</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="e.g. 8901234567895"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Industrial Digital Multimeter"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category *</label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Supplier</label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">-- Unassigned --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.companyName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unit Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="unitCost"
                required
                value={formData.unitCost}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Selling Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sellingPrice"
                required
                value={formData.sellingPrice}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Stock *</label>
              <input
                type="number"
                min="0"
                name="currentStock"
                required
                value={formData.currentStock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Safety Threshold *</label>
              <input
                type="number"
                min="1"
                name="minThreshold"
                required
                value={formData.minThreshold}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-rose-700"
              />
            </div>
          </div>

          {/* Smart EOQ Parameters */}
          <div className="border border-indigo-100 bg-indigo-50/50 p-3 rounded-xl space-y-2">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
              Smart Inventory & EOQ Configuration
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-indigo-800">Est. Annual Demand (D)</label>
                <input
                  type="number"
                  name="annualDemand"
                  value={formData.annualDemand}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-indigo-200 rounded text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-indigo-800">Order Cost (S in $)</label>
                <input
                  type="number"
                  step="0.01"
                  name="orderCost"
                  value={formData.orderCost}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-indigo-200 rounded text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-indigo-800">Holding Cost % (H)</label>
                <input
                  type="number"
                  step="0.1"
                  name="holdingCostPercent"
                  value={formData.holdingCostPercent}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 border border-indigo-200 rounded text-xs bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Storage Location</label>
              <input
                type="text"
                name="storageLocation"
                value={formData.storageLocation}
                onChange={handleChange}
                placeholder="Warehouse-A / Shelf-01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unit of Measure</label>
              <select
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="UNIT">UNIT</option>
                <option value="BOX">BOX</option>
                <option value="PACKET">PACKET</option>
                <option value="KG">KG</option>
                <option value="LITER">LITER</option>
              </select>
            </div>
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
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;

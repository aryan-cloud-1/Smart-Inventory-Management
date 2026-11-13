import React, { useState, useEffect } from 'react';
import { productApi, categoryApi, supplierApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductModal from '../components/ProductModal';
import StockMovementModal from '../components/StockMovementModal';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { 
  Search, 
  Plus, 
  Filter, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  ArrowLeftRight, 
  QrCode,
  Tag,
  CheckCircle2,
  Camera
} from 'lucide-react';

const ProductsPage = ({ initialFilterLowStock = false }) => {
  const { isManager } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(initialFilterLowStock);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, supRes] = await Promise.all([
        productApi.getProducts({ search: search.trim() || undefined, size: 100 }),
        categoryApi.getAll(),
        supplierApi.getAll(),
      ]);

      let items = prodRes.data?.content || prodRes.data || [];
      setProducts(items);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (err) {
      console.error('Failed to load products catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate "${name}"?`)) {
      try {
        await productApi.deleteProduct(id);
        fetchData();
      } catch (err) {
        alert(err?.message || 'Failed to delete product');
      }
    }
  };

  const handleOpenEdit = (p) => {
    setCurrentProduct(p);
    setIsProductModalOpen(true);
  };

  const handleOpenMovement = (p) => {
    setCurrentProduct(p);
    setIsMovementModalOpen(true);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && String(p.categoryId) !== String(selectedCategory)) {
      return false;
    }
    if (filterLowStockOnly && !p.isLowStock) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog & Warehouse</h1>
          <p className="text-sm text-slate-500">Manage SKUs, safety thresholds, prices, barcode tracking, and EOQ limits</p>
        </div>
        {isManager && (
          <button
            onClick={() => {
              setCurrentProduct(null);
              setIsProductModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-primary-600/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, name, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setIsScannerOpen(true)}
            title="Scan Barcode / QR with Camera"
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition shrink-0"
          >
            <Camera className="h-4 w-4 text-indigo-600" />
            <span className="hidden sm:inline">Scan Barcode</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
              filterLowStockOnly
                ? 'bg-rose-50 border-rose-400 text-rose-700'
                : 'border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className={`h-4 w-4 ${filterLowStockOnly ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Low Stock Alerts Only</span>
          </button>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">Loading catalog items...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No products match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">SKU / Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit Cost / Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">EOQ Suggestion</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                          <span>{p.sku}</span>
                          {p.barcode && (
                            <span className="flex items-center text-slate-400">
                              <QrCode className="h-3 w-3 mr-0.5" />
                              {p.barcode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          <Tag className="h-3 w-3 text-slate-400" />
                          <span>{p.categoryName || 'Uncategorized'}</span>
                        </span>
                      </td>

                      {/* Cost & Price */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">${Number(p.sellingPrice).toFixed(2)}</div>
                        <div className="text-xs text-slate-400">Cost: ${Number(p.unitCost).toFixed(2)}</div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-base font-bold ${
                            p.isLowStock ? 'text-rose-600' : 'text-slate-800'
                          }`}>
                            {p.currentStock}
                          </span>
                          <span className="text-xs text-slate-400">{p.unitOfMeasure}</span>
                          {p.isLowStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              LOW
                            </span>
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Min Threshold: {p.minThreshold}</div>
                      </td>

                      {/* EOQ Suggestion */}
                      <td className="py-3 px-4">
                        <div className="text-sm font-semibold text-indigo-700">
                          {p.suggestedEoq || p.reorderQuantity} units
                        </div>
                        <div className="text-[11px] text-slate-400">Optimized batch</div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                        {p.storageLocation}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenMovement(p)}
                          title="Log Stock In / Out"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition"
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                        </button>
                        {isManager && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Product"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              title="Deactivate"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={currentProduct}
        categories={categories}
        suppliers={suppliers}
        onSuccess={fetchData}
      />

      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        preselectedProduct={currentProduct}
        products={products}
        onSuccess={fetchData}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => {
          setSearch(code);
        }}
      />
    </div>
  );
};

export default ProductsPage;

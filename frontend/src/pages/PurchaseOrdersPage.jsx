import React, { useState, useEffect } from 'react';
import { purchaseOrderApi, supplierApi, productApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import { 
  ShoppingCart, 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  PackageCheck,
  AlertCircle
} from 'lucide-react';

const PurchaseOrdersPage = () => {
  const { isManager } = useAuth();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPoId, setExpandedPoId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, supRes, prodRes] = await Promise.all([
        purchaseOrderApi.getOrders({ status: statusFilter || undefined, size: 50 }),
        supplierApi.getAll(),
        productApi.getProducts({ size: 100 }),
      ]);
      setOrders(orderRes.data?.content || orderRes.data || []);
      setSuppliers(supRes.data || []);
      setProducts(prodRes.data?.content || prodRes.data || []);
    } catch (err) {
      console.error('Failed to load purchase orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    const confirmMsg = status === 'RECEIVED' 
      ? 'Mark this order as RECEIVED? This will automatically increment warehouse inventory and record stock-in movements for each product!'
      : `Update order status to ${status}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      await purchaseOrderApi.updateStatus(id, status);
      fetchData();
    } catch (err) {
      alert(err?.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="h-3 w-3" />
            <span>RECEIVED</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="h-3 w-3" />
            <span>APPROVED</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="h-3 w-3" />
            <span>CANCELLED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Orders (Procurement)</h1>
          <p className="text-sm text-slate-500">Generate, approve, and track vendor replenishments with automated receiving workflows</p>
        </div>
        {isManager && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-primary-600/30 transition"
          >
            <Plus className="h-4 w-4" />
            <span>New Purchase Order</span>
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex space-x-2">
          {[
            { id: '', label: 'All Orders' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'RECEIVED', label: 'Received' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
            Loading purchase orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
            No purchase orders found.
          </div>
        ) : (
          orders.map((po) => {
            const isExpanded = expandedPoId === po.id;
            const isPending = po.status === 'PENDING';
            const isApproved = po.status === 'APPROVED';

            return (
              <div
                key={po.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-slate-900 text-base">{po.poNumber}</span>
                        {getStatusBadge(po.status)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Supplier: <strong className="text-slate-800">{po.supplierName}</strong> | Created by: @{po.createdByUsername}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Valuation</div>
                      <div className="text-base font-bold text-slate-900">${Number(po.totalAmount).toFixed(2)}</div>
                    </div>

                    {isManager && (
                      <div className="flex items-center space-x-2">
                        {isPending && (
                          <button
                            onClick={() => handleUpdateStatus(po.id, 'APPROVED')}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition"
                          >
                            Approve
                          </button>
                        )}
                        {(isPending || isApproved) && (
                          <button
                            onClick={() => handleUpdateStatus(po.id, 'RECEIVED')}
                            disabled={actionLoading}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                          >
                            <PackageCheck className="h-3.5 w-3.5" />
                            <span>Receive Stock</span>
                          </button>
                        )}
                        {(isPending || isApproved) && (
                          <button
                            onClick={() => handleUpdateStatus(po.id, 'CANCELLED')}
                            disabled={actionLoading}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedPoId(isExpanded ? null : po.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Line Items Detail */}
                {isExpanded && (
                  <div className="bg-slate-50/70 p-4 border-t border-slate-100 text-xs">
                    <div className="font-semibold text-slate-700 uppercase tracking-wider mb-2">Order Line Items</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left bg-white rounded-lg border border-slate-200">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="py-2 px-3">SKU</th>
                            <th className="py-2 px-3">Product Name</th>
                            <th className="py-2 px-3 text-right">Quantity Ordered</th>
                            <th className="py-2 px-3 text-right">Quantity Received</th>
                            <th className="py-2 px-3 text-right">Unit Price</th>
                            <th className="py-2 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {po.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2 px-3 font-mono text-slate-500">{item.productSku}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{item.productName}</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900">{item.quantityOrdered}</td>
                              <td className="py-2 px-3 text-right text-emerald-600 font-semibold">{item.quantityReceived}</td>
                              <td className="py-2 px-3 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-bold">${Number(item.subtotal).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {po.notes && (
                      <div className="mt-2 text-slate-500">
                        <strong>Order Notes:</strong> {po.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <PurchaseOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        suppliers={suppliers}
        products={products}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default PurchaseOrdersPage;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_inventory_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized 401s
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('smart_inventory_token');
      localStorage.removeItem('smart_inventory_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getBySku: (sku) => api.get(`/products/sku/${sku}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  getLowStock: () => api.get('/products/low-stock'),
  getEoqSuggestions: () => api.get('/products/reorder-suggestions'),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const transactionApi = {
  logMovement: (data) => api.post('/transactions/movement', data),
  getByProduct: (productId, params) => api.get(`/transactions/product/${productId}`, { params }),
  getRecent: () => api.get('/transactions/recent'),
};

export const purchaseOrderApi = {
  getOrders: (params) => api.get('/purchase-orders', { params }),
  getOrderById: (id) => api.get(`/purchase-orders/${id}`),
  createOrder: (data) => api.post('/purchase-orders', data),
  updateStatus: (id, status) => api.patch(`/purchase-orders/${id}/status?status=${status}`),
  getRecent: () => api.get('/purchase-orders/recent'),
};

export const analyticsApi = {
  getDashboardSummary: () => api.get('/analytics/dashboard'),
  getFastMoving: (days = 30, limit = 5) => api.get(`/analytics/fast-moving?days=${days}&limit=${limit}`),
  getCategories: () => api.get('/analytics/categories'),
  getTrends: (days = 30) => api.get(`/analytics/trends?days=${days}`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
};

export const supplierApi = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data),
};

export const reportApi = {
  downloadBlob: async (endpoint, defaultFilename) => {
    try {
      const token = localStorage.getItem('smart_inventory_token');
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        throw new Error(`Report generation failed with HTTP status ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download report: ' + err.message);
    }
  },
  downloadInventoryCsv: () => {
    reportApi.downloadBlob('/reports/inventory/csv', `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
  },
  downloadInventoryPdf: () => {
    reportApi.downloadBlob('/reports/inventory/pdf', `inventory_valuation_${new Date().toISOString().split('T')[0]}.pdf`);
  },
  downloadTransactionsCsv: () => {
    reportApi.downloadBlob('/reports/transactions/csv', `transactions_audit_${new Date().toISOString().split('T')[0]}.csv`);
  },
};

export default api;

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Receipts API
export const receiptsAPI = {
  getAll: () => api.get('/receipts'),
  getById: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data),
  addItem: (receiptId, data) => api.post(`/receipts/${receiptId}/item`, data),
  validate: (receiptId) => api.post(`/receipts/${receiptId}/validate`),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
};

// Deliveries API
export const deliveriesAPI = {
  getAll: () => api.get('/deliveries'),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  addItem: (deliveryId, data) => api.post(`/deliveries/${deliveryId}/item`, data),
  validate: (deliveryId) => api.post(`/deliveries/${deliveryId}/validate`),
};

export default api;

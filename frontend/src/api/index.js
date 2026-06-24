import axios from 'axios';
import { APP_CONFIG } from '../config';
import { getPendingOrders, removePendingOrder, savePendingOrder } from './offlineStore';

const api = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.baseURL
      ? `${error.config.baseURL}${error.config.url}`
      : error.config?.url;
    console.error('[API Error]', {
      url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export async function fetchCategories() {
  const { data } = await api.get('/categories/');
  return data.results ?? data;
}

export async function fetchProducts(params = {}) {
  const { data } = await api.get('/products/', { params });
  return data.results ?? data;
}

export async function fetchOrders() {
  const { data } = await api.get('/orders/');
  return data.results ?? data;
}

export async function fetchOrder(orderId) {
  const { data } = await api.get(`/orders/${orderId}/`);
  return data;
}

export async function createOrder(orderData) {
  try {
    const { data } = await api.post('/orders/', orderData);
    return { success: true, data, offline: false };
  } catch (error) {
    if (!navigator.onLine) {
      const pending = await savePendingOrder(orderData);
      return { success: true, data: pending, offline: true };
    }
    throw error;
  }
}

export async function syncPendingOrders() {
  const pending = await getPendingOrders();
  const results = [];

  for (const order of pending) {
    try {
      const { data } = await api.post('/orders/', order.payload);
      await removePendingOrder(order.id);
      results.push({ id: order.id, success: true, data });
    } catch {
      results.push({ id: order.id, success: false });
    }
  }

  return results;
}

export async function updateOrderStatus(orderId, status) {
  const { data } = await api.patch(`/orders/${orderId}/status/`, { status });
  return data;
}

export async function createProduct(formData) {
  const { data } = await api.post('/products/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProduct(id, formData) {
  const { data } = await api.patch(`/products/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}/`);
}

export async function fetchAlerts(params = {}) {
  const { data } = await api.get('/alerts/', { params });
  return data.results ?? data;
}

export async function createAlert(payload) {
  const { data } = await api.post('/alerts/', payload);
  return data;
}

export async function markAlertRead(alertId) {
  const { data } = await api.patch(`/alerts/${alertId}/read/`);
  return data;
}

export default api;

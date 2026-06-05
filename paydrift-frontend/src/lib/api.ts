import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('paydrift_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('paydrift_token');
      localStorage.removeItem('paydrift_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (email: string, name?: string) =>
    api.post('/auth/register', { email, name }),
  login: (email: string) =>
    api.post('/auth/login', { email }),
  me: () =>
    api.get('/auth/me'),
};

// ── Clients ────────────────────────────────────────────────────────────────
export const clientsAPI = {
  list: () => api.get('/clients'),
  create: (data: { name: string; email: string; company?: string; notes?: string }) =>
    api.post('/clients', data),
  update: (id: string, data: Partial<{ name: string; email: string; company: string; notes: string }>) =>
    api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// ── Invoices ───────────────────────────────────────────────────────────────
export const invoicesAPI = {
  list: (params?: { status?: string; client_id?: string }) =>
    api.get('/invoices', { params }),
  create: (data: { client_id: string; amount: number; currency?: string; description: string; due_date: string }) =>
    api.post('/invoices', data),
  update: (id: string, data: Partial<{ amount: number; description: string; due_date: string; status: string }>) =>
    api.put(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  markPaid: (id: string) => api.post(`/invoices/${id}/mark-paid`),
  sendNow: (id: string) => api.post(`/invoices/${id}/send-now`),
};

// ── Stripe ────────────────────────────────────────────────────────────────
export const stripeAPI = {
  createCheckout: (plan: 'pro' | 'agency') =>
    api.post('/stripe/create-checkout', { plan }),
  portal: (returnUrl?: string) =>
    api.post('/stripe/portal', { return_url: returnUrl }),
};

// ── Dashboard ─────────────────────────────────────────────────────────────
export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
};

export default api;
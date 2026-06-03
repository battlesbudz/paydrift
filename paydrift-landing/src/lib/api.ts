const API_BASE = '/app';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('paydrift_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'API error');
  return data;
}

// Auth
export const auth = {
  register: (email: string, name?: string) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ email, name }) }),
  login: (email: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),
  verify: (token: string) =>
    apiFetch(`/auth/verify?token=${encodeURIComponent(token)}`, { method: 'POST' }),
  me: () => apiFetch('/auth/me'),
};

// Dashboard
export const dashboard = {
  stats: () => apiFetch('/dashboard/stats'),
};

// Clients
export const clients = {
  list: () => apiFetch('/clients'),
  create: (data: { name: string; email: string; company?: string; notes?: string }) =>
    apiFetch('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; email?: string; company?: string; notes?: string }) =>
    apiFetch(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/clients/${id}`, { method: 'DELETE' }),
};

// Invoices
export const invoices = {
  list: (params?: { status?: string; client_id?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch(`/invoices${qs ? `?${qs}` : ''}`);
  },
  create: (data: { client_id: string; amount: number; currency: string; description: string; due_date: string }) =>
    apiFetch('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) =>
    apiFetch(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/invoices/${id}`, { method: 'DELETE' }),
  markPaid: (id: string) =>
    apiFetch(`/invoices/${id}/mark-paid`, { method: 'POST' }),
  sendNow: (id: string) =>
    apiFetch(`/invoices/${id}/send-now`, { method: 'POST' }),
};

// Stripe
export const stripe = {
  checkout: (plan: string) =>
    apiFetch('/stripe/create-checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
  portal: (return_url?: string) =>
    apiFetch('/stripe/portal', { method: 'POST', body: JSON.stringify({ return_url }) }),
};

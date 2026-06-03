import { useState, useEffect } from 'react';
import { Plus, X, CheckCircle, Clock, AlertTriangle, Send, FileText } from 'lucide-react';
import { invoicesAPI, clientsAPI } from '../lib/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Invoice {
  id: string;
  client_id: string;
  client_name?: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
}

type FilterTab = 'all' | 'pending' | 'overdue' | 'paid';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client_id: '', amount: '', description: '', due_date: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    Promise.all([invoicesAPI.list(), clientsAPI.list()])
      .then(([invRes, cliRes]) => {
        setInvoices(invRes.data);
        setClients(cliRes.data);
      })
      .catch(() => setToast({ message: 'Failed to load data', type: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleOpenModal = () => {
    setForm({ client_id: clients[0]?.id || '', amount: '', description: '', due_date: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm({ client_id: '', amount: '', description: '', due_date: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.amount || !form.description || !form.due_date) return;

    setSaving(true);
    try {
      const amountInCents = Math.round(parseFloat(form.amount) * 100);
      await invoicesAPI.create({
        client_id: form.client_id,
        amount: amountInCents,
        description: form.description,
        due_date: form.due_date,
      });
      setToast({ message: 'Invoice created', type: 'success' });
      handleCloseModal();
      loadData();
    } catch {
      setToast({ message: 'Failed to create invoice', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setActionLoading(id);
    try {
      await invoicesAPI.markPaid(id);
      setToast({ message: 'Invoice marked as paid', type: 'success' });
      loadData();
    } catch {
      setToast({ message: 'Failed to mark invoice as paid', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendReminder = async (id: string) => {
    setActionLoading(id);
    try {
      await invoicesAPI.sendNow(id);
      setToast({ message: 'Reminder sent', type: 'success' });
    } catch {
      setToast({ message: 'Failed to send reminder', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: invoices.length },
    { key: 'pending', label: 'Pending', count: invoices.filter((i) => i.status === 'pending').length },
    { key: 'overdue', label: 'Overdue', count: invoices.filter((i) => i.status === 'overdue').length },
    { key: 'paid', label: 'Paid', count: invoices.filter((i) => i.status === 'paid').length },
  ];

  const statusBadge = (status: Invoice['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
    };
    const icons = {
      pending: Clock,
      paid: CheckCircle,
      overdue: AlertTriangle,
    };
    const Icon = icons[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B6AF0] text-white rounded-lg font-medium hover:bg-[#4A5ADF] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      <div className="mb-6 flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-gray-400">{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
          ))}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No invoices found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Description</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Client</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Due date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{invoice.description}</td>
                  <td className="p-4 text-gray-600">{invoice.client_name || invoice.client_id}</td>
                  <td className="p-4 font-mono font-medium text-gray-900">{formatAmount(invoice.amount)}</td>
                  <td className="p-4 text-gray-600">{formatDate(invoice.due_date)}</td>
                  <td className="p-4">{statusBadge(invoice.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          disabled={actionLoading === invoice.id}
                          className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Mark as paid"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => handleSendReminder(invoice.id)}
                          disabled={actionLoading === invoice.id}
                          className="px-3 py-1.5 text-sm font-medium text-[#5B6AF0] hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Send reminder"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">New Invoice</h2>
            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Web development services"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#5B6AF0] text-white rounded-lg font-medium hover:bg-[#4A5ADF] transition-colors disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
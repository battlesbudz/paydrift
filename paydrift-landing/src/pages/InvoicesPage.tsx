import { useState, useEffect } from 'react';
import { Plus, X, CheckCircle, Clock, AlertTriangle, Send, FileText, Edit2, Trash2 } from 'lucide-react';
import { invoices, clients } from '../lib/api';

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
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  reminders_sent?: number;
  currency?: string;
}

type FilterTab = 'all' | 'pending' | 'overdue' | 'paid';

export function InvoicesPage() {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [clientList, setClientList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ 
    client_id: '', 
    amount: '', 
    currency: 'USD',
    description: '', 
    due_date: '' 
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, cliData] = await Promise.all([
        invoices.list(),
        clients.list()
      ]);
      setInvoiceList(Array.isArray(invData) ? invData : (invData.invoices || []));
      setClientList(Array.isArray(cliData) ? cliData : (cliData.clients || []));
    } catch {
      setToast({ message: 'Failed to load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setForm({
        client_id: invoice.client_id,
        amount: (invoice.amount / 100).toFixed(2),
        currency: invoice.currency || 'USD',
        description: invoice.description,
        due_date: invoice.due_date,
      });
    } else {
      setEditingInvoice(null);
      setForm({ client_id: clientList[0]?.id || '', amount: '', currency: 'USD', description: '', due_date: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setForm({ client_id: '', amount: '', currency: 'USD', description: '', due_date: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.amount || !form.description || !form.due_date) return;

    setSaving(true);
    try {
      const amountInCents = Math.round(parseFloat(form.amount) * 100);
      const data = {
        client_id: form.client_id,
        amount: amountInCents,
        currency: form.currency,
        description: form.description,
        due_date: form.due_date,
      };

      if (editingInvoice) {
        await invoices.update(editingInvoice.id, data);
        setToast({ message: 'Invoice updated', type: 'success' });
      } else {
        await invoices.create(data);
        setToast({ message: 'Invoice created', type: 'success' });
      }
      handleCloseModal();
      loadData();
    } catch {
      setToast({ message: 'Failed to save invoice', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setActionLoading(id);
    try {
      await invoices.markPaid(id);
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
      await invoices.sendNow(id);
      setToast({ message: 'Reminder sent', type: 'success' });
      loadData();
    } catch {
      setToast({ message: 'Failed to send reminder', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await invoices.delete(id);
      setDeleteConfirm(null);
      setToast({ message: 'Invoice deleted', type: 'success' });
      loadData();
    } catch {
      setToast({ message: 'Failed to delete invoice', type: 'error' });
    }
  };

  const filteredInvoices = invoiceList.filter((inv) => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: invoiceList.length },
    { key: 'pending', label: 'Pending', count: invoiceList.filter((i) => i.status === 'pending').length },
    { key: 'overdue', label: 'Overdue', count: invoiceList.filter((i) => i.status === 'overdue').length },
    { key: 'paid', label: 'Paid', count: invoiceList.filter((i) => i.status === 'paid').length },
  ];

  const statusBadge = (status: Invoice['status']) => {
    const styles: Record<string, string> = {
      pending: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    const icons: Record<string, any> = {
      pending: Clock,
      paid: CheckCircle,
      overdue: AlertTriangle,
      cancelled: X,
    };
    const Icon = icons[status] || Clock;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage your invoices</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Invoice
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-1 bg-white border border-gray-200 p-1 rounded-xl w-fit shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-[#5B6AF0] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${
              filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-24 h-5 bg-gray-200 rounded" />
                <div className="w-32 h-5 bg-gray-200 rounded" />
                <div className="w-20 h-5 bg-gray-200 rounded" />
                <div className="w-24 h-5 bg-gray-200 rounded" />
                <div className="w-20 h-6 bg-gray-200 rounded-full" />
                <div className="ml-auto flex gap-2">
                  <div className="w-16 h-8 bg-gray-200 rounded" />
                  <div className="w-20 h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[#F8F9FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No invoices found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all' 
              ? 'Create your first invoice to get started' 
              : `No ${filter} invoices at the moment`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Invoice
            </button>
          )}
        </div>
      ) : (
        /* Invoice Table */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Description</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Due Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Reminders</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{invoice.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{invoice.client_name || invoice.client_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-semibold text-gray-900">{formatAmount(invoice.amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{formatDate(invoice.due_date)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {statusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-gray-500 text-sm">
                        <Send className="w-4 h-4 mr-1" />
                        {invoice.reminders_sent || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => handleMarkPaid(invoice.id)}
                              disabled={actionLoading === invoice.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Mark as paid"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleSendReminder(invoice.id)}
                              disabled={actionLoading === invoice.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Send reminder"
                            >
                              <Send className="w-4 h-4" />
                              Remind
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenModal(invoice)}
                          className="p-2 text-gray-400 hover:text-[#5B6AF0] hover:bg-[#F8F9FF] rounded-lg transition-colors"
                          title="Edit invoice"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(invoice.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors"
                >
                  <option value="">Select a client</option>
                  {clientList.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (USD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Web development services"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-[#5B6AF0] hover:bg-[#3D4FD1] disabled:bg-[#5B6AF0]/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    editingInvoice ? 'Save Changes' : 'Create Invoice'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Invoice?</h3>
            <p className="text-gray-500 text-center mb-6">
              This action cannot be undone. The invoice will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-medium">{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
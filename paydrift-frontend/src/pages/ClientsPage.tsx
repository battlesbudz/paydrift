import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ChevronDown, X, User, AlertTriangle } from 'lucide-react';
import { clientsAPI } from '../lib/api';
import { useAuth } from '../stores/auth';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  notes?: string;
  invoice_count?: number;
  outstanding_amount?: number;
}

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isFreePlan = user?.plan === 'free';

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    clientsAPI.list()
      .then((res) => setClients(res.data))
      .catch(() => setToast({ message: 'Failed to load clients', type: 'error' }))
      .finally(() => setLoading(false));
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setForm({ name: client.name, email: client.email, company: client.company || '', notes: client.notes || '' });
    } else {
      setEditingClient(null);
      setForm({ name: '', email: '', company: '', notes: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setForm({ name: '', email: '', company: '', notes: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFreePlan && !editingClient && clients.length >= 1) {
      setToast({ message: 'Free plan limited to 1 client. Upgrade to add more.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, form);
        setToast({ message: 'Client updated', type: 'success' });
      } else {
        await clientsAPI.create(form);
        setToast({ message: 'Client created', type: 'success' });
      }
      handleCloseModal();
      loadClients();
    } catch {
      setToast({ message: 'Failed to save client', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    try {
      await clientsAPI.delete(id);
      setToast({ message: 'Client deleted', type: 'success' });
      loadClients();
    } catch {
      setToast({ message: 'Failed to delete client', type: 'error' });
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => handleOpenModal()}
          disabled={isFreePlan && clients.length >= 1}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B6AF0] text-white rounded-lg font-medium hover:bg-[#4A5ADF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {isFreePlan && clients.length >= 1 && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <p className="text-sm text-indigo-800">
            You have reached your limit of 1 client on the free plan.{' '}
            <a href="/settings" className="font-medium underline">
              Upgrade to Pro
            </a>{' '}
            for unlimited clients.
          </p>
        </div>
      )}

      <div className="mb-6 relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none"
        />
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
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No clients yet</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 text-[#5B6AF0] font-medium hover:underline"
          >
            Add your first client
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#5B6AF0]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {client.company && (
                      <span className="text-sm text-gray-500">{client.company}</span>
                    )}
                    {client.invoice_count !== undefined && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {client.invoice_count} invoices
                      </span>
                    )}
                    {client.outstanding_amount !== undefined && client.outstanding_amount > 0 && (
                      <span className="font-mono text-sm font-medium text-yellow-600">
                        ${(client.outstanding_amount / 100).toFixed(2)}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedId === client.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
              {expandedId === client.id && (
                <div className="px-6 pb-6 pt-0 border-t border-gray-100">
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {client.notes && <p className="mb-2">{client.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(client)}
                        className="px-3 py-1.5 text-sm font-medium text-[#5B6AF0] hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingClient ? 'Edit client' : 'Add client'}
            </h2>
            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none resize-none"
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
                {saving ? 'Saving...' : editingClient ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
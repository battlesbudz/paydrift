import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, Mail, Building, FileText, AlertCircle } from 'lucide-react';
import { clients } from '../lib/api';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  notes?: string;
  outstanding_amount?: number;
  invoice_count?: number;
  created_at?: string;
}

interface ClientFormData {
  name: string;
  email: string;
  company: string;
  notes: string;
}

const initialFormData: ClientFormData = {
  name: '',
  email: '',
  company: '',
  notes: '',
};

export function ClientsPage() {
  const [clientList, setClientList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await clients.list();
      setClientList(data.clients || data);
    } catch (err: any) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        company: client.company || '',
        notes: client.notes || '',
      });
    } else {
      setEditingClient(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingClient) {
        await clients.update(editingClient.id, formData);
      } else {
        await clients.create(formData);
      }
      closeModal();
      fetchClients();
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await clients.delete(id);
      setDeleteConfirm(null);
      fetchClients();
    } catch (err: any) {
      setError(err.message || 'Failed to delete client');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client list</p>
        </div>
        <button
          onClick={() => openModal()}
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-[#5B6AF0]/20 border-t-[#5B6AF0] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading clients...</p>
          </div>
        ) : clientList.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#F8F9FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients yet</h3>
            <p className="text-gray-500 mb-6">Add your first client to get started</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Company</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Outstanding</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Invoices</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clientList.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#5B6AF0]/10 rounded-full flex items-center justify-center">
                          <span className="text-[#5B6AF0] font-semibold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{client.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{client.company || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(client.outstanding_amount || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-gray-600">
                        <FileText className="w-4 h-4" />
                        {client.invoice_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(client)}
                          className="p-2 text-gray-400 hover:text-[#5B6AF0] hover:bg-[#F8F9FF] rounded-lg transition-colors"
                          title="Edit client"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(client.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete client"
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Inc."
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this client..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
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
                    editingClient ? 'Save Changes' : 'Add Client'
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
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Client?</h3>
            <p className="text-gray-500 text-center mb-6">
              This action cannot be undone. The client and all associated data will be permanently deleted.
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
    </div>
  );
}
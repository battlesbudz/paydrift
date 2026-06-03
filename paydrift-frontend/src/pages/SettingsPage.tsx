import { useState } from 'react';
import { User, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '../stores/auth';
import { stripeAPI } from '../lib/api';
import Toast from '../components/Toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: 'pro' | 'agency') => {
    setLoading(plan);
    try {
      const res = await stripeAPI.createCheckout(plan);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch {
      setToast({ message: 'Failed to start checkout. Please try again.', type: 'error' });
    } finally {
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading('portal');
    try {
      const res = await stripeAPI.portal(window.location.href);
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch {
      setToast({ message: 'Failed to open billing portal. Please try again.', type: 'error' });
    } finally {
      setLoading(null);
    }
  };

  const planBadge = (plan: string) => {
    const styles: Record<string, string> = {
      free: 'bg-gray-100 text-gray-700',
      pro: 'bg-indigo-100 text-indigo-700',
      agency: 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[plan] || styles.free}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-[#5B6AF0]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
            <p className="text-gray-900">{user?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-gray-900">{user?.email || 'Not set'}</p>
          </div>
        </div>
      </section>

      {/* Plan Section */}
      <section className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#5B6AF0]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Plan</h2>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">Current plan</label>
          <div className="flex items-center gap-3">
            {planBadge(user?.plan || 'free')}
            <span className="text-gray-600">
              {user?.plan === 'free' && '1 client, 5 invoices'}
              {user?.plan === 'pro' && '25 clients, unlimited invoices'}
              {user?.plan === 'agency' && 'Unlimited everything'}
            </span>
          </div>
        </div>

        {user?.plan !== 'pro' && (
          <div className="mb-4">
            <button
              onClick={() => handleUpgrade('pro')}
              disabled={loading === 'pro'}
              className="w-full py-3 px-6 bg-[#5B6AF0] text-white rounded-lg font-medium hover:bg-[#4A5ADF] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'pro' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade to Pro ($19/mo)'
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2 text-center">25 clients, unlimited invoices, priority support</p>
          </div>
        )}

        {user?.plan !== 'agency' && (
          <div>
            <button
              onClick={() => handleUpgrade('agency')}
              disabled={loading === 'agency'}
              className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'agency' ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade to Agency ($49/mo)'
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2 text-center">Everything in Pro, plus white-label emails and API access</p>
          </div>
        )}

        {(user?.plan === 'pro' || user?.plan === 'agency') && (
          <button
            onClick={handleManageBilling}
            disabled={loading === 'portal'}
            className="mt-4 w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading === 'portal' ? 'Opening...' : 'Manage billing'}
          </button>
        )}
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Danger zone</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Delete account</h3>
              <p className="text-sm text-red-700 mt-1">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                className="mt-3 px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                disabled
                title="Contact support to delete your account"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
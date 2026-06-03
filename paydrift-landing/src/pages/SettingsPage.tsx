import { useState, useEffect } from 'react';
import { User, CreditCard, Crown, Zap, Building2, Check, X } from 'lucide-react';
import { getUser } from '../lib/auth';
import { stripe } from '../lib/api';

interface UserData {
  id: string;
  email: string;
  name?: string;
  plan?: string;
}

export function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);

  const handleUpgrade = async (plan: 'pro' | 'agency') => {
    setLoading(plan);
    try {
      const res = await stripe.checkout(plan);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setToast({ message: 'Failed to get checkout URL', type: 'error' });
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
      const res = await stripe.portal(window.location.href);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setToast({ message: 'Failed to get portal URL', type: 'error' });
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${styles[plan] || styles.free}`}>
        {plan === 'pro' && <Crown className="w-3.5 h-3.5" />}
        {plan === 'agency' && <Building2 className="w-3.5 h-3.5" />}
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      period: '/mo',
      description: 'Perfect for growing businesses',
      features: [
        '25 clients',
        'Unlimited invoices',
        'Priority support',
        'Custom reminders',
        'Analytics dashboard',
      ],
      cta: user?.plan === 'pro' ? 'Current Plan' : 'Get Pro',
    },
    {
      id: 'agency',
      name: 'Agency',
      price: '$49',
      period: '/mo',
      description: 'For agencies and larger teams',
      features: [
        'Unlimited clients',
        'Unlimited invoices',
        'White-label emails',
        'API access',
        'Dedicated support',
        'Advanced analytics',
      ],
      cta: user?.plan === 'agency' ? 'Current Plan' : 'Get Agency',
    },
  ];

  const isSubscribed = user?.plan === 'pro' || user?.plan === 'agency';

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Profile Section */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-[#5B6AF0]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
            <p className="text-gray-900 font-medium">{user?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-gray-900">{user?.email || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Current Plan</label>
            <div className="mt-1">
              {planBadge(user?.plan || 'free')}
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade to Pro Section */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#5B6AF0]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-sm text-gray-500">Choose the plan that works best for you</p>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = user?.plan === plan.id;
            const isLoading = loading === plan.id;

            return (
              <div 
                key={plan.id}
                className={`relative border rounded-xl p-6 transition-all ${
                  isCurrentPlan 
                    ? 'border-[#5B6AF0] bg-[#F8F9FF]' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#5B6AF0] text-white text-xs font-medium px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isCurrentPlan && handleUpgrade(plan.id as 'pro' | 'agency')}
                  disabled={isCurrentPlan || isLoading}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    plan.id === 'pro'
                      ? 'bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  } ${
                    isCurrentPlan 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : ''
                  } ${isLoading ? 'opacity-50' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Manage Billing Button */}
        {isSubscribed && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={handleManageBilling}
              disabled={loading === 'portal'}
              className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'portal' ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-300/30 border-t-gray-600 rounded-full animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Manage Billing
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Plan Comparison Section */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Feature</th>
                <th className="text-center py-3 text-sm font-medium text-gray-500">Free</th>
                <th className="text-center py-3 text-sm font-medium text-gray-500">Pro</th>
                <th className="text-center py-3 text-sm font-medium text-gray-500">Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 text-sm text-gray-600">Clients</td>
                <td className="py-3 text-sm text-center text-gray-900">1</td>
                <td className="py-3 text-sm text-center text-gray-900">25</td>
                <td className="py-3 text-sm text-center text-gray-900 font-medium">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-600">Invoices</td>
                <td className="py-3 text-sm text-center text-gray-900">5</td>
                <td className="py-3 text-sm text-center text-gray-900 font-medium">Unlimited</td>
                <td className="py-3 text-sm text-center text-gray-900 font-medium">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-600">Automated reminders</td>
                <td className="py-3 text-sm text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-600">Analytics dashboard</td>
                <td className="py-3 text-sm text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-600">White-label emails</td>
                <td className="py-3 text-sm text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-600">API access</td>
                <td className="py-3 text-sm text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-gray-600">Priority support</td>
                <td className="py-3 text-sm text-center"><X className="w-4 h-4 text-gray-300 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                <td className="py-3 text-sm text-center"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50 ${
          toast.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <X className="w-5 h-5 text-red-600" />
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
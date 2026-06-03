import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Send } from 'lucide-react';
import { authAPI } from '../lib/api';
import Toast from '../components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authAPI.login(email);
      setSent(true);
    } catch {
      setToast({ message: 'Failed to send magic link. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#5B6AF0] rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">PayDrift</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to PayDrift</h1>
          <p className="text-gray-600 mt-2">Enter your email to receive a magic link</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email!</h2>
              <p className="text-gray-600">
                We sent a magic link to <strong>{email}</strong>.
                <br />
                Click it to sign in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-[#5B6AF0] text-white rounded-lg font-medium hover:bg-[#4A5ADF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-600 mt-6">
          Do not have an account?{' '}
          <Link to="/register" className="text-[#5B6AF0] font-medium hover:underline">
            Get started free
          </Link>
        </p>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
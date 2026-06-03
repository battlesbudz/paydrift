import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useAuth } from '../stores/auth';
import Toast from '../components/Toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    try {
      const res = await authAPI.register(email, name);
      const { user, token } = res.data;
      login(user, token);
      navigate('/dashboard');
    } catch {
      setToast({ message: 'Failed to create account. Please try again.', type: 'error' });
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
          <h1 className="text-2xl font-bold text-gray-900">Create your PayDrift account</h1>
          <p className="text-gray-600 mt-2">Start getting paid faster today</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-transparent outline-none transition-shadow"
              />
            </div>
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
              {loading ? 'Creating account...' : 'Get started free'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#5B6AF0] font-medium hover:underline">
            Sign in
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
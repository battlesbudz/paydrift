import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, DollarSign } from 'lucide-react';
import { auth } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.login(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-[#5B6AF0] rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">PayDrift</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h1>
          <p className="text-gray-600 mb-6">Enter your email to receive a magic link</p>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600">
                We've sent a magic link to <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Click the link in the email to sign in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B6AF0] focus:border-[#5B6AF0] outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5B6AF0] hover:bg-[#3D4FD1] disabled:bg-[#5B6AF0]/50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send magic link'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-[#5B6AF0] hover:underline font-medium">
              Create one
            </Link>
          </div>
        </div>

        {/* Back link */}
        <Link
          to="/"
          className="flex items-center gap-2 justify-center mt-6 text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

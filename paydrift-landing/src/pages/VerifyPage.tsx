import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, DollarSign } from 'lucide-react';
import { auth } from '../lib/api';
import { saveToken } from '../lib/auth';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided');
      return;
    }

    const verify = async () => {
      try {
        const data = await auth.verify(token);
        saveToken(data.token, data.user);
        setStatus('success');
        // Short delay before navigation to show success message
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to verify token');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-[#5B6AF0] rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">PayDrift</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-[#5B6AF0]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-[#5B6AF0] animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your account</h2>
              <p className="text-gray-600">Please wait while we verify your magic link...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome back!</h2>
              <p className="text-gray-600">Your account has been verified. Redirecting you to the dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h2>
              <p className="text-red-600 mb-6">{errorMessage}</p>
              <a
                href="/login"
                className="inline-block bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Try again
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

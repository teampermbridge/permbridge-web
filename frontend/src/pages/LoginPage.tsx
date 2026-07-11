import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PermBridge</h1>
          <p className="text-gray-600">
            Intelligently manage permissions — Profile or Permission Set based
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Feature Highlights</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Profile 2 Permission Set Converter</li>
              <li>✓ Permission Set Summarizer</li>
              <li>✓ Permission Matrix X-Ray</li>
            </ul>
          </div>

          <button
            onClick={login}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            {isLoading ? 'Redirecting to Salesforce...' : 'Login with Salesforce'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Powered by Salesforce OAuth • Secure connection
          </p>
        </div>
      </div>
    </div>
  );
}

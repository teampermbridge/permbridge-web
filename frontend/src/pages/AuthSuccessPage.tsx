import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth } from '../api/endpoints';

export function AuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setError = useAuthStore((state) => state.setError);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No token received');
      navigate('/login');
      return;
    }

    // Save token to localStorage
    localStorage.setItem('auth_token', token);
    setToken(token);

    // Fetch user info
    auth
      .getCurrentUser()
      .then((res) => {
        setUser(res.data);
        navigate('/');
      })
      .catch((err) => {
        console.error('Failed to fetch user:', err);
        setError('Failed to load user info');
        navigate('/login');
      });
  }, [searchParams, setToken, setUser, setError, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <p className="mt-4 text-gray-600">Completing login...</p>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { auth } from '../api/endpoints';

export function useAuth() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);

  const isAuthenticated = !!token && !!user;

  // Fetch user info if token exists but user is not loaded
  useEffect(() => {
    if (token && !user) {
      setLoading(true);
      auth
        .getCurrentUser()
        .then((res) => setUser(res.data))
        .catch((err) => {
          console.error('Failed to fetch user info:', err);
          setError('Failed to load user info');
        })
        .finally(() => setLoading(false));
    }
  }, [token, user, setUser, setLoading, setError]);

  const login = async () => {
    try {
      setLoading(true);
      const response = await auth.getLoginUrl();
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to initiate login');
      setLoading(false);
    }
  };

  const logout = () => {
    useAuthStore.getState().logout();
    localStorage.removeItem('auth_token');
  };

  return {
    isAuthenticated,
    isLoading,
    token,
    user,
    login,
    logout,
  };
}

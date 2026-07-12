import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Lock, Mail, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react';
import client from '../api/client';

export function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setOrganization = useAuthStore((state) => state.setOrganization);
  const setOrganizations = useAuthStore((state) => state.setOrganizations);
  const setError = useAuthStore((state) => state.setError);
  const setLoading = useAuthStore((state) => state.setLoading);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMode, setLoginMode] = useState<'email' | 'salesforce'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await client.post('/auth/login', { email, password });
      const { token, user, organizations } = response.data;

      localStorage.setItem('auth_token', token);
      setToken(token);
      setUser(user);
      setOrganizations(organizations);

      if (organizations.length > 0) {
        setOrganization(organizations[0]);
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSalesforceLogin = async () => {
    try {
      setLoading(true);
      const response = await client.get('/auth/salesforce/login');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Salesforce login error:', error);
      setError('Failed to initiate Salesforce login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left - Hero */}
        <div className="lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 lg:py-0">
          <div className="max-w-md">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">PermBridge</h1>
              </div>
              <p className="text-slate-400 text-sm">Enterprise Permission Management</p>
            </div>

            <div className="mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Master Your Permissions
              </h2>
              <p className="text-slate-300 text-lg">
                Convert, analyze, and visualize Salesforce permissions with AI-powered intelligence.
              </p>
            </div>

            <div className="space-y-4 mb-12">
              {[
                { icon: Zap, label: 'AI-Powered Conversion', desc: 'Intelligent permission grouping' },
                { icon: Shield, label: 'Permission Analysis', desc: '360° permission insights' },
                { icon: BarChart3, label: 'Visual Matrix', desc: 'Heatmap visualizations' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <Icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{item.label}</h3>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
              <p className="text-slate-400 mb-8">Sign in to your account</p>

              {/* Mode Tabs */}
              <div className="flex gap-2 mb-6 bg-slate-900/50 p-1 rounded-lg">
                <button
                  onClick={() => setLoginMode('email')}
                  className={`flex-1 py-2 px-3 rounded font-semibold text-sm transition ${
                    loginMode === 'email'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Email
                </button>
                <button
                  onClick={() => setLoginMode('salesforce')}
                  className={`flex-1 py-2 px-3 rounded font-semibold text-sm transition ${
                    loginMode === 'salesforce'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Salesforce
                </button>
              </div>

              {/* Email Login */}
              {loginMode === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:border-blue-500 outline-none transition"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Salesforce Login */}
              {loginMode === 'salesforce' && (
                <button
                  onClick={handleSalesforceLogin}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" />
                      </svg>
                      Login with Salesforce
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-slate-800/50 text-slate-400">New to PermBridge?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link
                to="/register"
                className="w-full block text-center px-4 py-3 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700/50 transition"
              >
                Create Account
              </Link>

              <p className="text-center text-xs text-slate-500 mt-6">
                Secure OAuth 2.0 Authentication
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

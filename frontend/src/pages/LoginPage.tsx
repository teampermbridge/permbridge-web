import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left side - Hero section */}
        <div className="lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 py-12 lg:py-0">
          <div className="max-w-md">
            {/* Logo/Brand */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">PermBridge</h1>
              </div>
              <p className="text-slate-400 text-sm">Enterprise Permission Management</p>
            </div>

            {/* Hero text */}
            <div className="mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Master Your Permissions
              </h2>
              <p className="text-slate-300 text-lg">
                Convert, analyze, and visualize Salesforce permissions with AI-powered intelligence.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-4 mb-12">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI-Powered Conversion</h3>
                  <p className="text-slate-400 text-sm">Convert Profiles to Permission Sets with intelligent grouping</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Permission Analysis</h3>
                  <p className="text-slate-400 text-sm">Get 360° views of any permission set with detailed breakdowns</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Visual Matrix</h3>
                  <p className="text-slate-400 text-sm">Compare permissions across profiles with heatmap visualizations</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-700">
              <div>
                <div className="text-2xl font-bold text-white">100+</div>
                <p className="text-slate-400 text-sm">API Queries</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1s</div>
                <p className="text-slate-400 text-sm">Avg Response</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="lg:w-1/2 flex items-center justify-center px-6 sm:px-12 py-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-2">Get Started</h3>
              <p className="text-slate-400 mb-8">Sign in with your Salesforce account to continue</p>

              {/* Login button */}
              <button
                onClick={login}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
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
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-slate-800/50 text-slate-400">Secure OAuth 2.0</span>
                </div>
              </div>

              {/* Info section */}
              <div className="bg-slate-700/30 border border-slate-700/50 rounded-lg p-4 mb-6">
                <p className="text-slate-400 text-sm">
                  <strong className="text-slate-300">No password stored.</strong> We use Salesforce OAuth for secure, passwordless authentication.
                </p>
              </div>

              {/* Footer text */}
              <p className="text-center text-xs text-slate-500">
                By logging in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <p className="text-slate-400 text-sm text-center mb-4">Trusted by Salesforce admins</p>
              <div className="flex items-center justify-center gap-6">
                <div className="h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded px-3 flex items-center">
                  <span className="text-slate-300 text-xs font-semibold">Enterprise Grade</span>
                </div>
                <div className="h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded px-3 flex items-center">
                  <span className="text-slate-300 text-xs font-semibold">SOC 2 Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add blob animation to tailwind config */}
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

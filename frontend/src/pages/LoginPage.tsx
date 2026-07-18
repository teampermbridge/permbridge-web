import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Check } from 'lucide-react';
import client from '../api/client';

const LOGO = (
  <svg width="40" height="40" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" rx="22" fill="rgba(255,255,255,0.08)"></rect>
    <path d="M33 27 L33 69 M33 48 L58 27 M33 48 L60 69" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
    <circle cx="67" cy="25" r="8" fill="#4f9cf9"></circle>
  </svg>
);

export function LoginPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setOrganization = useAuthStore((state) => state.setOrganization);
  const setOrganizations = useAuthStore((state) => state.setOrganizations);
  const setError = useAuthStore((state) => state.setError);
  const error = useAuthStore((state) => state.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    console.log('🔐 LOGIN: Starting login attempt', { email });

    if (!email || !password) {
      console.warn('🔐 LOGIN: Missing email or password');
      setLocalError('Email and password are required');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔐 LOGIN: Sending POST to /api/auth/login');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await client.post('/api/auth/login', { email, password }, { signal: controller.signal as any });
      clearTimeout(timeoutId);

      console.log('🔐 LOGIN: Got response from backend', {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        organizationCount: response.data.organizations?.length
      });

      const { token, user, organizations } = response.data;

      if (!token) {
        console.error('🔐 LOGIN: No token in response!');
        throw new Error('No token received from server');
      }

      console.log('🔐 LOGIN: Setting localStorage auth_token');
      localStorage.setItem('auth_token', token);
      console.log('🔐 LOGIN: Token stored, updating auth store');

      setToken(token);
      setUser(user);
      setOrganizations(organizations);

      if (organizations.length > 0) {
        console.log('🔐 LOGIN: Setting primary organization', { orgId: organizations[0].id });
        setOrganization(organizations[0]);
      }

      console.log('🔐 LOGIN: About to navigate to /user-dashboard');
      navigate('/user-dashboard');
      console.log('🔐 LOGIN: Navigation completed');
    } catch (error: any) {
      console.error('🔐 LOGIN: ERROR', error);
      console.error('🔐 LOGIN: Error details', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        name: error.name
      });

      let errorMsg = 'Login failed. Please try again.';
      if (error.name === 'AbortError') {
        errorMsg = 'Request timed out. Check your connection and try again.';
      } else if (error.response?.status === 401) {
        errorMsg = 'Invalid email or password. Check your credentials and try again.';
      } else if (error.response?.status === 0 || error.message?.includes('Network')) {
        errorMsg = 'Backend is not responding. Make sure it\'s running on port 3001.';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }

      console.error('🔐 LOGIN: Showing error to user:', errorMsg);
      setLocalError(errorMsg);
      alert('❌ LOGIN FAILED\n\n' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', minHeight: '100vh', background: '#020617' }}>
      {/* Left Panel */}
      <div style={{
        background: 'linear-gradient(160deg,#1B1F3B 0%,#0d1026 55%,#020617 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(27,115,232,0.25) 0%,rgba(27,115,232,0) 70%)',
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-160px',
          left: '-100px',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(139,92,246,0.18) 0%,rgba(139,92,246,0) 70%)',
        }}></div>

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', textDecoration: 'none', cursor: 'pointer' }}>
            {LOGO}
            <div style={{ color: '#f1f5f9', fontSize: '19px', fontWeight: '700', letterSpacing: '-0.2px' }}>
              Kairos <span style={{ color: '#7a8299', fontWeight: '500' }}>/ PermBridge</span>
            </div>
          </Link>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(79,156,249,0.12)',
            border: '1px solid rgba(79,156,249,0.3)',
            color: '#8fc0ff',
            fontSize: '12.5px',
            fontWeight: '600',
            padding: '6px 12px',
            borderRadius: '20px',
            marginBottom: '22px',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.9 4.9L19 9l-4.9 1.9L12 16l-1.9-5.1L5 9l5.1-1.1L12 3z"></path>
            </svg>
            Built for any Salesforce permission model
          </div>

          {/* H1 */}
          <h1 style={{
            color: '#f8fafc',
            fontSize: '42px',
            lineHeight: '1.15',
            fontWeight: '800',
            letterSpacing: '-1px',
            margin: '0 0 18px 0',
          }}>The permission management platform built for how your org actually works.</h1>

          {/* Description */}
          <p style={{
            color: '#9aa3ba',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0 0 40px 0',
          }}>Whether you run on Profiles, Permission Sets, or both — Perm Bridge helps you convert, summarize and audit access with an AI copilot that explains every change.</p>

          {/* Trust bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Works with Profile-based or Permission-Set-based orgs',
              'AI-assisted conversion in under 5 minutes',
              'SOC 2 Type II certified, SSO / SAML ready',
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#c3cadb', fontSize: '14.5px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  background: 'rgba(34,197,94,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Check size={14} color="#4ade80" strokeWidth={3} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', display: 'flex', gap: '36px', color: '#6b7488', fontSize: '12.5px' }}>
          <div>© 2026 Kairos Apps</div>
          <div>Privacy</div>
          <div>Security</div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        background: '#0b1020',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{
            color: '#f1f5f9',
            fontSize: '26px',
            fontWeight: '700',
            margin: '0 0 6px 0',
            letterSpacing: '-0.4px',
          }}>Welcome back</h2>
          <p style={{
            color: '#8891a6',
            fontSize: '14.5px',
            margin: '0 0 32px 0',
          }}>Sign in to your Kairos workspace</p>


          {/* Form */}
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '22px' }}>
            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                color: '#aab3c9',
                fontSize: '12.5px',
                fontWeight: '600',
                marginBottom: '7px',
              }}>Work email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  background: '#0f1526',
                  border: '1px solid #262f47',
                  color: '#e8ecf5',
                  fontSize: '14.5px',
                  padding: '11px 13px',
                  borderRadius: '9px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                <label style={{
                  color: '#aab3c9',
                  fontSize: '12.5px',
                  fontWeight: '600',
                }}>Password</label>
                <span style={{ color: '#5b8fe0', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer' }}>Forgot?</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                style={{
                  width: '100%',
                  background: '#0f1526',
                  border: '1px solid #262f47',
                  color: '#e8ecf5',
                  fontSize: '14.5px',
                  padding: '11px 13px',
                  borderRadius: '9px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Error */}
            {(error || localError) && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: '8px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p style={{ color: '#f87171', fontSize: '13px', margin: '0', lineHeight: '1.4' }}>
                  {error || localError}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#1B73E8',
                border: 'none',
                color: '#fff',
                fontSize: '14.5px',
                fontWeight: '700',
                padding: '13px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px -8px rgba(27,115,232,0.6)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = '#1863c9')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = '#1B73E8')}
            >
              {isSubmitting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.3"></circle>
                    <path d="M21 12a9 9 0 00-9-9"></path>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to Perm Bridge
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#6b7488', fontSize: '13px', margin: '0' }}>
            Don't have an account? <Link to="/register" style={{ color: '#5b8fe0', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="padding: '56px"] {
            padding: 32px 20px !important;
          }

          div[style*="fontSize: '42px"] {
            font-size: 28px !important;
            line-height: 1.2 !important;
          }

          div[style*="fontSize: '19px"] {
            font-size: 18px !important;
          }

          div[style*="gap: '36px"] {
            gap: 24px !important;
          }

          div[style*="gap: '16px"] {
            gap: 12px !important;
          }
        }

        @media (max-width: 480px) {
          div[style*="padding: '40px"] {
            padding: 20px !important;
          }

          div[style*="fontSize: '26px"] {
            font-size: 20px !important;
          }

          div[style*="fontSize: '14.5px"] {
            font-size: 13px !important;
          }

          button[style*="padding: '13px"] {
            padding: 11px 14px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}

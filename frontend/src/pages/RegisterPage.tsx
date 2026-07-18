import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, Check } from 'lucide-react';
import client from '../api/client';

const LOGO = (
  <svg width="40" height="40" viewBox="0 0 96 96" fill="none">
    <rect width="96" height="96" rx="22" fill="rgba(255,255,255,0.08)"></rect>
    <path d="M33 27 L33 69 M33 48 L58 27 M33 48 L60 69" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
    <circle cx="67" cy="25" r="8" fill="#4f9cf9"></circle>
  </svg>
);

export function RegisterPage() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setOrganization = useAuthStore((state) => state.setOrganization);
  const setOrganizations = useAuthStore((state) => state.setOrganizations);
  const setError = useAuthStore((state) => state.setError);
  const error = useAuthStore((state) => state.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    console.log('📝 REGISTER: Starting registration', { email });

    if (!email || !password || !fullName || !organizationName) {
      console.warn('📝 REGISTER: Missing required fields');
      setLocalError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      console.warn('📝 REGISTER: Password too short');
      setLocalError('Password must be at least 8 characters');
      setIsSubmitting(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn('📝 REGISTER: Invalid email format');
      setLocalError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📝 REGISTER: Sending POST to /api/auth/register');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await client.post('/api/auth/register', {
        email,
        password,
        full_name: fullName,
        organization_name: organizationName,
      }, { signal: controller.signal as any });
      clearTimeout(timeoutId);

      console.log('📝 REGISTER: Got response from backend', {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        hasOrganization: !!response.data.organization
      });

      const { token, user, organization } = response.data;

      if (!token) {
        console.error('📝 REGISTER: No token in response!');
        throw new Error('No token received from server');
      }

      console.log('📝 REGISTER: Setting localStorage auth_token');
      localStorage.setItem('auth_token', token);
      console.log('📝 REGISTER: Token stored, updating auth store');

      setToken(token);
      setUser(user);
      setOrganization(organization);
      setOrganizations([organization]);

      console.log('📝 REGISTER: About to navigate to /user-dashboard');
      navigate('/user-dashboard');
      console.log('📝 REGISTER: Navigation completed');
    } catch (error: any) {
      console.error('📝 REGISTER: ERROR', error);
      console.error('📝 REGISTER: Error details', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        name: error.name
      });

      let errorMsg = 'Registration failed. Please try again.';
      if (error.name === 'AbortError') {
        errorMsg = 'Request timed out. Check your connection and try again.';
      } else if (error.response?.status === 409) {
        errorMsg = 'Email already in use. Try logging in instead.';
      } else if (error.response?.status === 0 || error.message?.includes('Network')) {
        errorMsg = 'Backend is not responding. Make sure it\'s running on port 3001.';
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }

      console.error('📝 REGISTER: Showing error to user:', errorMsg);
      setLocalError(errorMsg);
      alert('❌ REGISTRATION FAILED\n\n' + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100vh', background: '#020617' }}>
      {/* Left Panel - Same as Login */}
      <div style={{
        background: 'linear-gradient(160deg,#1B1F3B 0%,#0d1026 55%,#020617 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px',
        position: 'relative',
        overflow: 'hidden'
      }}>
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
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', textDecoration: 'none', cursor: 'pointer' }}>
            {LOGO}
            <div style={{ color: '#f1f5f9', fontSize: '19px', fontWeight: '700', letterSpacing: '-0.2px' }}>
              Kairos <span style={{ color: '#7a8299', fontWeight: '500' }}>/ PermBridge</span>
            </div>
          </Link>

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

          <h1 style={{
            color: '#f8fafc',
            fontSize: '42px',
            lineHeight: '1.15',
            fontWeight: '800',
            letterSpacing: '-1px',
            margin: '0 0 18px 0',
          }}>The permission management platform built for how your org actually works.</h1>

          <p style={{
            color: '#9aa3ba',
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0 0 40px 0',
          }}>Whether you run on Profiles, Permission Sets, or both — Perm Bridge helps you convert, summarize and audit access with an AI copilot that explains every change.</p>

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

        <div style={{ position: 'relative', display: 'flex', gap: '36px', color: '#6b7488', fontSize: '12.5px' }}>
          <div>© 2026 Kairos Apps</div>
          <div>Privacy</div>
          <div>Security</div>
        </div>
      </div>

      {/* Right Panel - Registration */}
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
          }}>Create Account</h2>
          <p style={{
            color: '#8891a6',
            fontSize: '14.5px',
            margin: '0 0 32px 0',
          }}>Start managing permissions today</p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '22px' }}>
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

            <div>
              <label style={{
                display: 'block',
                color: '#aab3c9',
                fontSize: '12.5px',
                fontWeight: '600',
                marginBottom: '7px',
              }}>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
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

            <div>
              <label style={{
                display: 'block',
                color: '#aab3c9',
                fontSize: '12.5px',
                fontWeight: '600',
                marginBottom: '7px',
              }}>Organization name</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Corp"
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

            <div>
              <label style={{
                display: 'block',
                color: '#aab3c9',
                fontSize: '12.5px',
                fontWeight: '600',
                marginBottom: '7px',
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                minLength={8}
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
              <p style={{ color: '#586178', fontSize: '12.5px', margin: '6px 0 0 0' }}>Min. 8 characters</p>
            </div>

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
                marginTop: '8px',
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
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '0' }}>
            <div style={{ flex: 1, height: '1px', background: '#1f2740' }}></div>
            <div style={{ color: '#586178', fontSize: '12px', fontWeight: '500' }}>Already have an account?</div>
            <div style={{ flex: 1, height: '1px', background: '#1f2740' }}></div>
          </div>

          <Link
            to="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '13px 16px',
              border: '1px solid #262f47',
              color: '#d5dbe8',
              fontSize: '13px',
              fontWeight: '600',
              marginTop: '14px',
              borderRadius: '10px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Sign In Instead
          </Link>

          <p style={{ textAlign: 'center', color: '#6b7488', fontSize: '12.5px', margin: '20px 0 0 0' }}>
            By registering, you agree to our Terms of Service and Privacy Policy
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

          div[style*="fontSize: '26px"] {
            font-size: 22px !important;
          }

          div[style*="gap: '36px"] {
            gap: 24px !important;
          }
        }

        @media (max-width: 480px) {
          div[style*="padding: '40px"] {
            padding: 20px !important;
          }

          div[style*="padding: '56px"] {
            padding: 24px 16px !important;
          }

          div[style*="fontSize: '20px"] {
            font-size: 18px !important;
          }

          button[type="submit"] {
            padding: 11px 14px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}

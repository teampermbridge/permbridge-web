import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ArrowRight, Check } from 'lucide-react';
import client from '../api/client';

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
        navigate('/connect');
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

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google-login';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100vh', background: '#020617' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <svg width="40" height="40" viewBox="0 0 96 96" fill="none">
              <rect width="96" height="96" rx="22" fill="rgba(255,255,255,0.08)"></rect>
              <path d="M33 27 L33 69 M33 48 L58 27 M33 48 L60 69" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
              <circle cx="67" cy="25" r="8" fill="#4f9cf9"></circle>
            </svg>
            <div style={{ color: '#f1f5f9', fontSize: '19px', fontWeight: '700', letterSpacing: '-0.2px' }}>
              Kairos <span style={{ color: '#7a8299', fontWeight: '500' }}>/ Perm Bridge</span>
            </div>
          </div>

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
          }}>Whether you run on Profiles, Permission Sets, or both — Perm Bridge helps you convert, summarize and audit access with precision and clarity.</p>

          {/* Trust bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Works with Profile-based or Permission-Set-based orgs',
              'Convert profiles to permission sets in minutes',
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

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#141b30',
              border: '1px solid #262f47',
              color: '#e2e8f0',
              fontSize: '14.5px',
              fontWeight: '600',
              padding: '12px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              marginBottom: '20px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1a2338'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#141b30'}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"></path>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z"></path>
              <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.05H2.18a11 11 0 000 9.9l3.66-2.85z"></path>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 002.18 7.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z"></path>
            </svg>
            Continue with Google SSO
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#1f2740' }}></div>
            <div style={{ color: '#586178', fontSize: '12px', fontWeight: '500' }}>OR</div>
            <div style={{ flex: 1, height: '1px', background: '#1f2740' }}></div>
          </div>

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
            {error && (
              <div style={{ padding: '3px', background: '#f87171', color: '#fff', fontSize: '12px', borderRadius: '6px' }}>
                {error}
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
            Don't have a workspace? <span style={{ color: '#5b8fe0', fontWeight: '600', cursor: 'pointer' }}>Talk to sales</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

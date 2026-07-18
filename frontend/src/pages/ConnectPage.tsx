import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import client from '../api/client';

export function ConnectPage() {
  const navigate = useNavigate();
  const setOrganization = useAuthStore((state) => state.setOrganization);
  const organization = useAuthStore((state) => state.organization);

  const [domain, setDomain] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [orgSummary, setOrgSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError(null);

    console.log('🔐 CONNECT: Starting OAuth flow');

    try {
      // Get org ID from URL query params
      const params = new URLSearchParams(window.location.search);
      const orgId = params.get('org');

      if (!orgId) {
        console.error('🔐 CONNECT: No org ID in URL');
        setError('Organization ID missing. Please try again.');
        setIsConnecting(false);
        return;
      }

      console.log('🔐 CONNECT: Getting OAuth URL', { orgId });
      // Get Salesforce OAuth URL and redirect
      const response = await client.get(`/api/auth/salesforce/login?orgId=${orgId}`);
      console.log('🔐 CONNECT: Got OAuth URL, redirecting to Salesforce');
      window.location.href = response.data.authUrl;
    } catch (err: any) {
      console.error('🔐 CONNECT: OAuth error:', err);
      console.error('🔐 CONNECT: Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });

      let errorMsg = 'Failed to connect org. Please try again.';

      if (err.message?.includes('Network') || err.response?.status === 0) {
        errorMsg = 'Backend is not responding. Make sure it\'s running on port 3001.';
      } else if (err.response?.status === 401) {
        errorMsg = 'Your Salesforce session may have expired. Please log in again.';
      } else if (err.response?.data?.error?.includes('MFA')) {
        errorMsg = 'MFA is required. Set up phishing-resistant MFA in your Salesforce org, then try again.';
      } else {
        errorMsg = err.response?.data?.error || errorMsg;
      }

      alert('❌ CONNECTION FAILED\n\n' + errorMsg);
      setError(errorMsg);
      setIsConnecting(false);
    }
  };

  const handleDifferentOrg = () => {
    setIsConnected(false);
    setOrgSummary(null);
    setDomain('');
    setError(null);
  };

  const handleContinue = () => {
    if (orgSummary) {
      navigate('/dashboard');
    }
  };

  // Check if we're returning from Salesforce OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Check for errors from OAuth callback
    const errorParam = params.get('error');
    if (errorParam) {
      console.log('🔐 CONNECT: Error from OAuth callback:', errorParam);
      alert('❌ CONNECTION FAILED\n\n' + decodeURIComponent(errorParam));
      setError(decodeURIComponent(errorParam));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname + '?org=' + params.get('org'));
      return;
    }

    if (params.get('salesforce_connected') === 'true' && organization) {
      console.log('🔐 CONNECT: OAuth successful, triggering sync');
      // We're connected! Now sync
      triggerSync();
    }
  }, [organization]);

  const triggerSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    setError(null);

    try {
      // Get the connection ID from somewhere (you'd need to pass this)
      // For now, we'll assume the backend knows which connection to sync
      const syncResponse = await client.post('/api/auth/salesforce/sync', {
        organizationId: organization?.id,
        salesforceConnectionId: organization?.salesforceConnectionId, // You'll need to store this
      });

      // Poll for sync status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await client.get(
            `/api/auth/salesforce/sync-status/${syncResponse.data.syncConnectionId}`
          );

          setSyncProgress(statusResponse.data.progress || 0);

          if (statusResponse.data.status === 'completed') {
            clearInterval(pollInterval);
            setIsSyncing(false);

            // Mock org summary for now
            setOrgSummary({
              id: organization?.id,
              name: organization?.name || 'Salesforce Org',
              type: 'Production',
              edition: 'Enterprise Edition',
              userCount: 1842,
              profileCount: 58,
              permsetCount: 46,
            });
            setIsConnected(true);
          } else if (statusResponse.data.status === 'failed') {
            clearInterval(pollInterval);
            setIsSyncing(false);
            setError(statusResponse.data.error_message || 'Sync failed');
          }
        } catch (err) {
          console.error('Status check error:', err);
        }
      }, 1000); // Poll every second

      // Safety timeout after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isSyncing) {
          setIsSyncing(false);
          setError('Sync timed out. Please try again.');
        }
      }, 300000);
    } catch (err: any) {
      console.error('Sync error:', err);
      setError(err.response?.data?.error || 'Failed to start sync');
      setIsSyncing(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '100vh',
      background: '#020617',
      padding: '40px',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <button
          onClick={() => navigate('/user-dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '36px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <svg width="30" height="30" viewBox="0 0 96 96" fill="none">
            <rect width="96" height="96" rx="22" fill="#1B1F3B"></rect>
            <path d="M33 27 L33 69 M33 48 L58 27 M33 48 L60 69" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
            <circle cx="67" cy="25" r="8" fill="#1B73E8"></circle>
          </svg>
          <div style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '700' }}>PermBridge</div>
        </button>

        {isSyncing ? (
          <div style={{ background: '#0e1426', border: '1px solid #1f2740', borderRadius: '16px', padding: '36px', textAlign: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}>
              <circle cx="12" cy="12" r="9" strokeOpacity="0.3"></circle>
              <path d="M21 12a9 9 0 00-9-9"></path>
            </svg>
            <div style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Syncing your Salesforce data...</div>
            <div style={{ color: '#8891a6', fontSize: '13.5px', marginBottom: '24px' }}>This may take a few minutes</div>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a2138',
              borderRadius: '3px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              <div style={{
                height: '100%',
                width: `${syncProgress}%`,
                background: 'linear-gradient(90deg, #1B73E8, #8b5cf6)',
                transition: 'width 0.3s ease',
              }}></div>
            </div>

            <div style={{ color: '#586178', fontSize: '12px' }}>{syncProgress}% complete</div>

            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : !isConnected ? (
          <div style={{ background: '#0e1426', border: '1px solid #1f2740', borderRadius: '16px', padding: '36px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: 'rgba(27,115,232,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#5b9cf0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M6 21V7l6-4 6 4v14M10 21v-6h4v6"></path>
              </svg>
            </div>
            <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Connect your Salesforce org</div>
            <div style={{ color: '#8891a6', fontSize: '13.5px', lineHeight: '1.55', marginBottom: '20px' }}>
              Perm Bridge reads Profile and Permission Set metadata via the Salesforce Metadata API. No data ever leaves your org without your approval.
            </div>

            {/* MFA Warning Banner */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <div style={{ fontSize: '12.5px', color: '#3b82f6', lineHeight: '1.5' }}>
                <strong>MFA Required (July 20, 2026):</strong> Salesforce now requires phishing-resistant MFA for Admins and users with elevated permissions (Security keys or passkeys). Regular users can use any MFA method.{' '}
                <a href="https://help.salesforce.com/s/articleView?id=005321563&type=1" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer' }}>
                  Learn more
                </a>
              </div>
            </div>

            <label style={{
              display: 'block',
              color: '#aab3c9',
              fontSize: '12.5px',
              fontWeight: '600',
              marginBottom: '7px',
            }}>My Domain URL</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0f1526',
              border: '1px solid #262f47',
              borderRadius: '9px',
              overflow: 'hidden',
              marginBottom: '22px',
            }}>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="acme-robotics"
                disabled={isConnecting}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#e8ecf5',
                  fontSize: '14.5px',
                  padding: '11px 13px',
                  outline: 'none',
                }}
              />
              <div style={{ color: '#586178', fontSize: '13.5px', padding: '0 13px' }}>.my.salesforce.com</div>
            </div>

            {error && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: '8px',
                display: 'flex',
                gap: '10px',
                marginBottom: '22px',
                alignItems: 'flex-start',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p style={{ color: '#f87171', fontSize: '13px', margin: '0', lineHeight: '1.4' }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={!domain || isConnecting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: domain && !isConnecting ? '#1B73E8' : '#1c2540',
                border: 'none',
                color: '#fff',
                fontSize: '14.5px',
                fontWeight: '700',
                padding: '13px 16px',
                borderRadius: '10px',
                cursor: domain && !isConnecting ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
            >
              {isConnecting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="9" strokeOpacity="0.3"></circle>
                    <path d="M21 12a9 9 0 00-9-9"></path>
                  </svg>
                  Connecting…
                </>
              ) : (
                <>Connect to Salesforce</>
              )}
            </button>
            <p style={{ textAlign: 'center', color: '#586178', fontSize: '12.5px', margin: '18px 0 0' }}>
              You'll be redirected to Salesforce to grant read-only access.
            </p>
          </div>
        ) : (
          <div style={{ background: '#0e1426', border: '1px solid #1f2740', borderRadius: '16px', padding: '36px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '22px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircle2 size={18} color="#4ade80" strokeWidth={2.5} />
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700' }}>Org connected</div>
            </div>

            {orgSummary && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '26px' }}>
                {[
                  { label: 'Organization', value: orgSummary.name },
                  { label: 'Edition', value: orgSummary.edition },
                  { label: 'Users discovered', value: orgSummary.userCount.toLocaleString() },
                  { label: 'Profiles & Permission Sets', value: `${orgSummary.profileCount} · ${orgSummary.permsetCount}` },
                ].map((row, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#0b1020',
                    border: '1px solid #1f2740',
                    borderRadius: '10px',
                  }}>
                    <div style={{ color: '#8891a6', fontSize: '13px' }}>{row.label}</div>
                    <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: '600' }}>{row.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleContinue}
                style={{
                  flex: 1,
                  background: '#1B73E8',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '700',
                  padding: '13px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1863c9'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1B73E8'}
              >
                Continue to Perm Bridge
              </button>
              <button
                onClick={handleDifferentOrg}
                style={{
                  flex: 0.6,
                  background: '#141b30',
                  border: '1px solid #262f47',
                  color: '#d5dbe8',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '13px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                Different org
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

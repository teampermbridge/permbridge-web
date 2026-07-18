import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Plus, Settings, Building2, User, Trash2 } from 'lucide-react';
import client from '../api/client';

export function UserDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const organization = useAuthStore((state) => state.organization);
  const setOrganization = useAuthStore((state) => state.setOrganization);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'settings'>('overview');
  const [salesforceConnected, setSalesforceConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);

  // Fetch actual Salesforce connections from database
  useEffect(() => {
    const checkConnections = async () => {
      try {
        if (!organization?.id) {
          setSalesforceConnected(false);
          setLoading(false);
          return;
        }

        const res = await client.get(`/api/salesforce/${organization.id}/connections`);
        setSalesforceConnected(res.data && res.data.length > 0);
      } catch (error) {
        console.error('Failed to check connections:', error);
        setSalesforceConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkConnections();
  }, [organization?.id]);

  // Fetch actual organizations from database first
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Handle org parameter from URL (e.g., after OAuth redirect)
  // This runs AFTER organizations array is populated
  useEffect(() => {
    const orgIdFromUrl = searchParams.get('org');
    if (orgIdFromUrl && organizations.length > 0) {
      const foundOrg = organizations.find(org => org.id === orgIdFromUrl);
      if (foundOrg) {
        setOrganization(foundOrg);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [searchParams, organizations, setOrganization]);

  const fetchOrganizations = async () => {
    try {
      const res = await client.get('/api/auth/me');
      if (res.data.organizations) {
        setOrganizations(res.data.organizations);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      setOrganizations([]);
    } finally {
      setOrgsLoading(false);
    }
  };

  const handleAddOrganization = async () => {
    const orgName = prompt('Enter organization name:');
    if (!orgName) return;

    try {
      const res = await client.post('/api/auth/organizations', { name: orgName });
      // Refresh organizations list
      await fetchOrganizations();
      // Auto-navigate to connect Salesforce for this org
      navigate(`/connect?org=${res.data.id}`);
    } catch (error) {
      alert('Failed to create organization');
      console.error('Create org error:', error);
    }
  };

  const handleDeleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Delete "${orgName}" and all its data? This cannot be undone.`)) return;

    try {
      await client.delete(`/api/auth/organizations/${orgId}`);
      // Refresh organizations list
      await fetchOrganizations();
    } catch (error) {
      alert('Failed to delete organization');
      console.error('Delete org error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', background: '#020617' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        borderRight: '1px solid rgba(148,163,184,0.1)',
        background: '#0b1020',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <svg width="32" height="32" viewBox="0 0 96 96" fill="none">
            <rect width="96" height="96" rx="22" fill="rgba(255,255,255,0.08)"></rect>
            <path d="M33 27 L33 69 M33 48 L58 27 M33 48 L60 69" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
            <circle cx="67" cy="25" r="8" fill="#4f9cf9"></circle>
          </svg>
          <div style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '700' }}>PermBridge</div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'organizations', label: 'Organizations', icon: Building2 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '9px',
                background: activeTab === id ? 'rgba(27,115,232,0.14)' : 'transparent',
                border: 'none',
                color: activeTab === id ? '#8fc0ff' : '#8891a6',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '11px 14px',
            borderRadius: '9px',
            background: 'transparent',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#f87171',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          height: '64px',
          borderBottom: '1px solid rgba(148,163,184,0.1)',
          background: '#0b1020/50',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700', margin: 0 }}>
              {activeTab === 'overview' && 'Welcome'}
              {activeTab === 'organizations' && 'Organizations'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'right',
            }}>
              <div style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>
                {user?.full_name || 'User'}
              </div>
              <div style={{ color: '#8891a6', fontSize: '12px' }}>
                {user?.email}
              </div>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1B73E8, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '700',
            }}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  Welcome back, {user?.full_name?.split(' ')[0]}!
                </h2>
                <p style={{ color: '#8891a6', fontSize: '14px', margin: 0 }}>
                  Manage your Salesforce organizations and permissions from here.
                </p>
              </div>

              {/* Quick Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
                {[
                  { label: 'Connected Orgs', value: organizations.length.toString() },
                  { label: 'Total Users', value: '—' },
                  { label: 'Permissions Managed', value: '—' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: '#0e1426',
                    border: '1px solid #1f2740',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{ color: '#8891a6', fontSize: '12px', marginBottom: '8px' }}>
                      {stat.label}
                    </div>
                    <div style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: '700' }}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Org - Show only if org exists AND has Salesforce connection */}
              {organization && salesforceConnected && !loading && (
                <div style={{ background: '#0e1426', border: '1px solid #1f2740', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>
                    Current Organization
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                        {organization.name}
                      </div>
                      <div style={{ color: '#8891a6', fontSize: '13px' }}>
                        Salesforce Connected ✓
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/dashboard')}
                      style={{
                        padding: '10px 18px',
                        background: '#1B73E8',
                        border: 'none',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '600',
                        borderRadius: '8px',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#1863c9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#1B73E8'}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* Show connect prompt if no org or no Salesforce connection */}
              {(!organization || !salesforceConnected) && !loading && (
                <div style={{
                  background: 'rgba(27,115,232,0.08)',
                  border: '1px solid rgba(27,115,232,0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>
                    {!organization ? 'No Organization Yet' : 'Connect Salesforce'}
                  </div>
                  <p style={{ color: '#8891a6', fontSize: '13px', margin: '0 0 16px 0' }}>
                    {!organization
                      ? 'Create your first organization to get started.'
                      : 'Connect your Salesforce organization to sync profiles and permissions.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('organizations')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      background: '#1B73E8',
                      border: 'none',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1863c9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1B73E8'}
                  >
                    <Plus size={16} />
                    {!organization ? 'Add Organization' : 'Connect Salesforce'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>
                    Your Organizations
                  </h2>
                  <p style={{ color: '#8891a6', fontSize: '14px', margin: 0 }}>
                    Manage your connected Salesforce organizations
                  </p>
                </div>
                <button
                  onClick={handleAddOrganization}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: '#1B73E8',
                    border: 'none',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1863c9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1B73E8'}
                >
                  <Plus size={16} />
                  Add Organization
                </button>
              </div>

              {!orgsLoading && organizations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {organizations.map((org: any) => (
                    <div key={org.id} style={{
                      background: '#0e1426',
                      border: '1px solid #1f2740',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}>
                      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #1B73E8, #4f9cf9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Building2 size={24} color="#fff" />
                          </div>
                          <div>
                            <div style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '600', marginBottom: '2px' }}>
                              {org.name}
                            </div>
                            <div style={{ color: '#8891a6', fontSize: '12px' }}>
                              Organization
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => navigate(`/dashboard?org=${org.id}`)}
                            style={{
                              padding: '8px 14px',
                              background: '#141b30',
                              border: '1px solid #262f47',
                              color: '#d5dbe8',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#1a2138'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#141b30'}
                          >
                            Access
                          </button>
                          <button
                            onClick={() => handleDeleteOrganization(org.id, org.name)}
                            style={{
                              padding: '8px 12px',
                              background: 'rgba(248,113,113,0.1)',
                              border: '1px solid rgba(248,113,113,0.3)',
                              color: '#f87171',
                              fontSize: '12px',
                              fontWeight: '600',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !orgsLoading ? (
                <div style={{
                  background: '#0e1426',
                  border: '1px dashed #262f47',
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center',
                }}>
                  <Building2 size={32} color="#586178" style={{ margin: '0 auto 16px' }} />
                  <div style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
                    No organizations yet
                  </div>
                  <p style={{ color: '#8891a6', fontSize: '13px', margin: '0 0 16px 0' }}>
                    Connect your first Salesforce organization to get started.
                  </p>
                </div>
              ) : (
                <div style={{ color: '#8891a6', textAlign: 'center', padding: '40px' }}>
                  Loading organizations...
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 24px 0' }}>
                Account Settings
              </h2>

              <div style={{ maxWidth: '600px' }}>
                {/* Profile Section */}
                <div style={{
                  background: '#0e1426',
                  border: '1px solid #1f2740',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '20px',
                }}>
                  <h3 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0' }}>
                    Profile Information
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#aab3c9', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                        Full Name
                      </label>
                      <div style={{ color: '#e8ecf5', fontSize: '14px', padding: '10px 12px', background: '#0b1020', borderRadius: '8px', border: '1px solid #262f47' }}>
                        {user?.full_name}
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#aab3c9', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                        Email Address
                      </label>
                      <div style={{ color: '#e8ecf5', fontSize: '14px', padding: '10px 12px', background: '#0b1020', borderRadius: '8px', border: '1px solid #262f47' }}>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferences Section */}
                <div style={{
                  background: '#0e1426',
                  border: '1px solid #1f2740',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '20px',
                }}>
                  <h3 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0' }}>
                    Preferences
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ color: '#d5dbe8', fontSize: '14px', fontWeight: '500' }}>
                        Email Notifications
                      </label>
                      <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ color: '#d5dbe8', fontSize: '14px', fontWeight: '500' }}>
                        Marketing Emails
                      </label>
                      <input type="checkbox" style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div style={{
                  background: 'rgba(248,113,113,0.08)',
                  border: '1px solid rgba(248,113,113,0.3)',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <h3 style={{ color: '#f87171', fontSize: '15px', fontWeight: '700', margin: '0 0 12px 0' }}>
                    Danger Zone
                  </h3>
                  <p style={{ color: '#8891a6', fontSize: '13px', margin: '0 0 16px 0' }}>
                    Permanently delete your account and all associated data.
                  </p>
                  <button style={{
                    padding: '10px 18px',
                    background: 'transparent',
                    border: '1px solid #f87171',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #262f47;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3a4562;
        }

        @media (max-width: 768px) {
          div[style*="width: '280px"] {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(148,163,184,0.1) !important;
            padding: 16px !important;
            margin-bottom: 16px !important;
          }

          div[style*="display: 'flex'"][style*="flexDirection: 'column"] {
            flex-direction: row !important;
            gap: 8px !important;
            overflow-x: auto !important;
          }

          div[style*="padding: '40px"] {
            padding: 20px !important;
          }

          div[style*="display: 'grid'"][style*="gridTemplateColumns: 'repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          div[style*="maxWidth: '600px"] {
            max-width: 100% !important;
          }
        }

        @media (max-width: 480px) {
          div[style*="display: 'flex'"][style*="flexDirection: 'column"] {
            flex-direction: column !important;
          }

          button {
            min-height: 44px !important;
            min-width: 44px !important;
          }

          div[style*="display: 'grid'"][style*="gridTemplateColumns: 'repeat(3"] {
            grid-template-columns: 1fr !important;
          }

          div[style*="fontSize: '18px"] {
            font-size: 16px !important;
          }

          div[style*="fontSize: '15px"] {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}

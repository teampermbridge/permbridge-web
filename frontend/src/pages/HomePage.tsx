import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Bell, ChevronDown, Settings, Zap, BarChart3, Grid3x3, ArrowRight, TrendingUp } from 'lucide-react';
import client from '../api/client';

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const organization = useAuthStore((state) => state.organization);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization?.id) {
      fetchStats();
    }
  }, [organization?.id]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/api/dashboard/org/${organization?.id}`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', background: '#020617' }}>
      {/* Top Bar */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
        background: '#0b1020',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button
            onClick={() => navigate('/user-dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
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
            <div style={{ color: '#f1f5f9', fontSize: '15.5px', fontWeight: '700' }}>PermBridge</div>
          </button>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setOrgMenuOpen(!orgMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#141b30',
                border: '1px solid #262f47',
                padding: '7px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#d5dbe8',
                fontSize: '13.5px',
                fontWeight: '600',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fa0c9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M6 21V7l6-4 6 4v14M10 21v-6h4v6"></path>
              </svg>
              {organization?.name || 'Select Org'}
              <ChevronDown size={13} color="#6b7488" />
            </div>
            {orgMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '42px',
                left: 0,
                width: '230px',
                background: '#131a2e',
                border: '1px solid #262f47',
                borderRadius: '10px',
                padding: '6px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                zIndex: 20,
              }}>
                {['Acme Robotics — Production', 'Acme Robotics — Sandbox'].map((org, i) => (
                  <button
                    key={i}
                    onClick={() => setOrgMenuOpen(false)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '7px',
                      color: i === 0 ? '#e2e8f0' : '#aab3c9',
                      fontSize: '13px',
                      background: i === 0 ? 'rgba(27,115,232,0.12)' : 'transparent',
                      cursor: 'pointer',
                      border: 'none',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(27,115,232,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = i === 0 ? 'rgba(27,115,232,0.12)' : 'transparent'}
                  >
                    {org}
                  </button>
                ))}
                <button
                  onClick={() => { setOrgMenuOpen(false); navigate('/connect'); }}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '7px',
                    color: '#aab3c9',
                    fontSize: '13px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(27,115,232,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  + Connect new org
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ color: '#8fa0c9', cursor: 'pointer' }}>
            <Bell size={19} />
          </div>
          <div style={{ width: '1px', height: '22px', background: '#232c45' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', position: 'relative' }} onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#1B73E8,#8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12.5px',
              fontWeight: '700',
            }}>
              {user?.email?.[0].toUpperCase()}T
            </div>
            <ChevronDown size={13} color="#6b7488" />
            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '56px',
                right: 0,
                width: '190px',
                background: '#131a2e',
                border: '1px solid #262f47',
                borderRadius: '10px',
                padding: '6px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                zIndex: 20,
              }}>
                <div style={{ padding: '10px', borderRadius: '7px', color: '#8891a6', fontSize: '12px', borderBottom: '1px solid rgba(148,163,184,0.1)', marginBottom: '4px' }}>
                  {user?.email}
                </div>
                <button
                  onClick={() => { navigate('/user-dashboard'); setUserMenuOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 10px',
                    borderRadius: '7px',
                    color: '#aab3c9',
                    fontSize: '13px',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(27,115,232,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={14} />
                  Settings
                </button>
                <button
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '7px',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 60px' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <h1 style={{
            color: '#f1f5f9',
            fontSize: '26px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            letterSpacing: '-0.4px',
          }}>Good afternoon, {user?.email?.split('@')[0]}</h1>
          <p style={{
            color: '#8891a6',
            fontSize: '14.5px',
            margin: '0 0 32px 0',
          }}>Here's what's happening in {organization?.name || 'your org'}.</p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px', marginBottom: '40px' }}>
            {[
              { label: 'Permission sets managed', value: stats?.permissionSets || '0', subtitle: 'synced from Salesforce', color: '#5b9cf0' },
              { label: 'Profiles analyzed', value: stats?.profiles || '0', subtitle: `of ${stats?.profiles || 0} total profiles`, color: '#a78bfa' },
              { label: 'Users discovered', value: stats?.users || '0', subtitle: 'across all profiles', color: '#4ade80' },
            ].map((card, i) => (
              <div key={i} style={{
                background: '#0e1426',
                border: '1px solid #1f2740',
                borderRadius: '14px',
                padding: '22px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ color: '#8891a6', fontSize: '13px', fontWeight: '600' }}>{card.label}</div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `rgba(${card.color === '#5b9cf0' ? '27,115,232' : card.color === '#a78bfa' ? '139,92,246' : '34,197,94'},0.14)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {i === 0 && <Zap size={16} color={card.color} />}
                    {i === 1 && <BarChart3 size={16} color={card.color} />}
                    {i === 2 && <TrendingUp size={16} color={card.color} />}
                  </div>
                </div>
                <div style={{ color: '#f1f5f9', fontSize: '30px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                  {card.value}
                </div>
                <div style={{
                  color: i === 0 ? '#4ade80' : '#94a3b8',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  marginTop: '6px',
                }}>
                  {card.subtitle}
                </div>
              </div>
            ))}
          </div>

          {/* Tools */}
          <div style={{ color: '#c3cadb', fontSize: '13px', fontWeight: '700', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Tools
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
            {[
              {
                title: 'Profile → Permission Set Converter',
                desc: 'AI groups a profile\'s permissions into logical, reusable permission sets.',
                color: '#5b9cf0',
                icon: Zap,
                link: '/converter',
              },
              {
                title: 'Permission Set Summarizer',
                desc: 'A 360° snapshot of any Profile, Permission Set or Group — objects, fields, users & more.',
                color: '#a78bfa',
                icon: BarChart3,
                link: '/summarizer',
              },
              {
                title: 'Permission Matrix X-Ray',
                desc: 'Cross-compare Profiles, Permission Sets and Users — object by object.',
                color: '#4ade80',
                icon: Grid3x3,
                link: '/matrix',
              },
            ].map((tool, i) => (
              <Link
                key={i}
                to={tool.link}
                style={{
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  background: '#0e1426',
                  border: '1px solid #1f2740',
                  borderRadius: '16px',
                  padding: '26px',
                  transition: 'transform 0.15s, border-color 0.15s',
                  cursor: 'pointer',
                  height: '100%',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = `${tool.color}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#1f2740';
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '11px',
                    background: `rgba(${tool.color === '#5b9cf0' ? '27,115,232' : tool.color === '#a78bfa' ? '139,92,246' : '34,197,94'},0.14)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}>
                    {tool.icon && <tool.icon size={21} color={tool.color} />}
                  </div>
                  <div style={{ color: '#f1f5f9', fontSize: '16.5px', fontWeight: '700', marginBottom: '8px' }}>
                    {tool.title}
                  </div>
                  <div style={{ color: '#8891a6', fontSize: '13.5px', lineHeight: '1.55', marginBottom: '18px' }}>
                    {tool.desc}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: tool.color, fontSize: '13px', fontWeight: '600' }}>
                    Open <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

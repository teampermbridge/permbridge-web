import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BarChart3, Download, Shield } from 'lucide-react';
import client from '../api/client';

export function SummarizerPage() {
  const organization = useAuthStore((state) => state.organization);
  const [type, setType] = useState<'profile' | 'permset' | 'group'>('profile');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [permsets, setPermsets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization?.id) {
      fetchData();
    }
  }, [organization?.id, type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (type === 'profile') {
        const res = await client.get(`/api/salesforce/org/${organization?.id}/profiles`);
        setProfiles(res.data.profiles);
      } else if (type === 'permset') {
        const res = await client.get(`/api/salesforce/org/${organization?.id}/permsets`);
        setPermsets(res.data.permissionSets);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', background: '#020617' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(148,163,184,0.1)',
        background: '#0b1020/50',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: '7xl', margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              to="/dashboard"
              style={{
                padding: '8px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#aab3c9',
                textDecoration: 'none',
              }}
            >
              ←
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(139,92,246,0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <BarChart3 size={15} color="#a78bfa" />
              </div>
              <div>
                <h1 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '700', margin: 0 }}>Permission Set Summarizer</h1>
                <p style={{ color: '#8891a6', fontSize: '12.5px', margin: '4px 0 0 0' }}>360° view with detailed analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '7xl', margin: '0 auto', padding: '28px 40px 60px', flex: 1 }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#8891a6', fontSize: '12px', fontWeight: '700', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Type
            </div>
            <div style={{ display: 'flex', background: '#0e1426', border: '1px solid #1f2740', borderRadius: '9px', padding: '3px' }}>
              {(['profile', 'permset', 'group'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: type === t ? '#1B73E8' : 'transparent',
                    color: type === t ? '#fff' : '#8891a6',
                    border: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {t === 'profile' && 'Profile'}
                  {t === 'permset' && 'Permission Set'}
                  {t === 'group' && 'Permission Set Group'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <div style={{ color: '#8891a6', fontSize: '12px', fontWeight: '700', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select
            </div>
            <button
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: '#0e1426',
                border: '1px solid #262f47',
                color: selectedTarget ? '#e2e8f0' : '#586178',
                fontSize: '13.5px',
                borderRadius: '9px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>
              {loading ? 'Loading...' : (selectedTarget ? selectedTarget : `Select ${type} —`)}
            </button>
            {!loading && (type === 'profile' ? profiles : permsets).length > 0 && (
              <div style={{
                position: 'absolute',
                top: '74px',
                left: 0,
                right: 0,
                background: '#131a2e',
                border: '1px solid #262f47',
                borderRadius: '10px',
                padding: '6px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                zIndex: 20,
                maxHeight: '240px',
                overflowY: 'auto',
              }}>
                {(type === 'profile' ? profiles : permsets).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTarget(item.name)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '7px',
                      color: '#d5dbe8',
                      fontSize: '13px',
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                    }}>
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCompareMode(!compareMode)}
            style={{
              padding: '11px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '9px',
              cursor: 'pointer',
              background: compareMode ? 'rgba(250,204,21,0.14)' : '#141b30',
              border: compareMode ? '1px solid rgba(245,158,11,0.3)' : '1px solid #262f47',
              color: compareMode ? '#facc15' : '#d5dbe8',
              transition: 'all 0.2s',
            }}
          >
            Compare
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button style={{ padding: '11px 16px', background: '#141b30', border: '1px solid #262f47', color: '#d5dbe8', fontSize: '13px', fontWeight: '600', borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} />
              Export PDF
            </button>
            <button style={{ padding: '11px 16px', background: '#141b30', border: '1px solid #262f47', color: '#d5dbe8', fontSize: '13px', fontWeight: '600', borderRadius: '9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Empty State */}
        {!selectedTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#141b30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
            }}>
              <Shield size={26} color="#586178" />
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
              Select a Profile, Permission Set, or Group
            </div>
            <div style={{ color: '#8891a6', fontSize: '13.5px' }}>
              Choose a target above to see its full permission breakdown.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

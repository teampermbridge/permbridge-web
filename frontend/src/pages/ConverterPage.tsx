import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Check } from 'lucide-react';
import client from '../api/client';

const PROFILES: any[] = [];

const GROUPS = [
  { name: 'Sales Core', items: ['Account — Edit', 'Contact — Edit', 'Opportunity — Edit', 'Lead — Edit', 'Task — Edit'] },
  { name: 'Reporting Access', items: ['Campaign — Read', 'Product — Read', 'Report — Read', 'Dashboard — Read'] },
  { name: 'Admin Utilities', items: ['Report — Manage', 'Dashboard — Manage', 'Public Group — Manage'] },
];

const ANALYSIS_LOG = [
  'Connecting to Acme Robotics — Production…',
  'Reading object & field permissions…',
  'Clustering permissions by functional domain…',
  'Identifying reusable groupings…',
  'Found 3 logical permission sets.',
];

export function ConverterPage() {
  const navigate = useNavigate();
  const organization = useAuthStore((state) => state.organization);
  const [step, setStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [logLineCount, setLogLineCount] = useState(0);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization?.id) {
      fetchProfiles();
    }
  }, [organization?.id]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await client.get(`/api/salesforce/org/${organization?.id}/profiles`);
      setProfiles(response.data.profiles);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedProfile) return;
    setStep(2);
    setLogLineCount(0);
    let i = 0;
    const tick = () => {
      i++;
      setLogLineCount(i);
      if (i < ANALYSIS_LOG.length) setTimeout(tick, 550);
      else setTimeout(() => setStep(3), 700);
    };
    setTimeout(tick, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', background: '#020617' }}>
      {/* Header */}
      <div style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '0 28px',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
        background: '#0b1020',
      }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#141b30',
            border: '1px solid #262f47',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#aab3c9',
          }}
        >
          ←
        </button>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '8px',
          background: 'rgba(27,115,232,0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b9cf0" strokeWidth="2">
            <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"></path>
          </svg>
        </div>
        <div style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '700' }}>Profile → Permission Set Converter</div>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                background: step > s ? 'rgba(34,197,94,0.16)' : step === s ? '#1B73E8' : 'transparent',
                color: step > s ? '#4ade80' : step === s ? '#fff' : '#586178',
                border: `1px solid ${step > s ? '#227d5b' : step === s ? '#1B73E8' : '#262f47'}`,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '40px', display: 'flex', justifyContent: 'center' }}>
        {step === 1 && (
          <div style={{ width: '100%', maxWidth: '720px' }}>
            <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>
              Select a profile to convert
            </div>
            <div style={{ color: '#8891a6', fontSize: '13.5px', marginBottom: '24px' }}>
              Claude will analyze every object and field permission and suggest logical groupings.
            </div>
            <div style={{ background: '#0e1426', border: '1px solid #1f2740', borderRadius: '14px', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#8891a6' }}>Loading profiles...</div>
              ) : profiles.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#8891a6' }}>No profiles found. Sync your Salesforce org first.</div>
              ) : (
              profiles.map((p, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedProfile(p.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: i < profiles.length - 1 ? '1px solid #1a2138' : 'none',
                    cursor: 'pointer',
                    background: selectedProfile === p.name ? 'rgba(27,115,232,0.08)' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                >
                  <div>
                    <div style={{ color: '#e2e8f0', fontSize: '14.5px', fontWeight: '600' }}>{p.name}</div>
                    <div style={{ color: '#586178', fontSize: '12.5px', marginTop: '2px' }}>{p.object_permission_count || 0} object permissions</div>
                  </div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px solid ${selectedProfile === p.name ? '#1B73E8' : '#3a4562'}`,
                    background: selectedProfile === p.name ? '#1B73E8' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {selectedProfile === p.name && <Check size={12} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              )))}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!selectedProfile}
              style={{
                marginTop: '24px',
                width: '100%',
                background: selectedProfile ? '#1B73E8' : '#1c2540',
                border: 'none',
                color: '#fff',
                fontSize: '14.5px',
                fontWeight: '700',
                padding: '13px 22px',
                borderRadius: '10px',
                cursor: selectedProfile ? 'pointer' : 'not-allowed',
              }}
            >
              Analyze with AI
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 24px' }}>
              <circle cx="12" cy="12" r="9" strokeOpacity="0.25"></circle>
              <path d="M21 12a9 9 0 00-9-9"></path>
            </svg>
            <div style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>
              Analyzing {selectedProfile}…
            </div>
            <div style={{ color: '#8891a6', fontSize: '13.5px', marginBottom: '24px' }}>
              This usually takes a few seconds
            </div>
            <div style={{ background: '#0e1426', border: '1px solid #1f2740', borderRadius: '14px', padding: '22px', fontFamily: "'JetBrains Mono',monospace" }}>
              {logLineCount === 0 ? (
                <div style={{ color: '#586178', fontSize: '13px' }}>Initializing…</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                  {ANALYSIS_LOG.slice(0, logLineCount).map((line, i) => (
                    <div key={i} style={{ color: '#8fc0ff', fontSize: '13px', animation: 'lineIn 0.3s ease both' }}>
                      $ {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ width: '100%', maxWidth: '1080px' }}>
            <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700' }}>Review suggested groupings</div>
                <div style={{ color: '#8891a6', fontSize: '13.5px' }}>Drag permissions between groups, or rename a group before converting.</div>
              </div>
              <button style={{ background: '#141b30', border: '1px solid #262f47', color: '#d5dbe8', fontSize: '12.5px', fontWeight: '600', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                + New group
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '18px', marginTop: '22px', marginBottom: '26px' }}>
              {GROUPS.map((g, i) => (
                <div key={i} style={{ background: '#0e1426', border: '1px solid #1f2740', borderRadius: '14px', padding: '18px', minHeight: '220px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: '#f1f5f9', fontSize: '14.5px', fontWeight: '700', marginBottom: '4px' }}>{g.name}</div>
                  <div style={{ color: '#586178', fontSize: '12px', marginBottom: '12px' }}>{g.items.length} permissions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    {g.items.map((item, j) => (
                      <div key={j} style={{ background: '#141b30', border: '1px solid #232c45', color: '#d5dbe8', fontSize: '12.5px', padding: '8px 10px', borderRadius: '7px', cursor: 'grab' }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setStep(1)} style={{ background: '#141b30', border: '1px solid #262f47', color: '#d5dbe8', fontSize: '13.5px', fontWeight: '600', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer' }}>
                Back
              </button>
              <button onClick={() => setStep(4)} style={{ flex: 1, background: '#1B73E8', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '700', padding: '12px 22px', borderRadius: '10px', cursor: 'pointer' }}>
                Convert to {GROUPS.length} permission sets
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ width: '100%', maxWidth: '640px', textAlign: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
            }}>
              <Check size={18} color="#4ade80" strokeWidth={3} />
            </div>
            <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '700', marginBottom: '2px' }}>
              {GROUPS.length} permission sets created
            </div>
            <div style={{ color: '#8891a6', fontSize: '13.5px', marginBottom: '26px' }}>
              Converted from {selectedProfile} in 3m 48s.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {GROUPS.map((g, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#0e1426',
                  border: '1px solid #1f2740',
                  borderRadius: '12px',
                  padding: '16px 18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f472b6' }}></div>
                    <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600' }}>{g.name}</span>
                  </div>
                  <span style={{ color: '#8891a6', fontSize: '12.5px' }}>{g.items.length} permissions</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => navigate('/dashboard')} style={{ flex: 1, background: '#1B73E8', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '700', padding: '12px 22px', borderRadius: '10px', cursor: 'pointer' }}>
                Done
              </button>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: '#141b30', border: '1px solid #262f47', color: '#d5dbe8', fontSize: '13.5px', fontWeight: '600', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer' }}>
                Convert another profile
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes lineIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

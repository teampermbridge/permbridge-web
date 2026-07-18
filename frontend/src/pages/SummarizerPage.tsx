import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { BarChart3, Download, Shield, ChevronDown } from 'lucide-react';
import client from '../api/client';

interface PermissionDetail {
  objectName: string;
  permissions: {
    create?: boolean;
    read?: boolean;
    edit?: boolean;
    delete?: boolean;
    viewAll?: boolean;
    modifyAll?: boolean;
  };
}

export function SummarizerPage() {
  const organization = useAuthStore((state) => state.organization);
  const [type, setType] = useState<'profile' | 'permset' | 'group'>('profile');
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [permsets, setPermsets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionDetail[]>([]);
  const [expandedObjects, setExpandedObjects] = useState<Set<string>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (organization?.id) {
      fetchData();
      setDropdownOpen(false);
    }
  }, [organization?.id, type]);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setSelectedTarget(null);
      setSelectedTargetId(null);
      setPermissions([]);

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

  const fetchPermissionDetails = async (itemId: string, itemName: string) => {
    try {
      setDetailsLoading(true);
      const endpoint = type === 'profile'
        ? `/api/salesforce/org/${organization?.id}/profiles/${itemId}/permissions`
        : `/api/salesforce/org/${organization?.id}/permsets/${itemId}/permissions`;

      const res = await client.get(endpoint);
      setPermissions(res.data.permissions || []);
    } catch (error) {
      console.error('Failed to fetch permission details:', error);
      setPermissions([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectTarget = (item: any) => {
    setSelectedTarget(item.name);
    setSelectedTargetId(item.id);
    fetchPermissionDetails(item.id, item.name);
    setExpandedObjects(new Set());
  };

  const toggleObjectExpanded = (objectName: string) => {
    const newExpanded = new Set(expandedObjects);
    if (newExpanded.has(objectName)) {
      newExpanded.delete(objectName);
    } else {
      newExpanded.add(objectName);
    }
    setExpandedObjects(newExpanded);
  };

  const exportAsCSV = () => {
    if (!permissions.length) return;

    const rows: string[] = [];
    rows.push(`${selectedTarget} - ${type} Permissions`);
    rows.push('');
    rows.push('Object Name,Create,Read,Edit,Delete,View All,Modify All');

    permissions.forEach((p) => {
      const perms = p.permissions;
      rows.push(
        `"${p.objectName}",${perms.create ? 'Yes' : 'No'},${perms.read ? 'Yes' : 'No'},${perms.edit ? 'Yes' : 'No'},${perms.delete ? 'Yes' : 'No'},${perms.viewAll ? 'Yes' : 'No'},${perms.modifyAll ? 'Yes' : 'No'}`
      );
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTarget}-permissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    if (!permissions.length) return;

    let pdfContent = `${selectedTarget} - ${type} Permissions\n\n`;
    pdfContent += `Total Objects: ${permissions.length}\n\n`;

    permissions.forEach((p) => {
      const perms = p.permissions;
      const permList = [];
      if (perms.create) permList.push('Create');
      if (perms.read) permList.push('Read');
      if (perms.edit) permList.push('Edit');
      if (perms.delete) permList.push('Delete');
      if (perms.viewAll) permList.push('View All');
      if (perms.modifyAll) permList.push('Modify All');

      pdfContent += `${p.objectName}: ${permList.join(', ')}\n`;
    });

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTarget}-permissions.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            <button
              onClick={() => window.history.back()}
              style={{
                padding: '8px 12px',
                background: '#141b30',
                border: '1px solid #262f47',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#aab3c9',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1a2138';
                e.currentTarget.style.borderColor = '#3a4562';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#141b30';
                e.currentTarget.style.borderColor = '#262f47';
              }}
              title="Back to Dashboard"
            >
              ←
            </button>
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
      <main style={{ maxWidth: '7xl', margin: '0 auto', padding: '28px 40px 60px', flex: 1, width: '100%' }}>
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
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: '#0e1426',
                border: dropdownOpen ? '1px solid #1B73E8' : '1px solid #262f47',
                color: selectedTarget ? '#e2e8f0' : '#586178',
                fontSize: '13.5px',
                borderRadius: '9px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.2s',
              }}>
              {selectedTarget ? selectedTarget : `Select ${type} —`}
            </button>
            {dropdownOpen && (
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
                {loading ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#8891a6', fontSize: '13px' }}>
                    Loading {type}s...
                  </div>
                ) : (type === 'profile' ? profiles : permsets).length === 0 ? (
                  <div style={{ padding: '16px', color: '#8891a6', fontSize: '13px' }}>
                    <div>No {type}s synced yet.</div>
                    <div style={{ fontSize: '12px', marginTop: '8px', color: '#586178' }}>
                      Go to Connect to sync your Salesforce org.
                    </div>
                  </div>
                ) : (
                  (type === 'profile' ? profiles : permsets).map((item, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTarget(item);
                        setDropdownOpen(false);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(27,115,232,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = selectedTarget === item.name ? 'rgba(27,115,232,0.12)' : 'transparent';
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 10px',
                        borderRadius: '7px',
                        color: '#d5dbe8',
                        fontSize: '13px',
                        cursor: 'pointer',
                        border: 'none',
                        background: selectedTarget === item.name ? 'rgba(27,115,232,0.12)' : 'transparent',
                        textAlign: 'left',
                        transition: 'background 0.12s',
                      }}>
                      {item.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setCompareMode(!compareMode)}
            disabled={!selectedTarget}
            style={{
              padding: '11px 16px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '9px',
              cursor: !selectedTarget ? 'not-allowed' : 'pointer',
              background: compareMode ? 'rgba(250,204,21,0.14)' : '#141b30',
              border: compareMode ? '1px solid rgba(245,158,11,0.3)' : '1px solid #262f47',
              color: compareMode ? '#facc15' : '#d5dbe8',
              transition: 'all 0.2s',
              opacity: !selectedTarget ? 0.5 : 1,
            }}
          >
            Compare
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button
              onClick={exportAsPDF}
              disabled={!selectedTarget || permissions.length === 0}
              style={{
                padding: '11px 16px',
                background: '#141b30',
                border: '1px solid #262f47',
                color: '#d5dbe8',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '9px',
                cursor: selectedTarget && permissions.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: selectedTarget && permissions.length > 0 ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
            >
              <Download size={14} />
              Export PDF
            </button>
            <button
              onClick={exportAsCSV}
              disabled={!selectedTarget || permissions.length === 0}
              style={{
                padding: '11px 16px',
                background: '#141b30',
                border: '1px solid #262f47',
                color: '#d5dbe8',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '9px',
                cursor: selectedTarget && permissions.length > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: selectedTarget && permissions.length > 0 ? 1 : 0.5,
                transition: 'all 0.2s',
              }}
            >
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

        {/* Permission Details */}
        {selectedTarget && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                {selectedTarget}
              </div>
              <div style={{ color: '#8891a6', fontSize: '13px' }}>
                {detailsLoading ? 'Loading permissions...' : `${permissions.length} object${permissions.length !== 1 ? 's' : ''} with permissions`}
              </div>
            </div>

            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8891a6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block' }}>
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.25"></circle>
                  <path d="M21 12a9 9 0 00-9-9"></path>
                </svg>
                Loading permissions...
              </div>
            ) : permissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8891a6', background: '#0e1426', borderRadius: '14px', border: '1px solid #1f2740' }}>
                No permissions found
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {permissions.map((perm, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#0e1426',
                      border: '1px solid #1f2740',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => toggleObjectExpanded(perm.objectName)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(27,115,232,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{perm.objectName}</span>
                      <ChevronDown
                        size={16}
                        color="#8891a6"
                        style={{
                          transform: expandedObjects.has(perm.objectName) ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>

                    {expandedObjects.has(perm.objectName) && (
                      <div style={{ borderTop: '1px solid #1f2740', padding: '12px 16px', background: 'rgba(27,115,232,0.04)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          {Object.entries(perm.permissions).map(([key, value]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '3px',
                                  background: value ? '#4ade80' : '#3a4562',
                                  flexShrink: 0,
                                }}
                              ></div>
                              <span style={{ fontSize: '12px', color: value ? '#d5dbe8' : '#586178' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          main {
            padding: 16px 20px 40px !important;
          }
        }
      `}</style>
    </div>
  );
}

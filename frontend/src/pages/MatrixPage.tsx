import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid3x3 } from 'lucide-react';

export function MatrixPage() {
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Object Permissions (CRUD)');
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [objectOpen, setObjectOpen] = useState(false);

  const categories = [
    'Object Permissions (CRUD)',
    'Field Permissions (FLS)',
    'Record Type Visibility',
    'Tab Visibility',
    'Apex Classes',
    'Visualforce Pages',
    'Custom Permissions',
    'System Permissions',
    'Connected Apps',
  ];

  const objects = ['Account', 'Contact', 'Opportunity', 'Lead', 'Case', 'Campaign', 'Contract', 'Invoice__c'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', background: '#020617' }}>
      {/* Header */}
      <header style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '0 28px',
        borderBottom: '1px solid rgba(148,163,184,0.1)',
        background: '#0b1020',
      }}>
        <Link
          to="/dashboard"
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
            textDecoration: 'none',
          }}
        >
          ←
        </Link>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '8px',
          background: 'rgba(34,197,94,0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Grid3x3 size={15} color="#4ade80" />
        </div>
        <div style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '700' }}>Permission Matrix X-Ray</div>
        <div style={{ flex: 1 }}></div>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            padding: '8px 14px',
            background: editMode ? 'rgba(27,115,232,0.14)' : '#141b30',
            border: '1px solid #262f47',
            color: editMode ? '#8fc0ff' : '#d5dbe8',
            fontSize: '12.5px',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Edit Mode
        </button>
      </header>

      {/* Main */}
      <main style={{ maxWidth: '7xl', margin: '0 auto', padding: '24px 40px 60px', flex: 1 }}>
        {/* Selectors */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <button
              onClick={() => {
                setCategoryOpen(!categoryOpen);
                setObjectOpen(false);
              }}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: '#0e1426',
                border: '1px solid #262f47',
                color: '#e2e8f0',
                fontSize: '13.5px',
                borderRadius: '9px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {selectedCategory}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7488" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {categoryOpen && (
              <div style={{
                position: 'absolute',
                top: '48px',
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
                {categories.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setCategoryOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '7px',
                      background: cat === selectedCategory ? 'rgba(27,115,232,0.16)' : 'transparent',
                      color: cat === selectedCategory ? '#fff' : '#d5dbe8',
                      fontSize: '13px',
                      cursor: 'pointer',
                      border: 'none',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <button
              onClick={() => {
                if (selectedCategory === 'Object Permissions (CRUD)') {
                  setObjectOpen(!objectOpen);
                  setCategoryOpen(false);
                }
              }}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: '#0e1426',
                border: '1px solid #262f47',
                color: selectedObject ? '#e2e8f0' : '#586178',
                fontSize: '13.5px',
                borderRadius: '9px',
                cursor: selectedCategory === 'Object Permissions (CRUD)' ? 'pointer' : 'not-allowed',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {selectedObject ? selectedObject : 'Select an object…'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7488" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {objectOpen && (
              <div style={{
                position: 'absolute',
                top: '48px',
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
                {objects.map((obj, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedObject(obj);
                      setObjectOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: '7px',
                      background: 'transparent',
                      color: '#d5dbe8',
                      fontSize: '13px',
                      cursor: 'pointer',
                      border: 'none',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {!selectedObject && (
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
              <Grid3x3 size={26} color="#586178" />
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
              Select an Object to Begin
            </div>
            <div style={{ color: '#8891a6', fontSize: '13.5px' }}>
              Choose an item above to audit who has access and from where.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

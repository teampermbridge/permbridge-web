import { Link } from 'react-router-dom';
import { ArrowRight, Zap, BarChart3, Grid3x3, Check } from 'lucide-react';

export function LandingPage() {
  return (
    <div style={{ width: '100%', background: '#020617', minHeight: '100vh' }}>
      {/* Nav */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 56px',
        background: 'rgba(2,6,23,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(148,163,184,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 96 96" fill="none">
            <rect x="0" y="0" width="96" height="96" rx="22" fill="#1B1F3B"></rect>
            <path d="M33 27 L33 69 M33 48 L58 27 M33 48 L60 69" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
            <circle cx="67" cy="25" r="8" fill="#1B73E8"></circle>
          </svg>
          <div style={{ color: '#f1f5f9', fontSize: '15.5px', fontWeight: '700' }}>
            Perm Bridge <span style={{ color: '#586178', fontWeight: '500' }}>by Kairos</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
          <div style={{ color: '#aab3c9', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Product</div>
          <div style={{ color: '#aab3c9', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Pricing</div>
          <div style={{ color: '#aab3c9', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Security</div>
          <div style={{ color: '#aab3c9', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Docs</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/login" style={{ color: '#d5dbe8', fontSize: '14px', fontWeight: '600', textDecoration: 'none', cursor: 'pointer' }}>Sign in</Link>
          <Link to="/login" style={{ background: '#1B73E8', color: '#fff', fontSize: '13.5px', fontWeight: '700', padding: '10px 18px', borderRadius: '9px', textDecoration: 'none' }}>Start free trial</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', padding: '96px 56px 80px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-160px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(27,115,232,0.16) 0%,rgba(27,115,232,0) 70%)',
        }}></div>
        <div style={{ position: 'relative', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(79,156,249,0.12)',
            border: '1px solid rgba(79,156,249,0.3)',
            color: '#8fc0ff',
            fontSize: '12.5px',
            fontWeight: '600',
            padding: '6px 14px',
            borderRadius: '20px',
            marginBottom: '26px',
          }}>
            <Zap size={13} />
            Built for any Salesforce permission model
          </div>
          <h1 style={{
            color: '#f8fafc',
            fontSize: '56px',
            lineHeight: '1.1',
            fontWeight: '800',
            letterSpacing: '-1.5px',
            margin: '0 0 22px',
          }}>
            Permission management, <br />finally under control.
          </h1>
          <p style={{
            color: '#9aa3ba',
            fontSize: '18px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 40px',
          }}>
            Convert Profiles into Permission Sets, get a comprehensive summary of any access grant, and cross-compare permissions across your whole org – in minutes, not sprints.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
            <Link to="/login" style={{
              background: '#1B73E8',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '700',
              padding: '14px 26px',
              borderRadius: '11px',
              textDecoration: 'none',
              boxShadow: '0 10px 28px -8px rgba(27,115,232,0.6)',
            }}>Start free trial</Link>
            <a href="#features" style={{
              background: '#141b30',
              border: '1px solid #262f47',
              color: '#d5dbe8',
              fontSize: '15px',
              fontWeight: '600',
              padding: '14px 24px',
              borderRadius: '11px',
              textDecoration: 'none',
            }}>See it in action</a>
          </div>
          <div style={{ color: '#586178', fontSize: '13px' }}>No credit card required · Read-only by default · SOC 2 Type II</div>
        </div>

        <div style={{
          position: 'relative',
          width: '1040px',
          height: '585px',
          margin: '64px auto 0',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #1f2740',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0e1426, #0b1020)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#586178',
          }}>
            [Matrix Preview]
          </div>
        </div>
      </div>

      {/* Logos */}
      <div style={{ padding: '0 56px 80px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: '#586178', fontSize: '12.5px', fontWeight: '600', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '24px' }}>
            Trusted by admins at 500+ Salesforce orgs
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '56px', flexWrap: 'wrap', opacity: '0.5' }}>
            <div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '700' }}>Northwind Cloud</div>
            <div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '700' }}>Acme Robotics</div>
            <div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '700' }}>Fairwind Health</div>
            <div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '700' }}>Delta Logistics</div>
            <div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '700' }}>Braid Financial</div>
          </div>
        </div>
      </div>

      {/* Problem */}
      <div style={{ padding: '0 56px 90px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#f87171', fontSize: '12.5px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>The problem</div>
            <h2 style={{ color: '#f1f5f9', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.6px', lineHeight: '1.2', margin: '0 0 18px' }}>
              Permissions are scattered across metadata nobody has time to read.
            </h2>
            <p style={{ color: '#9aa3ba', fontSize: '15.5px', lineHeight: '1.65' }}>
              ObjectPermissions, FieldPermissions, SystemPermissions, Custom Permissions, Tab Visibility – Salesforce spreads access control across a dozen metadata types. Most admins can tell you who has a Profile. Almost none can tell you, with confidence, exactly what that Profile grants.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { num: '79.5%', text: 'of orgs still haven\'t fully moved off Profile-based access' },
              { num: '312', text: 'average permissions bundled into a single Salesforce Profile' },
              { num: '0', text: 'native Salesforce tools for permission set conversion' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: '#0e1426',
                border: '1px solid #1f2740',
                borderRadius: '14px',
                padding: '20px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}>
                <div style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '800' }}>{stat.num}</div>
                <div style={{ color: '#8891a6', fontSize: '13px', lineHeight: '1.4' }}>{stat.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature 1: Converter */}
      <div style={{ padding: '80px 56px', background: '#0b1020', borderTop: '1px solid #1a2138', borderBottom: '1px solid #1a2138' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '56px', alignItems: 'center' }}>
          <div>
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
              <Zap size={21} color="#5b9cf0" />
            </div>
            <h3 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.4px', margin: '0 0 14px' }}>
              Profile → Permission Set Converter
            </h3>
            <p style={{ color: '#9aa3ba', fontSize: '15px', lineHeight: '1.65', margin: '0 0 22px' }}>
              PermBridge analyzes every object and field permission on a Profile and suggests logical, reusable Permission Sets – "Sales Core," "Reporting Access," "Admin Utilities" – not a 1:1 dump. Drag permissions between groups, rename, and convert with one click.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Converts a 100+ permission Profile in under 5 minutes',
                'Full rollback snapshot before every conversion',
                'Optional Permission Set Group bundling',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c3cadb', fontSize: '14px' }}>
                  <Check size={15} color="#4ade80" strokeWidth={3} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{
            width: '100%',
            height: '461px',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid #1f2740',
            boxShadow: '0 24px 60px -16px rgba(0,0,0,0.55)',
            background: 'linear-gradient(135deg, #0e1426, #0b1020)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#586178',
          }}>
            [Converter Preview]
          </div>
        </div>
      </div>

      {/* Feature 2: Summarizer */}
      <div style={{ padding: '80px 56px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '56px', alignItems: 'center' }}>
          <div style={{
            width: '100%',
            height: '461px',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid #1f2740',
            boxShadow: '0 24px 60px -16px rgba(0,0,0,0.55)',
            background: 'linear-gradient(135deg, #0e1426, #0b1020)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#586178',
            order: 2,
          }}>
            [Summarizer Preview]
          </div>
          <div style={{ order: 1 }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: 'rgba(139,92,246,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <BarChart3 size={21} color="#a78bfa" />
            </div>
            <h3 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.4px', margin: '0 0 14px' }}>
              Permission Set Summarizer
            </h3>
            <p style={{ color: '#9aa3ba', fontSize: '15px', lineHeight: '1.65', margin: '0 0 22px' }}>
              One search box, a complete answer. Objects, fields, system perms, assigned users, Apex classes, Visualforce, custom permissions, connected apps, tab settings – every dimension of a Profile or Permission Set in one place, with side-by-side comparison and PDF/CSV export.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Loads full detail in under 2 seconds',
                'Side-by-side diff between any two targets',
                'One-click PDF or CSV export for audits',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c3cadb', fontSize: '14px' }}>
                  <Check size={15} color="#4ade80" strokeWidth={3} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature 3: Matrix */}
      <div style={{ padding: '80px 56px', background: '#0b1020', borderTop: '1px solid #1a2138', borderBottom: '1px solid #1a2138' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '56px', alignItems: 'center' }}>
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '11px',
              background: 'rgba(34,197,94,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <Grid3x3 size={21} color="#4ade80" />
            </div>
            <h3 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.4px', margin: '0 0 14px' }}>
              Permission Matrix X-Ray
            </h3>
            <p style={{ color: '#9aa3ba', fontSize: '15px', lineHeight: '1.65', margin: '0 0 22px' }}>
              Pick an object, see every Profile and Permission Set that touches it – Read, Create, Edit, Delete, View All, Modify All – in one heatmap. Drill into exactly which users inherit each grant, and get flagged the moment a target drifts from your baseline.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'Renders 50 targets × any object without lag',
                'Drill down from Profile/PermSet into assigned Users',
                'Automatic conflict detection against your baseline',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c3cadb', fontSize: '14px' }}>
                  <Check size={15} color="#4ade80" strokeWidth={3} />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div style={{
            width: '100%',
            height: '461px',
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid #1f2740',
            boxShadow: '0 24px 60px -16px rgba(0,0,0,0.55)',
            background: 'linear-gradient(135deg, #0e1426, #0b1020)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#586178',
          }}>
            [Matrix Preview]
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ padding: '90px 56px' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{ color: '#8fc0ff', fontSize: '12.5px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>Pricing</div>
            <h2 style={{ color: '#f1f5f9', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.6px', margin: '0' }}>Simple, per-org pricing</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '22px' }}>
            {[
              { name: 'Starter', desc: 'For small teams cleaning up one org', price: '149', period: '/mo', features: '1 org · up to 100 users' },
              { name: 'Growth', desc: 'For admins managing multiple orgs', price: '449', period: '/mo', features: '5 orgs · up to 2,000 users', popular: true },
              { name: 'Enterprise', desc: 'For governance teams & consultancies', price: 'Custom', period: '', features: 'Unlimited orgs & users, SSO, SLA' },
            ].map((tier, i) => (
              <div key={i} style={{
                background: '#0e1426',
                border: tier.popular ? '1px solid #1B73E8' : '1px solid #1f2740',
                borderRadius: '16px',
                padding: '32px',
                position: 'relative',
                boxShadow: tier.popular ? '0 0 0 1px rgba(27,115,232,0.3), 0 20px 50px -20px rgba(27,115,232,0.35)' : 'none',
              }}>
                {tier.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-13px',
                    left: '32px',
                    background: '#1B73E8',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '20px',
                  }}>MOST POPULAR</div>
                )}
                <div style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{tier.name}</div>
                <div style={{ color: '#8891a6', fontSize: '13px', marginBottom: '22px' }}>{tier.desc}</div>
                <div style={{ color: '#f1f5f9', fontSize: '34px', fontWeight: '800', marginBottom: '4px' }}>
                  {tier.price}<span style={{ color: '#586178', fontSize: '15px', fontWeight: '600' }}>{tier.period}</span>
                </div>
                <div style={{ color: '#586178', fontSize: '12.5px', marginBottom: '24px' }}>{tier.features}</div>
                <Link to="/login" style={{
                  display: 'block',
                  textAlign: 'center',
                  background: tier.popular ? '#1B73E8' : '#141b30',
                  border: tier.popular ? 'none' : '1px solid #262f47',
                  color: tier.popular ? '#fff' : '#d5dbe8',
                  fontSize: tier.popular ? '14px' : '14px',
                  fontWeight: tier.popular ? '700' : '600',
                  padding: '11px 16px',
                  borderRadius: '9px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}>
                  {tier.name === 'Enterprise' ? 'Talk to sales' : 'Start free trial'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{
        padding: '90px 56px',
        textAlign: 'center',
        background: 'linear-gradient(160deg,#1B1F3B 0%,#0d1026 60%,#020617 100%)',
      }}>
        <h2 style={{ color: '#f8fafc', fontSize: '34px', fontWeight: '800', letterSpacing: '-0.6px', margin: '0 0 16px' }}>
          Know exactly what your org can access.
        </h2>
        <p style={{ color: '#9aa3ba', fontSize: '16px', margin: '0 0 32px' }}>
          Connect an org and see your first Permission Matrix in under 10 minutes.
        </p>
        <Link to="/login" style={{
          background: '#1B73E8',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '700',
          padding: '14px 28px',
          borderRadius: '11px',
          textDecoration: 'none',
          display: 'inline-block',
        }}>Start free trial</Link>
      </div>

      {/* Footer */}
      <div style={{
        padding: '36px 56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid #1a2138',
      }}>
        <div style={{ color: '#586178', fontSize: '13px' }}>© 2026 Kairos Apps · Perm Bridge</div>
        <div style={{ display: 'flex', gap: '28px', color: '#586178', fontSize: '13px' }}>
          <div style={{ cursor: 'pointer' }}>Privacy</div>
          <div style={{ cursor: 'pointer' }}>Security</div>
          <div style={{ cursor: 'pointer' }}>Status</div>
        </div>
      </div>
    </div>
  );
}

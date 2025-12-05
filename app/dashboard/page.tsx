'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiHome, FiFileText, FiUser, FiCheck, FiClock, FiMail } from 'react-icons/fi';
import DashboardHeader from '@/components/DashboardHeader';

interface User {
  id: string;
  email: string;
  fullName: string;
  unitId: string | null;
}

interface Unit {
  id: string;
  identifier: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('obvote_user');
    if (!userStr) {
      window.location.href = '/';
      return;
    }

    try {
      const userData = JSON.parse(userStr) as User;
      setUser(userData);

      if (userData.unitId) {
        fetchUnitInfo(userData.unitId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      window.location.href = '/';
    }
  }, []);

  const fetchUnitInfo = async (unitId: string) => {
    try {
      const response = await fetch('/api/admin/units');
      if (response.ok) {
        const data = await response.json();
        const foundUnit = data.units.find((u: Unit) => u.id === unitId);
        if (foundUnit) {
          setUnit(foundUnit);
        }
      }
    } catch (error) {
      console.error('Error fetching unit info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('obvote_session');
    localStorage.removeItem('obvote_user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid #e0e0e0',
            borderTopColor: '#1a73e8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <DashboardHeader onSignOut={handleSignOut} />

      {/* Main */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 400, color: '#000', marginBottom: '8px' }}>
            Welcome, {user.fullName.split(' ')[0]}
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>Your resident dashboard</p>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>

          {/* Unit Card */}
          <div style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '32px',
            gridColumn: 'span 2'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#1a73e8',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FiHome size={32} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '16px', color: '#000' }}>
                  Your Apartment
                </h2>
                {unit ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span style={{ fontSize: '32px', fontWeight: 600, color: '#1a73e8' }}>
                        Unit {unit.identifier}
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}>
                        <FiCheck size={14} />
                        Verified
                      </span>
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                      Registered {new Date(unit.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      <span style={{ fontSize: '20px', color: '#666' }}>No unit assigned</span>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#fff3e0',
                        color: '#e65100',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 500
                      }}>
                        <FiClock size={14} />
                        Pending
                      </span>
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                      Contact your building administrator to get assigned to your unit.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Account Card */}
          <div style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#34a853',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiUser size={24} color="#fff" />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#000' }}>Account</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ paddingBottom: '16px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999', marginBottom: '4px' }}>
                  Full Name
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#000' }}>{user.fullName}</div>
              </div>

              <div style={{ paddingBottom: '16px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999', marginBottom: '4px' }}>
                  Email
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#000', wordBreak: 'break-all' }}>{user.email}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999', marginBottom: '8px' }}>
                  Status
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  <FiCheck size={14} />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Petitions */}
        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '48px 32px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#f5f5f5',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <FiFileText size={32} color="#ccc" />
          </div>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px' }}>
            No active petitions at the moment
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: '#1a73e8',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1666d6'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#1a73e8'}
          >
            <FiFileText size={16} />
            Browse Petitions
          </Link>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1a73e8';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#f5f5f5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FiFileText size={24} color="#1a73e8" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#000', marginBottom: '2px' }}>
                Browse Petitions
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                View community proposals
              </div>
            </div>
          </Link>

          <Link
            href="/#contact"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              background: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1a73e8';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: '#f5f5f5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FiMail size={24} color="#1a73e8" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#000', marginBottom: '2px' }}>
                Contact Board
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Message management
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#fff',
        borderTop: '1px solid #e0e0e0',
        marginTop: '64px',
        padding: '32px 24px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '13px', color: '#666' }}>
          © 2025 ObVote • Streamlined voting for condo communities
        </p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
          NYS e-signature compliant • Secure • Transparent
        </p>
      </footer>
    </div>
  );
}

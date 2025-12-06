'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiLogOut, FiChevronDown } from 'react-icons/fi';
import Logo from './Logo';

interface LandingHeaderProps {
  onSignInClick: () => void;
  onSignUpClick: () => void;
  onAuthStateChange?: (isSignedIn: boolean, userName: string) => void;
}

export default function LandingHeader({ onSignInClick, onSignUpClick, onAuthStateChange }: LandingHeaderProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('obvote_user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const fullName = userData.fullName || '';
        const firstName = fullName.split(' ')[0];
        setIsSignedIn(true);
        setUserName(firstName);
        onAuthStateChange?.(true, fullName);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [onAuthStateChange]);

  const handleSignOut = () => {
    localStorage.removeItem('obvote_session');
    localStorage.removeItem('obvote_user');
    setIsSignedIn(false);
    setUserName('');
    onAuthStateChange?.(false, '');
    window.location.reload();
  };

  const navLinks = [
    { href: '#updates', label: 'Updates' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#petitions', label: 'Petitions' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header style={{ borderBottom: '1px solid #e8eaed', background: 'white' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <Logo size="medium" showTagline />

        {/* Navigation - Always visible */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            color: '#5f6368',
            fontSize: '14px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: '#5f6368',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#202124';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#5f6368';
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons / User Menu */}
        {!isSignedIn ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onSignInClick}
              style={{
                padding: '8px 18px',
                fontSize: '14px',
                background: 'transparent',
                border: '1px solid #dadce0',
                color: '#5f6368',
                cursor: 'pointer',
                fontWeight: 500,
                borderRadius: '8px',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#202124';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#5f6368';
              }}
            >
              Sign in
            </button>
            <button
              onClick={onSignUpClick}
              className="btn btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 500,
                borderRadius: '8px',
              }}
            >
              Register
            </button>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#f8f9fa',
                border: '1px solid #e8eaed',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                color: '#202124',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f3f4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <span>{userName}</span>
              <FiChevronDown size={16} />
            </button>

            {showDropdown && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 999,
                  }}
                  onClick={() => setShowDropdown(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: 'white',
                    border: '1px solid #e8eaed',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    minWidth: '200px',
                    zIndex: 1000,
                  }}
                >
                  <Link
                    href="/dashboard"
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      color: '#202124',
                      textDecoration: 'none',
                      fontSize: '14px',
                      borderBottom: '1px solid #e8eaed',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      color: '#ea4335',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fce8e6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                    }}
                  >
                    <FiLogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import { FiX, FiMail, FiLock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export default function SignInModal({ isOpen, onClose, onSuccess, onForgotPassword }: SignInModalProps) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('obvote_session', JSON.stringify(data.session));
        localStorage.setItem('obvote_user', JSON.stringify(data.user));
        setMessage({ type: 'success', text: 'Signed in successfully!' });
        setTimeout(() => {
          onSuccess();
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to sign in' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 500, margin: 0, color: '#202124' }}>Sign In</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <FiX size={24} color="#5f6368" />
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
              border: `1px solid ${message.type === 'success' ? '#34a853' : '#ea4335'}`,
              color: message.type === 'success' ? '#137333' : '#c5221f',
              fontSize: '14px',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#202124' }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1a73e8'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#dadce0'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#202124' }}>
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#1a73e8'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#dadce0'}
            />
          </div>

          <button
            type="button"
            onClick={onForgotPassword}
            style={{
              background: 'none',
              border: 'none',
              color: '#1a73e8',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '20px',
              padding: 0,
              fontWeight: 500,
            }}
          >
            Forgot password?
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              fontWeight: 500,
              marginBottom: '12px',
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{
            position: 'relative',
            textAlign: 'center',
            margin: '20px 0',
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: '#e8eaed',
            }} />
            <span style={{
              position: 'relative',
              background: 'white',
              padding: '0 12px',
              fontSize: '13px',
              color: '#5f6368',
            }}>
              or
            </span>
          </div>

          <button
            type="button"
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              color: '#202124',
              border: '1px solid #dadce0',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}

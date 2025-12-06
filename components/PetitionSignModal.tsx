'use client';

import { useState } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

interface Petition {
  id: string;
  title: string;
  content: string;
  version: number;
}

interface UserInfo {
  id: string;
  email: string;
  fullName: string;
}

interface PetitionSignModalProps {
  petition: Petition | null;
  userInfo: UserInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PetitionSignModal({
  petition,
  userInfo,
  isOpen,
  onClose,
  onSuccess,
}: PetitionSignModalProps) {
  const [consentChecked, setConsentChecked] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !petition || !userInfo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consentChecked) {
      setMessage({ type: 'error', text: 'You must agree to sign the petition' });
      return;
    }

    if (typedSignature.trim().toLowerCase() !== userInfo.fullName.toLowerCase()) {
      setMessage({
        type: 'error',
        text: 'Typed signature must match your full name exactly',
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/petitions/${petition.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.id,
          userEmail: userInfo.email,
          userFullName: userInfo.fullName,
          consentChecked,
          typedSignature: typedSignature.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Petition signed successfully!' });
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to sign petition' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConsentChecked(false);
    setTypedSignature('');
    setMessage(null);
    onClose();
  };

  const isValid = consentChecked && typedSignature.trim().toLowerCase() === userInfo.fullName.toLowerCase();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        padding: '20px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 28px',
            borderBottom: '1px solid #e8eaed',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 500, margin: 0, color: '#202124' }}>
              Sign Petition
            </h2>
            <p style={{ fontSize: '14px', color: '#5f6368', margin: '4px 0 0', fontWeight: 400 }}>
              {petition.title}
            </p>
          </div>
          <button
            onClick={handleClose}
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
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <FiX size={24} color="#5f6368" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '28px' }}>
          {message && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                background: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
                border: `1px solid ${message.type === 'success' ? '#34a853' : '#ea4335'}`,
                color: message.type === 'success' ? '#137333' : '#c5221f',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {message.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Consent Checkbox */}
            <label
              style={{
                display: 'flex',
                gap: '12px',
                cursor: 'pointer',
                marginBottom: '20px',
                alignItems: 'flex-start',
              }}
            >
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                style={{
                  flexShrink: 0,
                  marginTop: '3px',
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary)',
                }}
              />
              <span style={{ fontSize: '14px', lineHeight: '1.6', color: '#5f6368' }}>
                I have read this petition and agree to sign it.
              </span>
            </label>

            {/* Signature Input */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: '#202124',
                }}
              >
                Type your full name to sign <span style={{ color: '#ea4335' }}>*</span>
              </label>
              <input
                type="text"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                placeholder={userInfo.fullName}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #dadce0',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
              />
              <p style={{ fontSize: '12px', color: '#5f6368', marginTop: '6px' }}>
                Must exactly match: <strong style={{ color: '#202124' }}>{userInfo.fullName}</strong>
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  border: '1px solid #dadce0',
                  color: '#5f6368',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="btn btn-primary"
                style={{
                  padding: '12px 32px',
                  background: isValid && !submitting ? 'var(--primary)' : '#dadce0',
                  color: isValid && !submitting ? 'white' : '#80868b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: isValid && !submitting ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Signing...' : 'Sign Petition'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

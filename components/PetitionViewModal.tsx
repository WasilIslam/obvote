'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import Image from 'next/image';
import PetitionCardImage from './PetitionCardImage';

interface Petition {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  version: number;
  signatureCount: number;
  createdAt: string;
}

interface PetitionViewModalProps {
  petition: Petition | null;
  isOpen: boolean;
  onClose: () => void;
  onSignClick: () => void;
  isSignedIn: boolean;
  userAlreadySigned?: boolean;
}

export default function PetitionViewModal({
  petition,
  isOpen,
  onClose,
  onSignClick,
  isSignedIn,
  userAlreadySigned = false,
}: PetitionViewModalProps) {
  if (!isOpen || !petition) return null;

  const handleClose = () => {
    onClose();
  };

  const formattedDate = new Date(petition.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          margin: 'auto',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
          }}
        >
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)')}
          >
            <FiX size={24} color="#5f6368" />
          </button>
        </div>

        {/* Petition Image */}
        <div style={{ position: 'relative', width: '100%', height: '280px', overflow: 'hidden' }}>
          <PetitionCardImage
            title={petition.title}
            createdAt={petition.createdAt}
            imageUrl={petition.imageUrl}
          />
          {userAlreadySigned && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: '#34a853',
                color: 'white',
                borderRadius: '24px',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <FiCheck size={16} strokeWidth={3} />
              Already Signed
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {/* Meta Info */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: '1px solid #e8eaed',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#5f6368' }}>
              <FiTrendingUp size={18} />
              <span style={{ fontSize: '15px' }}>
                <strong style={{ color: '#202124' }}>{petition.signatureCount.toLocaleString()}</strong> signatures
              </span>
            </div>
          </div>

          {/* Content */}
          <div
            style={{
              fontSize: '16px',
              lineHeight: '1.8',
              color: '#202124',
              whiteSpace: 'pre-wrap',
              marginBottom: '32px',
            }}
          >
            {petition.content}
          </div>
        </div>

        {/* Action Footer */}
        <div
          style={{
            borderTop: '1px solid #e8eaed',
            padding: '24px 32px',
            background: '#fafbfc',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {userAlreadySigned ? (
            <>
              <div style={{ flex: 1, fontSize: '14px', color: '#5f6368' }}>
                <FiCheck size={16} style={{ display: 'inline', marginRight: '6px', color: '#34a853' }} />
                You've already signed this petition
              </div>
              <button
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
                Close
              </button>
            </>
          ) : (
            <>
              <button
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
                onClick={onSignClick}
                className="btn btn-primary"
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(26,115,232,0.3)',
                }}
              >
                {isSignedIn ? 'Continue to Sign' : 'Sign In to Sign'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

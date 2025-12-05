'use client';

import Link from 'next/link';
import { FiFileText } from 'react-icons/fi';

interface LogoProps {
  href?: string;
  size?: 'small' | 'medium' | 'large';
  showTagline?: boolean;
}

export default function Logo({ href = '/', size = 'medium', showTagline = false }: LogoProps) {
  const sizeConfig = {
    small: { iconBox: 32, iconSize: 16, fontSize: 16, taglineSize: 11 },
    medium: { iconBox: 40, iconSize: 20, fontSize: 20, taglineSize: 13 },
    large: { iconBox: 48, iconSize: 24, fontSize: 24, taglineSize: 14 },
  };

  const config = sizeConfig[size];

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none',
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: `${config.iconBox}px`,
          height: `${config.iconBox}px`,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(26,115,232,0.18)',
        }}
      >
        <FiFileText size={config.iconSize} style={{ color: 'white' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontSize: `${config.fontSize}px`,
            fontWeight: 600,
            letterSpacing: '-0.2px',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          ObVote
        </span>
        {showTagline && (
          <span style={{ fontSize: `${config.taglineSize}px`, color: 'var(--text-secondary)' }}>
            Resident engagement, simplified
          </span>
        )}
      </div>
    </Link>
  );
}

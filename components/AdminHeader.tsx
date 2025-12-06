'use client';

import Link from 'next/link';
import { FiKey, FiMail, FiFileText, FiSettings, FiUsers } from 'react-icons/fi';
import Logo from './Logo';

export default function AdminHeader() {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid var(--background-divider)',
      padding: '16px 40px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px'
      }}>
        <Logo href="/admin" size="small" />

        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link
            href="/admin/petitions"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background-soft)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <FiFileText size={16} />
            Petitions
          </Link>
          <Link
            href="/admin/units"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background-soft)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <FiKey size={16} />
            Units & Codes
          </Link>
          <Link
            href="/admin/users"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background-soft)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <FiUsers size={16} />
            Users
          </Link>
          <Link
            href="/admin/contact-form-submissions"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background-soft)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <FiMail size={16} />
            Contact Forms
          </Link>
          <Link
            href="/admin/settings"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--background-soft)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <FiSettings size={16} />
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}

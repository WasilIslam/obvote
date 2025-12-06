'use client';

import Link from 'next/link';
import { FiKey, FiMail, FiFileText, FiUsers, FiBarChart2, FiSettings } from 'react-icons/fi';
import styles from './page.module.css';

export default function AdminPage() {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Manage your ObVote platform</p>
      </div>

      <div className={styles.grid}>
        <Link href="/admin/petitions" className={styles.card}>
          <div className={styles.cardIcon}>
            <FiFileText size={32} />
          </div>
          <h2 className={styles.cardTitle}>Petitions</h2>
          <p className={styles.cardDescription}>
            Create and manage petitions with cryptographically-secure signatures and full audit trails.
          </p>
        </Link>

        <Link href="/admin/units" className={styles.card}>
          <div className={styles.cardIcon}>
            <FiKey size={32} />
          </div>
          <h2 className={styles.cardTitle}>Units & Registration Codes</h2>
          <p className={styles.cardDescription}>
            Manage apartment units and their registration codes. Create, view, and delete units and codes.
          </p>
        </Link>

        <Link href="/admin/contact-form-submissions" className={styles.card}>
          <div className={styles.cardIcon}>
            <FiMail size={32} />
          </div>
          <h2 className={styles.cardTitle}>Contact Form Submissions</h2>
          <p className={styles.cardDescription}>
            View and manage contact form submissions from residents and visitors.
          </p>
        </Link>

        <Link href="/admin/settings" className={styles.card}>
          <div className={styles.cardIcon}>
            <FiSettings size={32} />
          </div>
          <h2 className={styles.cardTitle}>Landing Page Settings</h2>
          <p className={styles.cardDescription}>
            Manage banner and recent updates displayed on the landing page.
          </p>
        </Link>

        <Link href="/admin/users" className={styles.card}>
          <div className={styles.cardIcon}>
            <FiUsers size={32} />
          </div>
          <h2 className={styles.cardTitle}>User Management</h2>
          <p className={styles.cardDescription}>
            View registered users, their units, and registration codes used.
          </p>
        </Link>

        <div className={styles.cardDisabled}>
          <div className={styles.cardIcon}>
            <FiBarChart2 size={32} />
          </div>
          <h2 className={styles.cardTitle}>Analytics & Reports</h2>
          <p className={styles.cardDescription}>
            View platform statistics, user engagement, and generate reports.
          </p>
          <span className={styles.comingSoon}>Coming Soon</span>
        </div>
      </div>
    </main>
  );
}

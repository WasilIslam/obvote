'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiUsers, FiFileText, FiChevronDown, FiChevronRight, FiClock } from 'react-icons/fi';
import styles from './page.module.css';

interface Petition {
  id: string;
  title: string;
  content: string;
  version: number;
  contentHash: string | null;
  isActive: boolean;
  createdAt: string;
  signatureCount: number;
}

interface Signature {
  eventId: string;
  userFullName: string;
  signedAtUtc: string;
  petitionVersionSigned: number;
}

export default function AdminPetitionsPage() {
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Record<string, Signature[]>>({});
  const [loadingSignatures, setLoadingSignatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPetitions();
  }, []);

  const fetchPetitions = async () => {
    try {
      const response = await fetch('/api/petitions');
      if (response.ok) {
        const data = await response.json();
        setPetitions(data.petitions || []);
      }
    } catch (error) {
      console.error('Error fetching petitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSignatures = async (petitionId: string) => {
    if (signatures[petitionId]) return; // Already loaded

    setLoadingSignatures((prev) => ({ ...prev, [petitionId]: true }));
    try {
      const response = await fetch(`/api/petitions/${petitionId}/sign`);
      if (response.ok) {
        const data = await response.json();
        setSignatures((prev) => ({ ...prev, [petitionId]: data.signatures }));
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
    } finally {
      setLoadingSignatures((prev) => ({ ...prev, [petitionId]: false }));
    }
  };

  const toggleExpand = (petitionId: string) => {
    if (expandedId === petitionId) {
      setExpandedId(null);
    } else {
      setExpandedId(petitionId);
      fetchSignatures(petitionId);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Petitions</h1>
          <p className={styles.subtitle}>Manage petitions and view signatures</p>
        </div>
        <Link href="/admin/petitions/create" className={styles.createBtn}>
          <FiPlus size={18} />
          Create Petition
        </Link>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading petitions...</p>
        </div>
      ) : petitions.length === 0 ? (
        <div className={styles.empty}>
          <FiFileText size={48} />
          <p>No petitions yet. Create your first petition to get started.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {petitions.map((petition) => {
            const isExpanded = expandedId === petition.id;
            const petitionSignatures = signatures[petition.id] || [];
            const isLoadingSigs = loadingSignatures[petition.id];

            return (
              <div key={petition.id} className={styles.petitionCard}>
                <div className={styles.petitionHeader} onClick={() => toggleExpand(petition.id)}>
                  <button className={styles.expandBtn}>
                    {isExpanded ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
                  </button>
                  <div className={styles.petitionInfo}>
                    <h3 className={styles.petitionTitle}>{petition.title}</h3>
                    <div className={styles.petitionMeta}>
                      <span className={styles.badge}>
                        <FiUsers size={14} />
                        {petition.signatureCount} {petition.signatureCount === 1 ? 'signature' : 'signatures'}
                      </span>
                      <span className={styles.metaText}>
                        <FiClock size={14} />
                        Created {new Date(petition.createdAt).toLocaleDateString()}
                      </span>
                      <span className={styles.metaText}>Version {petition.version}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expandedContent}>
                    <div className={styles.contentSection}>
                      <h4>Petition Content</h4>
                      <p className={styles.content}>{petition.content}</p>
                      {petition.contentHash && (
                        <p className={styles.hash}>
                          <strong>Content Hash:</strong> <code>{petition.contentHash}</code>
                        </p>
                      )}
                    </div>

                    <div className={styles.signaturesSection}>
                      <h4>Signatures ({petition.signatureCount})</h4>
                      {isLoadingSigs ? (
                        <p className={styles.loadingText}>Loading signatures...</p>
                      ) : petitionSignatures.length === 0 ? (
                        <p className={styles.emptyText}>No signatures yet</p>
                      ) : (
                        <div className={styles.signaturesList}>
                          {petitionSignatures.map((sig) => (
                            <div key={sig.eventId} className={styles.signatureItem}>
                              <div className={styles.sigName}>{sig.userFullName}</div>
                              <div className={styles.sigDate}>
                                {new Date(sig.signedAtUtc).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

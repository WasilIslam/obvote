'use client';

import { useState } from 'react';
import { FiFileText, FiSave, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CreatePetitionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/petitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          imageUrl: imageUrl || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Petition created successfully!' });
        setTimeout(() => {
          router.push('/admin/petitions');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create petition' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Petition</h1>
        <p className={styles.subtitle}>Create a petition that residents can sign</p>
      </div>

      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className={styles.messageClose}>
            <FiX size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Petition Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Rooftop Garden Installation"
            required
            className={styles.input}
          />
          <p className={styles.hint}>Keep it clear and concise</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Image URL (optional)
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={styles.input}
          />
          <p className={styles.hint}>
            Add an image to make the petition more engaging. Leave blank for placeholder image.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Petition Content <span className={styles.required}>*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the full petition content here. This is what residents will read and sign..."
            required
            rows={15}
            className={styles.textarea}
          />
          <p className={styles.hint}>
            Be detailed and specific. This content will be cryptographically hashed when residents sign.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={submitting} className={styles.submitBtn}>
            <FiSave size={18} />
            {submitting ? 'Creating...' : 'Create Petition'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/petitions')}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className={styles.infoBox}>
        <FiFileText size={24} />
        <div>
          <h3>About Petition Signatures</h3>
          <p>
            Signatures on petitions are cryptographically secured and legally compliant. Each signature
            includes a timestamp, user verification, and consent checkbox for full audit trail.
          </p>
        </div>
      </div>
    </main>
  );
}

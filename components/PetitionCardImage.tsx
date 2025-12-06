'use client';

import { useMemo } from 'react';

interface PetitionCardImageProps {
  title: string;
  createdAt: string;
  imageUrl?: string | null;
}

export default function PetitionCardImage({ title, createdAt, imageUrl }: PetitionCardImageProps) {
  const gradientData = useMemo(() => {
    // Generate consistent gradient based on title hash
    const hash = title.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const documentColors = [
      'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', // Light blue
      'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)', // Light gray
      'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)', // Light indigo
      'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', // Light purple
      'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)', // Light teal
      'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', // Light green
      'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)', // Light pink
      'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', // Light orange
      'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)', // Blue gray
      'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)', // Light lime
    ];

    return documentColors[Math.abs(hash) % documentColors.length];
  }, [title]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncatedTitle = title.length > 70 ? title.substring(0, 67) + '...' : title;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        overflow: 'hidden',
        background: imageUrl ? '#f5f5f5' : gradientData,
      }}
    >
      {/* Background Image or Document Pattern */}
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Dark overlay for text contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
            }}
          />
        </>
      ) : (
        /* Document-style lines for generated images */
        <div style={{
          position: 'absolute',
          inset: 0,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ width: '60%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} />
          <div style={{ width: '80%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} />
          <div style={{ width: '70%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} />
          <div style={{ width: '90%', height: '8px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px' }} />
        </div>
      )}

      {/* Content Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '20px',
          background: imageUrl ? 'transparent' : 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%)',
        }}
      >
        <h4
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'white',
            lineHeight: 1.4,
            marginBottom: '8px',
            textShadow: imageUrl ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.5)',
          }}
        >
          {truncatedTitle}
        </h4>
        <span
          style={{
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 500,
            textShadow: imageUrl ? '0 1px 4px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.4)',
          }}
        >
          {formatDate(createdAt)}
        </span>
      </div>
    </div>
  );
}

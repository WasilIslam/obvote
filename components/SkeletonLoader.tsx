import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'hero' | 'section';
  count?: number;
}

export default function SkeletonLoader({ variant = 'text', count = 1 }: SkeletonLoaderProps) {
  const baseStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
  };

  const renderSkeleton = () => {
    switch (variant) {
      case 'hero':
        return (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 60px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '64px',
              alignItems: 'center',
              marginBottom: '120px'
            }}>
              <div>
                <div style={{ ...baseStyle, height: '48px', width: '90%', marginBottom: '20px' }} />
                <div style={{ ...baseStyle, height: '24px', width: '100%', marginBottom: '12px' }} />
                <div style={{ ...baseStyle, height: '24px', width: '80%', marginBottom: '32px' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ ...baseStyle, height: '44px', width: '140px' }} />
                  <div style={{ ...baseStyle, height: '44px', width: '140px' }} />
                </div>
              </div>
              <div style={{ ...baseStyle, height: '400px', width: '100%' }} />
            </div>
          </div>
        );

      case 'section':
        return (
          <div style={{ marginBottom: '120px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ ...baseStyle, height: '36px', width: '300px', margin: '0 auto 12px' }} />
              <div style={{ ...baseStyle, height: '20px', width: '500px', margin: '0 auto', maxWidth: '90%' }} />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '48px'
            }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  background: 'white',
                  padding: '32px 28px',
                  borderRadius: '12px',
                  border: '1px solid #e8eaed'
                }}>
                  <div style={{ ...baseStyle, height: '56px', width: '56px', marginBottom: '20px' }} />
                  <div style={{ ...baseStyle, height: '24px', width: '80%', marginBottom: '12px' }} />
                  <div style={{ ...baseStyle, height: '16px', width: '100%', marginBottom: '8px' }} />
                  <div style={{ ...baseStyle, height: '16px', width: '90%' }} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'card':
        return (
          <>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} style={{
                background: 'white',
                border: '1px solid #dadce0',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <div style={{ ...baseStyle, height: '180px', width: '100%', borderRadius: '0' }} />
                <div style={{ padding: '20px' }}>
                  <div style={{ ...baseStyle, height: '20px', width: '90%', marginBottom: '10px' }} />
                  <div style={{ ...baseStyle, height: '16px', width: '100%', marginBottom: '8px' }} />
                  <div style={{ ...baseStyle, height: '16px', width: '70%' }} />
                </div>
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e8eaed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ ...baseStyle, height: '16px', width: '100px' }} />
                  <div style={{ ...baseStyle, height: '36px', width: '100px' }} />
                </div>
              </div>
            ))}
          </>
        );

      case 'text':
      default:
        return (
          <>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} style={{ ...baseStyle, height: '20px', width: '100%', marginBottom: '12px' }} />
            ))}
          </>
        );
    }
  };

  return renderSkeleton();
}

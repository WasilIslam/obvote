'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiX, FiCheckCircle, FiUsers, FiMail, FiEdit3, FiCheck, FiTrendingUp } from 'react-icons/fi';
import LandingHeader from '@/components/LandingHeader';
import SignInModal from '@/components/SignInModal';
import PetitionViewModal from '@/components/PetitionViewModal';
import PetitionSignModal from '@/components/PetitionSignModal';
import landingContent from '@/content/landing.json';

interface Petition {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  version: number;
  contentHash: string;
  signatureCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [loadingPetitions, setLoadingPetitions] = useState(true);
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [userSignedPetitions, setUserSignedPetitions] = useState<Set<string>>(new Set());
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('obvote_user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setIsSignedIn(true);
        setUserName(userData.fullName || '');
        setCurrentUser(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchPetitions();
  }, []);

  useEffect(() => {
    if (isSignedIn && currentUser) {
      fetchUserSignatures();
    }
  }, [isSignedIn, currentUser]);

  const fetchPetitions = async () => {
    try {
      setLoadingPetitions(true);
      const response = await fetch('/api/petitions');
      const data = await response.json();

      if (response.ok && data.petitions) {
        setPetitions(data.petitions);
      }
    } catch (error) {
      console.error('Error fetching petitions:', error);
    } finally {
      setLoadingPetitions(false);
    }
  };

  const fetchUserSignatures = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`/api/user/signatures?userId=${currentUser.id}`);
      const data = await response.json();

      if (response.ok && data.signatures) {
        const signedIds = new Set<string>(data.signatures.map((sig: any) => sig.petitionId as string));
        setUserSignedPetitions(signedIds);
      }
    } catch (error) {
      console.error('Error fetching user signatures:', error);
    }
  };

  const handleViewPetition = (petition: Petition) => {
    setSelectedPetition(petition);
    setShowViewModal(true);
  };

  const handleContinueToSign = () => {
    if (!isSignedIn) {
      setShowViewModal(false);
      setShowSignInModal(true);
      return;
    }
    setShowViewModal(false);
    setShowSignModal(true);
  };

  // Auth state
  const [signUpForm, setSignUpForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    registrationCode: ''
  });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
    unitNumber: '',
    subject: '',
    phone: ''
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactMessage, setContactMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const closeSignUpModal = () => {
    setShowSignUpModal(false);
    setSignUpForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      registrationCode: ''
    });
    setAuthMessage(null);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (response.ok) {
        setContactMessage({ type: 'success', text: data.message });
        setContactForm({
          name: '',
          email: '',
          message: '',
          unitNumber: '',
          subject: '',
          phone: ''
        });
      } else {
        setContactMessage({ type: 'error', text: data.error || 'Failed to send message' });
      }
    } catch (error) {
      setContactMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthMessage(null);

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setAuthMessage({ type: 'error', text: 'Passwords do not match' });
      setAuthSubmitting(false);
      return;
    }

    if (signUpForm.password.length < 8) {
      setAuthMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      setAuthSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signUpForm.email,
          password: signUpForm.password,
          fullName: signUpForm.fullName,
          phone: signUpForm.phone || null,
          registrationCode: signUpForm.registrationCode || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('obvote_session', JSON.stringify(data.session));
        localStorage.setItem('obvote_user', JSON.stringify(data.user));

        setAuthMessage({ type: 'success', text: 'Account created successfully!' });
        setTimeout(() => {
          setShowSignUpModal(false);
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setAuthMessage({ type: 'error', text: data.error || 'Failed to create account' });
      }
    } catch (error) {
      setAuthMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <>
      {/* Updates Banner */}
      {showBanner && (
        <div style={{
          background: '#e8f4fd',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontSize: '14px',
          color: '#1a73e8',
          borderBottom: '1px solid #d2e3fc'
        }}>
          <p style={{ margin: 0, textAlign: 'center', fontWeight: 500 }}>
            {landingContent.banner.text}
          </p>
          <button
            onClick={() => setShowBanner(false)}
            style={{
              position: 'absolute',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              color: '#1a73e8',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26,115,232,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            aria-label="Dismiss"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      <LandingHeader
        onSignInClick={() => setShowSignInModal(true)}
        onSignUpClick={() => setShowSignUpModal(true)}
        onAuthStateChange={(signedIn, name) => {
          setIsSignedIn(signedIn);
          setUserName(name);
        }}
      />

      {/* Hero Section */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px 60px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '64px',
          alignItems: 'center',
          marginBottom: '120px'
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(36px, 5vw, 48px)',
              fontWeight: 400,
              marginBottom: '20px',
              color: '#202124',
              lineHeight: 1.2
            }}>
              {landingContent.hero.title}
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#5f6368',
              marginBottom: '32px',
              lineHeight: 1.6,
              fontWeight: 400
            }}>
              {landingContent.hero.subtitle}
            </p>
            {!isSignedIn && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowSignUpModal(true)}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 32px',
                    fontSize: '15px',
                    fontWeight: 500,
                    boxShadow: '0 1px 2px rgba(26,115,232,0.3)'
                  }}
                >
                  {landingContent.hero.ctaPrimary}
                </button>
                <a
                  href="#how-it-works"
                  style={{
                    padding: '12px 32px',
                    fontSize: '15px',
                    background: 'transparent',
                    border: '1px solid #dadce0',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {landingContent.hero.ctaSecondary}
                </a>
              </div>
            )}
          </div>
          <div style={{
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Image
              src="/imgs/dashboard-3.png"
              alt="ObVote Dashboard"
              width={1300}
              height={900}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
              }}
              priority
            />
          </div>
        </div>

        {/* Updates Section */}
        <section
          id="updates"
          style={{
            marginBottom: '80px',
            background: '#f8f9fa',
            padding: '32px 40px',
            borderRadius: '12px',
            border: '1px solid #e8eaed'
          }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FiCheckCircle size={20} style={{ color: 'white', strokeWidth: 2 }} />
            </div>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 500,
                marginBottom: '12px',
                color: '#202124'
              }}>
                Recent Updates
              </h3>
              <ul style={{
                fontSize: '15px',
                color: '#5f6368',
                lineHeight: 1.8,
                margin: 0,
                paddingLeft: '20px'
              }}>
                <li>Lobby Renovation Project petition has reached 62 signatures</li>
                <li>Guest Parking Policy Update voting extended through December 15th</li>
                <li>New petition: Rooftop Garden Installation now open for signatures</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          style={{ marginBottom: '120px', background: '#f8f9fa', padding: '80px 40px', margin: '0 -40px 120px', borderRadius: '0' }}>
          <h3 style={{
            fontSize: '36px',
            fontWeight: 400,
            textAlign: 'center',
            marginBottom: '16px',
            color: '#202124'
          }}>
            How it works
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#5f6368',
            textAlign: 'center',
            marginBottom: '64px',
            maxWidth: '600px',
            margin: '0 auto 64px'
          }}>
            Simple voting process for condo boards and residents
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '48px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'white',
              padding: '32px 28px',
              borderRadius: '12px',
              border: '1px solid #e8eaed',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <FiEdit3 size={28} style={{ color: 'white', strokeWidth: 2 }} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '12px', color: '#202124' }}>
                Complete Resident Management
              </h4>
              <p style={{ fontSize: '14px', color: '#5f6368', lineHeight: 1.7, fontWeight: 400 }}>
                Comprehensive user management with unit associations, registration codes, and secure authentication. Full audit trails for all resident activities.
              </p>
            </div>
            <div style={{
              background: 'white',
              padding: '32px 28px',
              borderRadius: '12px',
              border: '1px solid #e8eaed',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #34a853 0%, #0f9d58 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <FiUsers size={28} style={{ color: 'white', strokeWidth: 2 }} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '12px', color: '#202124' }}>
                Advanced Petition System
              </h4>
              <p style={{ fontSize: '14px', color: '#5f6368', lineHeight: 1.7, fontWeight: 400 }}>
                Create, manage, and track petitions with full-text search, signature tracking, and comprehensive audit logs. NYS e-signature compliant with legal safeguards.
              </p>
            </div>
            <div style={{
              background: 'white',
              padding: '32px 28px',
              borderRadius: '12px',
              border: '1px solid #e8eaed',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #fbbc04 0%, #f9ab00 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <FiCheckCircle size={28} style={{ color: 'white', strokeWidth: 2 }} />
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '12px', color: '#202124' }}>
                Administrative Control Panel
              </h4>
              <p style={{ fontSize: '14px', color: '#5f6368', lineHeight: 1.7, fontWeight: 400 }}>
                Comprehensive admin dashboard with database management, contact form reviews, system monitoring, and configuration controls. Full audit trails and safety measures.
              </p>
            </div>
          </div>
        </section>

        {/* Current Petitions */}
        <section id="petitions" style={{ marginBottom: '120px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h3 style={{
              fontSize: '36px',
              fontWeight: 400,
              marginBottom: '12px',
              color: '#202124'
            }}>
              {landingContent.petitions.title}
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#5f6368',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {landingContent.petitions.subtitle}
            </p>
          </div>

          {loadingPetitions ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#5f6368' }}>
              Loading petitions...
            </div>
          ) : petitions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e8eaed'
            }}>
              <FiCheckCircle size={48} style={{ color: '#5f6368', marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', color: '#5f6368' }}>
                No active petitions at the moment. Check back soon!
              </p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
              }}>
                {petitions.map(petition => {
                  const userSigned = userSignedPetitions.has(petition.id);
                  const placeholderImage = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=500&fit=crop';
                  const petitionImage = petition.imageUrl || placeholderImage;

                  return (
                    <div
                      key={petition.id}
                      style={{
                        background: 'white',
                        border: '1px solid #dadce0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onClick={() => handleViewPetition(petition)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Petition Image */}
                      <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                        <Image
                          src={petitionImage}
                          alt={petition.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                        {userSigned && (
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#34a853',
                            color: 'white',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}>
                            <FiCheck size={14} strokeWidth={3} />
                            Signed
                          </div>
                        )}
                      </div>

                      <div style={{
                        padding: '20px',
                        flex: 1
                      }}>
                        <h4 style={{
                          fontSize: '18px',
                          fontWeight: 500,
                          marginBottom: '10px',
                          color: '#202124',
                          lineHeight: 1.3
                        }}>
                          {petition.title}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#5f6368',
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {petition.content}
                        </p>
                      </div>
                      <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid #e8eaed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          color: '#5f6368',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <FiTrendingUp size={14} />
                          {petition.signatureCount.toLocaleString()} {landingContent.petitions.signaturesLabel}
                        </span>
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: '8px 20px',
                            fontSize: '13px',
                            fontWeight: 500
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPetition(petition);
                          }}
                        >
                          {userSigned ? 'View' : landingContent.petitions.viewButton}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>

        {/* Contact Form */}
        <section id="contact" style={{ marginBottom: '0' }}>
          <div style={{
            background: 'linear-gradient(135deg, #e8f4fd 0%, #f1f8ff 100%)',
            padding: '0',
            margin: '0 -40px',
            borderRadius: '0'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '0',
              alignItems: 'stretch'
            }}>
              <div style={{
                padding: '80px 60px',
                background: 'white'
              }}>
                <div style={{ marginBottom: '40px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                  }}>
                    <FiMail size={32} style={{ color: 'white', strokeWidth: 2 }} />
                  </div>
                  <h3 style={{
                    fontSize: '32px',
                    fontWeight: 400,
                    marginBottom: '16px',
                    color: '#202124'
                  }}>
                    Get in touch
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#5f6368',
                    lineHeight: 1.7
                  }}>
                    Have questions, need help with registration, or want to propose a new petition? We're here to help.
                  </p>
                </div>
                <form onSubmit={handleContactSubmit}>
                  {contactMessage && (
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      background: contactMessage.type === 'success' ? '#e6f4ea' : '#fce8e6',
                      border: `1px solid ${contactMessage.type === 'success' ? '#34a853' : '#ea4335'}`,
                      color: contactMessage.type === 'success' ? '#137333' : '#c5221f',
                      fontSize: '14px'
                    }}>
                      {contactMessage.text}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    style={{ marginBottom: '16px' }}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    style={{ marginBottom: '16px' }}
                  />
                  <input
                    type="text"
                    placeholder="Unit number (optional)"
                    value={contactForm.unitNumber}
                    onChange={(e) => setContactForm({ ...contactForm, unitNumber: e.target.value })}
                    style={{ marginBottom: '16px' }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (optional)"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    style={{ marginBottom: '16px' }}
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    style={{ marginBottom: '16px' }}
                  />
                  <textarea
                    placeholder="Your message or petition proposal"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    style={{ marginBottom: '24px', resize: 'vertical' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={contactSubmitting}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      fontSize: '15px',
                      fontWeight: 500,
                      opacity: contactSubmitting ? 0.7 : 1,
                      cursor: contactSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {contactSubmitting ? 'Sending...' : 'Send message'}
                  </button>
                </form>
              </div>
              <div style={{
                position: 'relative',
                minHeight: '500px',
                overflow: 'hidden'
              }}>
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=800&fit=crop"
                  alt="People collaborating"
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(66,133,244,0.8) 0%, rgba(26,115,232,0.9) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '60px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <FiUsers size={80} style={{ marginBottom: '24px', opacity: 0.9 }} />
                  <h4 style={{
                    fontSize: '28px',
                    fontWeight: 400,
                    marginBottom: '16px',
                    color: 'white'
                  }}>
                    Trusted by condos
                  </h4>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: 1.7,
                    opacity: 0.95,
                    maxWidth: '400px'
                  }}>
                    Hundreds of condo buildings use ObVote to streamline their voting process and engage residents.
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '32px',
                    marginTop: '40px',
                    width: '100%',
                    maxWidth: '400px'
                  }}>
                    <div>
                      <div style={{ fontSize: '36px', fontWeight: 500, marginBottom: '8px' }}>250+</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Condo buildings</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '36px', fontWeight: 500, marginBottom: '8px' }}>15K+</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Active residents</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e8eaed',
        padding: '32px 40px',
        textAlign: 'center',
        background: '#f8f9fa'
      }}>
        <p style={{
          fontSize: '13px',
          color: '#5f6368',
          marginBottom: '8px',
          fontWeight: 400
        }}>
          © 2025 ObVote • Streamlined voting for condo communities
        </p>
        <p style={{
          fontSize: '12px',
          color: '#80868b'
        }}>
          NYS e-signature compliant • Secure • Transparent
        </p>
      </footer>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={() => {
          setShowSignInModal(false);
          fetchPetitions();
        }}
        onForgotPassword={() => {
          setShowSignInModal(false);
          setShowForgotPasswordModal(true);
        }}
      />

      <PetitionViewModal
        petition={selectedPetition}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedPetition(null);
        }}
        onSignClick={handleContinueToSign}
        isSignedIn={isSignedIn}
        userAlreadySigned={selectedPetition ? userSignedPetitions.has(selectedPetition.id) : false}
      />

      <PetitionSignModal
        petition={selectedPetition}
        userInfo={currentUser}
        isOpen={showSignModal}
        onClose={() => {
          setShowSignModal(false);
          setSelectedPetition(null);
        }}
        onSuccess={() => {
          setShowSignModal(false);
          setSelectedPetition(null);
          fetchPetitions();
          fetchUserSignatures();
        }}
      />

      {/* Sign Up Modal */}
      {showSignUpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000
          }}
          onClick={closeSignUpModal}
        >
          <div
            style={{
              maxWidth: '450px',
              width: '100%',
              background: 'white',
              borderRadius: '8px',
              padding: '48px 40px',
              position: 'relative',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeSignUpModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                color: '#5f6368',
                borderRadius: '50%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <FiX size={20} />
            </button>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 400,
              marginBottom: '8px',
              textAlign: 'center',
              color: '#202124'
            }}>
              Register with your code
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#5f6368',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              Create your account to get started
            </p>
            <form onSubmit={handleSignUp}>
              {authMessage && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  background: authMessage.type === 'success' ? '#e6f4ea' : '#fce8e6',
                  border: `1px solid ${authMessage.type === 'success' ? '#34a853' : '#ea4335'}`,
                  color: authMessage.type === 'success' ? '#137333' : '#c5221f',
                  fontSize: '14px'
                }}>
                  {authMessage.text}
                </div>
              )}
              <input
                type="text"
                placeholder="Full name"
                value={signUpForm.fullName}
                onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                required
                style={{ marginBottom: '16px' }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={signUpForm.email}
                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                required
                style={{ marginBottom: '16px' }}
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={signUpForm.phone}
                onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                style={{ marginBottom: '16px' }}
              />
              <input
                type="text"
                placeholder="Registration code (optional)"
                value={signUpForm.registrationCode}
                onChange={(e) => setSignUpForm({ ...signUpForm, registrationCode: e.target.value })}
                style={{ marginBottom: '16px' }}
              />
              <input
                type="password"
                placeholder="Create password (min 8 characters)"
                value={signUpForm.password}
                onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                required
                style={{ marginBottom: '16px' }}
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={signUpForm.confirmPassword}
                onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                required
                style={{ marginBottom: '24px' }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={authSubmitting}
                style={{
                  width: '100%',
                  marginBottom: '20px',
                  opacity: authSubmitting ? 0.7 : 1,
                  cursor: authSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {authSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#5f6368' }}>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    closeSignUpModal();
                    setShowSignInModal(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '13px'
                  }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000
          }}
          onClick={() => setShowForgotPasswordModal(false)}
        >
          <div
            style={{
              maxWidth: '450px',
              width: '100%',
              background: 'white',
              borderRadius: '8px',
              padding: '48px 40px',
              position: 'relative',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                color: '#5f6368',
                borderRadius: '50%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <FiX size={20} />
            </button>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 400,
              marginBottom: '12px',
              textAlign: 'center',
              color: '#202124'
            }}>
              Reset password
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#5f6368',
              textAlign: 'center',
              marginBottom: '32px',
              lineHeight: 1.5
            }}>
              Enter your email and we'll send you a link to reset your password
            </p>
            <input
              type="email"
              placeholder="Email"
              style={{ marginBottom: '24px' }}
            />
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '20px' }}
            >
              Send reset link
            </button>
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setShowForgotPasswordModal(false);
                  setShowSignInModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Back to sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import styles from './splash.module.css';
import { ClipboardList, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

// Dynamically import ColorBends to avoid SSR issues with Three.js
const ColorBends = dynamic(() => import('@/components/ColorBends'), { ssr: false });

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Mouse parallax hooks must be at top level
  const bgRef = useRef(null);
  const heroRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY } = e;
    const cx = (clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
    const cy = (clientY / window.innerHeight - 0.5) * 2; // -1 to 1

    if (bgRef.current) {
      bgRef.current.style.transform = `translate(${cx * 12}px, ${cy * 8}px) scale(1.02)`;
    }
    if (heroRef.current) {
      heroRef.current.style.transform = `translate(${cx * -6}px, ${cy * -4}px)`;
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove, loading, user]);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={styles.splashContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className={styles.splashContainer}>
      {/* Animated background */}
      <div className={styles.bgLayer} ref={bgRef}>
        <ColorBends
          colors={['#0F766E', '#14B8A6', '#5EEAD4']}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
        />
      </div>

      {/* Foreground content */}
      <div className={styles.contentLayer}>
        {/* Glass Nav */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}><ClipboardList size={22} strokeWidth={2} /></span>
            <span className={styles.logoText}>JobTracker</span>
          </Link>
          <div className={styles.navRight}>
            <Link href="/demo" className={styles.navLink}>See Demo</Link>
            <Link href="/login" className={styles.navLink}>Log in</Link>
          </div>
        </nav>

        {/* Hero */}
        <div className={styles.heroCenter} ref={heroRef}>
          <span className={styles.pill}>
            <span className={styles.pillIcon}><Sparkles size={14} strokeWidth={2} /></span>
            Now with Gmail Auto-Import
          </span>

          <h1 className={styles.headline}>
            You&apos;re not disorganized. You just need <span className={styles.gradientText}>better tools.</span>
          </h1>

          <p className={styles.subtitle}>
            Auto-import job applications from Gmail, track them on a Kanban board, and never miss a follow-up. Your entire job search — organized in one place.
          </p>

          <div className={styles.ctaRow}>
            <Link href="/features" className={styles.ctaPrimary}>
              See How It Works <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="/signup" className={styles.ctaSecondary}>
              Sign Up Free
            </Link>
          </div>

          <span className={styles.trustLine}>
            <span className={styles.trustIcon}><CheckCircle2 size={14} strokeWidth={2} /></span>
            Free forever. No credit card needed.
          </span>
        </div>
      </div>

      {/* Legal Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        padding: '12px',
        fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.3)',
        zIndex: 10,
      }}>
        © 2026 JobTracker |{' '}
        <Link href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms</Link>{' · '}
        <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy</Link>
      </div>
    </div>
  );
}

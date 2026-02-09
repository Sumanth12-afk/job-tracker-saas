'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import styles from './page.module.css';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const Hyperspeed = dynamic(() => import('@/components/Hyperspeed'), { ssr: false });

const hyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 9,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 50,
  lightPairsPerRoadWay: 50,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.05, 400 * 0.15],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.2, 0.2],
  carFloorSeparation: [0.05, 1],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131318,
    brokenLines: 0x131318,
    leftCars: [0x0066ff, 0x0052cc, 0x00c6ff],
    rightCars: [0x00c6ff, 0x00ffff, 0x334bf7],
    sticks: 0x00c6ff
  }
};

// FAQ Data
const faqData = [
  {
    question: "Is JobTracker really free?",
    answer: "Yes! JobTracker is completely free to use. We believe everyone deserves access to great job search tools. We may introduce premium features in the future, but the core functionality will always be free."
  },
  {
    question: "How does Gmail auto-import work?",
    answer: "After you connect your Gmail account (read-only access), we scan for job application confirmation emails from platforms like LinkedIn, Indeed, Greenhouse, and more. We extract the company name, job title, and date automatically."
  },
  {
    question: "Is my data safe and private?",
    answer: "Absolutely. We only read job-related emails and never store the email content itself. Your data is encrypted, and we never sell or share your information with third parties. You can delete your data anytime."
  },
  {
    question: "Can I use JobTracker without connecting Gmail?",
    answer: "Yes! Gmail integration is optional. You can manually add job applications using the '+ Add Job' button. Gmail just makes it faster to import applications you've already submitted."
  },
  {
    question: "What job platforms are supported?",
    answer: "We detect emails from LinkedIn, Indeed, Greenhouse, Lever, Workday, iCIMS, and 50+ other ATS platforms. If you apply through email or company websites, we'll likely detect those too."
  },
  {
    question: "How do follow-up reminders work?",
    answer: "When an application has been in 'Applied' status for 7+ days without activity, it moves to 'Needs Attention'. Jobs over 30 days are marked as 'Ghosted'. You can also use our one-click follow-up email feature."
  }
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  // Redirect if logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true
            }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [loading]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* Hyperspeed Background - Fixed behind everything */}
      <div className={styles.hyperspeedWrapper}>
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

      <div className={styles.container}>
        {/* Navigation */}
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>📋</span>
            <span className={styles.logoText}>JobTracker</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="/login" className={styles.navLink}>Log in</Link>
            <Link href="/signup" className={styles.primaryBtn}>Get Started Free</Link>
          </div>
        </nav>

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.pill}>🚀 Now with Gmail Auto-Import</span>
            <h1 className={styles.heroTitle}>
              Stop losing track of your <span className={styles.gradient}>job applications</span>
            </h1>
            <p className={styles.heroSubtitle}>
              The simplest way to organize your job search. Kanban board + Gmail integration = never miss a follow-up again.
            </p>
            <div className={styles.heroBtns}>
              <Link href="/signup" className={styles.primaryBtn}>
                Start Free — No Credit Card
              </Link>
              <Link href="#how" className={styles.secondaryBtn}>
                See how it works
              </Link>
            </div>
            <div className={styles.socialProof}>
              <div className={styles.avatars}>
                <span>P</span>
                <span>M</span>
                <span>A</span>
                <span>+</span>
              </div>
              <p>Trusted by <strong>1,200+</strong> job seekers</p>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <img
              src="/journey-steps.png"
              alt="Launch your job search"
              className={styles.heroImage}
            />
          </div>
        </section>

        {/* Logos Section */}
        <section className={styles.logosSection}>
          <p>Works with applications from</p>
          <div className={styles.logos}>
            <span>LinkedIn</span>
            <span>Indeed</span>
            <span>Greenhouse</span>
            <span>Lever</span>
            <span>Workday</span>
          </div>
        </section>

        {/* Problem/Solution */}
        <section className={styles.problemSection}>
          <div className={styles.problemGrid}>
            <div className={styles.problem}>
              <span className={styles.emoji}>😩</span>
              <h3>The Problem</h3>
              <ul>
                <li>Spreadsheets get messy fast</li>
                <li>Forgetting to follow up</li>
                <li>Losing track of where you applied</li>
                <li>Email chaos with no organization</li>
              </ul>
            </div>
            <div className={styles.solution}>
              <span className={styles.emoji}>✨</span>
              <h3>The Solution</h3>
              <ul>
                <li>Visual Kanban board for all jobs</li>
                <li>Smart follow-up reminders</li>
                <li>Gmail auto-detects applications</li>
                <li>Everything in one calm place</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className={styles.howSection}>
          <h2 className={styles.sectionHead}>Get organized in 60 seconds</h2>
          <div className={styles.steps}>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>1</div>
              <h3>Connect Gmail</h3>
              <p>One-click OAuth. We scan for job confirmation emails.</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>2</div>
              <h3>Review & Import</h3>
              <p>We detect company, role, and date. You approve.</p>
            </div>
            <div className={styles.stepArrow}>→</div>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>3</div>
              <h3>Track & Land</h3>
              <p>Drag cards through stages. Get reminders. Land offers.</p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionHead}>Everything you need. Nothing you don't.</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>📧</div>
              <div>
                <h4>Gmail Auto-Import</h4>
                <p>Detects job emails from LinkedIn, Indeed, ATS systems and more.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>📊</div>
              <div>
                <h4>Visual Kanban</h4>
                <p>Drag jobs through Applied → Interview → Offer → Done.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>🔔</div>
              <div>
                <h4>Smart Reminders</h4>
                <p>Nudges you to follow up at the right time.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>📈</div>
              <div>
                <h4>Analytics</h4>
                <p>See response rates and where you're winning.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>📥</div>
              <div>
                <h4>Export Anytime</h4>
                <p>Download CSV or reports whenever you need.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIconBox}>🔒</div>
              <div>
                <h4>Private & Secure</h4>
                <p>Your data is yours. We never sell or share.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Optimize Your Job Search */}
        <section
          id="optimize"
          ref={(el) => (sectionRefs.current.optimize = el)}
          className={`${styles.optimizeSection} ${styles.sectionReveal} ${visibleSections.optimize ? styles.sectionRevealVisible : ''}`}
        >
          <h2 className={styles.sectionHead}>Optimize Your Job Search</h2>
          <p className={styles.optimizeSubtitle}>Turn chaos into a systematic approach that gets results</p>
          <div className={styles.optimizeGrid}>
            <div className={`${styles.optimizeCard} ${styles.scrollReveal} ${visibleSections.optimize ? styles.scrollRevealVisible : ''}`}>
              <span className={styles.optimizeIcon}>🎯</span>
              <h4>Track Everything</h4>
              <p>Never lose track of where you applied. See your entire pipeline at a glance.</p>
            </div>
            <div className={`${styles.optimizeCard} ${styles.scrollReveal} ${visibleSections.optimize ? styles.scrollRevealVisible : ''}`}>
              <span className={styles.optimizeIcon}>⏰</span>
              <h4>Follow Up on Time</h4>
              <p>Get reminders when applications go stale. The right follow-up can change everything.</p>
            </div>
            <div className={`${styles.optimizeCard} ${styles.scrollReveal} ${visibleSections.optimize ? styles.scrollRevealVisible : ''}`}>
              <span className={styles.optimizeIcon}>📊</span>
              <h4>Learn from Data</h4>
              <p>See your response rates, best days to apply, and identify what's working.</p>
            </div>
            <div className={`${styles.optimizeCard} ${styles.scrollReveal} ${visibleSections.optimize ? styles.scrollRevealVisible : ''}`}>
              <span className={styles.optimizeIcon}>🚀</span>
              <h4>Stay Motivated</h4>
              <p>Application streaks, progress badges, and clear wins keep you going.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq"
          ref={(el) => (sectionRefs.current.faq = el)}
          className={`${styles.faqSection} ${styles.sectionReveal} ${visibleSections.faq ? styles.sectionRevealVisible : ''}`}
        >
          <h2 className={styles.sectionHead}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {faqData.map((faq, index) => (
              <div
                key={index}
                className={`${styles.faqItem} ${styles.scrollReveal} ${visibleSections.faq ? styles.scrollRevealVisible : ''}`}
              >
                <button
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <span className={`${styles.faqIcon} ${openFaq === index ? styles.faqIconOpen : ''}`}>+</span>
                </button>
                <div className={`${styles.faqAnswer} ${openFaq === index ? styles.faqAnswerOpen : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaOverlay}>
            <h2>Ready to take control of your job search?</h2>
            <p>Join 1,200+ job seekers who track smarter, not harder.</p>
            <Link href="/signup" className={styles.ctaBtn}>
              Get Started Free →
            </Link>
            <span className={styles.ctaNote}>Free forever. No credit card needed.</span>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <span>📋 JobTracker</span>
              <p>Built with ❤️ for job seekers</p>
            </div>
            <div className={styles.footerLinks}>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <p className={styles.copyright}>© 2024 JobTracker. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

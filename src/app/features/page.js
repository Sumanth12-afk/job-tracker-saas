'use client';

import Link from 'next/link';
import IllustrationCard from '@/components/IllustrationCard';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useScrollReveal from '@/hooks/useScrollReveal';
import styles from './features.module.css';


import {
    Mail,
    KanbanSquare,
    Bell,
    BarChart3,
    Download,
    Lock,
    CheckCircle2,
    ArrowRight,
    GripVertical,
    AlertCircle,
    StickyNote,
    ClipboardList,
    Sparkles,
} from 'lucide-react';

export default function FeaturesPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const containerRef = useScrollReveal();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (user) return null;



    return (
        <>
            <div className={styles.container} ref={containerRef}>
                {/* Navigation */}
                <nav className={styles.nav}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoIcon}><ClipboardList size={22} strokeWidth={2} /></span>
                        <span className={styles.logoText}>JobTracker</span>
                    </Link>
                    <div className={styles.navLinks}>
                        <Link href="/login" className={styles.navLink}>Log in</Link>

                        <Link href="/signup" className={styles.primaryBtn}>Get Started Free</Link>
                    </div>
                </nav>

                {/* ========== SECTION 1: HERO ========== */}
                <section className={styles.hero} data-reveal>
                    <div className={styles.heroContent}>
                        <span className={styles.pill}>
                            <span className={styles.pillIcon}><Sparkles size={14} strokeWidth={2} /></span>
                            Now with Gmail Auto-Import
                        </span>
                        <h1 className={styles.heroTitle}>
                            Stop losing track of your <span className={styles.gradient}>job applications</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Auto-import from Gmail, track in a Kanban board, and never miss a follow-up.
                        </p>
                        <div className={styles.heroBtns}>
                            <Link href="/signup" className={styles.primaryBtn}>
                                Get Started Free <ArrowRight size={16} strokeWidth={2} />
                            </Link>
                            <Link href="#how-step1" className={styles.secondaryBtn}>
                                See how it works
                            </Link>
                        </div>
                        <span className={styles.trustLine}>
                            <span className={styles.trustIcon}><CheckCircle2 size={16} strokeWidth={2} /></span>
                            Free forever. No credit card needed.
                        </span>
                    </div>
                    <div className={styles.heroVisual}>
                        <IllustrationCard
                            src="/images/hero_1.png"
                            alt="Job application tracking made easy"
                            width={640}
                            height={480}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    </div>
                </section>

                {/* ========== SECTION 2: INTEGRATIONS STRIP ========== */}
                <section id="integrations" className={styles.integrationsSection} data-reveal>
                    <p className={styles.integrationsTitle}>Works with applications from</p>
                    <p className={styles.integrationsSubtitle}>LinkedIn, Indeed, Greenhouse, Lever, Workday and more.</p>
                    <div style={{ maxWidth: 380, margin: '0 auto' }}>
                        <IllustrationCard
                            src="/images/Logos_8.jpg"
                            alt="Supported job platforms - LinkedIn, Indeed, Greenhouse, Lever, Workday"
                            width={640}
                            height={120}
                            compact
                        />
                    </div>
                </section>

                {/* ========== SECTION 3: HOW IT WORKS - STEP 1 ========== */}
                <section id="how-step1" className={styles.stepSection} data-reveal>
                    <div className={styles.stepInner}>
                        <div className={styles.stepText}>
                            <span className={styles.stepLabel}>Step 1</span>
                            <h2 className={styles.stepTitle}>Connect Gmail</h2>
                            <p className={styles.stepCopy}>
                                One click OAuth. Job emails get detected automatically. We only read job-related emails — your data stays private.
                            </p>
                        </div>
                        <div className={styles.stepImageWrap}>
                            <IllustrationCard
                                src="/images/Gmail_2.png"
                                alt="Connect Gmail to auto-import job applications"
                                width={560}
                                height={400}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </section>

                {/* ========== SECTION 4: HOW IT WORKS - STEP 2 ========== */}
                <section id="how-step2" className={styles.stepSectionAlt} data-reveal>
                    <div className={styles.stepInnerReverse}>
                        <div className={styles.stepText}>
                            <span className={styles.stepLabel}>Step 2</span>
                            <h2 className={styles.stepTitle}>Review &amp; Import</h2>
                            <p className={styles.stepCopy}>
                                We extract company, role, and date from your emails. You review and approve — nothing gets added without your say.
                            </p>
                        </div>
                        <div className={styles.stepImageWrap}>
                            <IllustrationCard
                                src="/images/Dashboard_preview_6.jpg"
                                alt="Review and import detected job applications"
                                width={560}
                                height={400}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </section>

                {/* ========== SECTION 5: HOW IT WORKS - STEP 3 ========== */}
                <section id="how-step3" className={styles.stepSection} data-reveal>
                    <div className={styles.stepInner}>
                        <div className={styles.stepText}>
                            <span className={styles.stepLabel}>Step 3</span>
                            <h2 className={styles.stepTitle}>Follow up on time</h2>
                            <p className={styles.stepCopy}>
                                Smart reminders so you never miss the next step. Applications go stale? We&apos;ll nudge you before it&apos;s too late.
                            </p>
                        </div>
                        <div className={styles.stepImageWrap}>
                            <IllustrationCard
                                src="/images/Follow_Up_calender_5.jpg"
                                alt="Follow-up reminders and calendar view"
                                width={560}
                                height={400}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </section>

                {/* ========== SECTION 6: KANBAN ========== */}
                <section id="kanban" className={styles.stepSectionAlt} data-reveal>
                    <div className={styles.stepInnerReverse}>
                        <div className={styles.stepText}>
                            <h2 className={styles.stepTitle}>Your pipeline, at a glance</h2>
                            <p className={styles.stepCopy}>
                                A visual board that shows every application from start to finish.
                            </p>
                            <ul className={styles.kanbanBullets}>
                                <li className={styles.kanbanBulletItem}>
                                    <span className={styles.kanbanBulletIcon}><GripVertical size={18} strokeWidth={1.75} /></span>
                                    Drag jobs through stages
                                </li>
                                <li className={styles.kanbanBulletItem}>
                                    <span className={styles.kanbanBulletIcon}><AlertCircle size={18} strokeWidth={1.75} /></span>
                                    See what&apos;s stuck instantly
                                </li>
                                <li className={styles.kanbanBulletItem}>
                                    <span className={styles.kanbanBulletIcon}><StickyNote size={18} strokeWidth={1.75} /></span>
                                    Keep notes and status in one place
                                </li>
                            </ul>
                        </div>
                        <div className={styles.stepImageWrap}>
                            <IllustrationCard
                                src="/images/Kanban_3.jpg"
                                alt="Kanban board for tracking job applications"
                                width={640}
                                height={440}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </section>

                {/* ========== SECTION 7: ANALYTICS ========== */}
                <section id="analytics" className={styles.stepSection} data-reveal>
                    <div className={styles.stepInner}>
                        <div className={styles.stepText}>
                            <h2 className={styles.stepTitle}>Know what&apos;s working</h2>
                            <p className={styles.stepCopy}>
                                See response rates, best days to apply, and where you&apos;re winning. Data-driven job searching means less guesswork and more offers.
                            </p>
                        </div>
                        <div className={styles.stepImageWrap}>
                            <IllustrationCard
                                src="/images/Analytics_Dashboard_4.jpg"
                                alt="Analytics dashboard showing job search performance"
                                width={560}
                                height={400}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </section>

                {/* ========== SECTION 8: FEATURES + EMPTY STATE ========== */}
                <section id="features" className={styles.featuresSection} data-reveal>
                    <div className={`${styles.featuresTop} ${styles.featuresTopReverse}`}>
                        <div className={styles.featuresTextWrap}>
                            <h2 className={styles.featuresTitle}>Everything stays clean and organized</h2>
                            <p className={styles.featuresCopy}>
                                Whether you have 5 applications or 500, your board always looks calm and clear.
                            </p>
                        </div>
                        <div className={styles.featuresImageWrap}>
                            <IllustrationCard
                                src="/images/Empty_state_7.jpg"
                                alt="Clean organized job application view"
                                width={480}
                                height={340}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>

                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIconBadge}><Mail size={22} strokeWidth={1.75} /></div>
                            <h4 className={styles.featureCardTitle}>Gmail Auto-Import</h4>
                            <p className={styles.featureCardCopy}>Detects job emails from LinkedIn, Indeed, ATS systems and more.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIconBadge}><KanbanSquare size={22} strokeWidth={1.75} /></div>
                            <h4 className={styles.featureCardTitle}>Visual Kanban</h4>
                            <p className={styles.featureCardCopy}>Drag jobs through Applied → Interview → Offer → Done.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIconBadge}><Bell size={22} strokeWidth={1.75} /></div>
                            <h4 className={styles.featureCardTitle}>Smart Reminders</h4>
                            <p className={styles.featureCardCopy}>Nudges you to follow up at the right time, every time.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIconBadge}><BarChart3 size={22} strokeWidth={1.75} /></div>
                            <h4 className={styles.featureCardTitle}>Analytics</h4>
                            <p className={styles.featureCardCopy}>See response rates and where you&apos;re winning.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIconBadge}><Download size={22} strokeWidth={1.75} /></div>
                            <h4 className={styles.featureCardTitle}>Export Anytime</h4>
                            <p className={styles.featureCardCopy}>Download CSV or reports whenever you need them.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIconBadge}><Lock size={22} strokeWidth={1.75} /></div>
                            <h4 className={styles.featureCardTitle}>Private & Secure</h4>
                            <p className={styles.featureCardCopy}>Your data is yours. We never sell or share it.</p>
                        </div>
                    </div>
                </section>

                {/* ========== SECTION 9: FINAL CTA ========== */}
                <section className={styles.ctaSection} data-reveal>
                    <div className={styles.ctaInner}>
                        <h2 className={styles.ctaTitle}>Ready to get organized?</h2>
                        <p className={styles.ctaCopy}>Set up takes about 60 seconds.</p>
                        <Link href="/signup" className={styles.ctaBtn}>
                            Get Started Free <ArrowRight size={18} strokeWidth={2} />
                        </Link>
                        <span className={styles.ctaNote}>Free forever. No credit card needed.</span>
                    </div>
                </section>

                {/* ========== FOOTER ========== */}
                <footer className={styles.footer}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerBrand}>
                            <span className={styles.footerBrandName}>
                                <span className={styles.footerBrandIcon}><ClipboardList size={18} strokeWidth={2} /></span>
                                JobTracker
                            </span>
                            <p className={styles.footerBrandSub}>Built for job seekers who want to stay organized.</p>
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

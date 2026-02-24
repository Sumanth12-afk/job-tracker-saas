'use client';

import Link from 'next/link';
import styles from './demo.module.css';
import DashboardDemo from '@/components/DashboardDemo';
import { ArrowLeft, ClipboardList } from 'lucide-react';

export default function DemoPage() {
    return (
        <div className={styles.page}>
            {/* Nav */}
            <nav className={styles.nav}>
                <Link href="/" className={styles.logo}>
                    <ClipboardList size={20} strokeWidth={2} />
                    <span>JobTracker</span>
                </Link>
                <div className={styles.navRight}>
                    <Link href="/" className={styles.backLink}>
                        <ArrowLeft size={14} /> Back
                    </Link>
                    <Link href="/signup" className={styles.ctaBtn}>
                        Start Free
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.headline}>
                    See how <span className={styles.accent}>JobTracker</span> works
                </h1>
                <p className={styles.subtitle}>
                    Click through the sidebar to explore every feature — Dashboard, Kanban board, Follow-ups, Analytics, and Resume Library.
                </p>
            </header>

            {/* Interactive Demo */}
            <div className={styles.demoContainer}>
                <DashboardDemo />
            </div>

            {/* CTA */}
            <div className={styles.bottomCta}>
                <p className={styles.ctaText}>Ready to organize your job search?</p>
                <Link href="/signup" className={styles.ctaBtnLarge}>
                    Get Started — It&apos;s Free
                </Link>
            </div>
        </div>
    );
}

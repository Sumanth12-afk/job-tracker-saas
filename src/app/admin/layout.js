'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLayout({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is admin
        fetch('/api/admin/stats')
            .then(res => {
                if (res.status === 403) {
                    setIsAuthorized(false);
                    router.push('/dashboard');
                } else {
                    setIsAuthorized(true);
                }
            })
            .catch(() => {
                setIsAuthorized(false);
                router.push('/dashboard');
            });
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Checking admin access...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h1>🛠️ Admin</h1>
                </div>
                <nav className={styles.sidebarNav}>
                    <Link href="/admin" className={styles.navLink}>
                        📊 Dashboard
                    </Link>
                    <Link href="/admin/users" className={styles.navLink}>
                        👥 Users
                    </Link>
                    <Link href="/admin/health" className={styles.navLink}>
                        🔍 System Health
                    </Link>
                    <Link href="/admin/ml" className={styles.navLink}>
                        🤖 ML Monitoring
                    </Link>
                </nav>
                <div className={styles.sidebarFooter}>
                    <Link href="/dashboard" className={styles.backLink}>
                        ← Back to App
                    </Link>
                </div>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}

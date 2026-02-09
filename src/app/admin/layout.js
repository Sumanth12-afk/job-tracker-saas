'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './admin.module.css';

// Admin emails - must match server-side
const ADMIN_EMAILS = [
    'krushi.krishh@gmail.com',
    'nallandhigalsumanth@gmail.com'
];

export default function AdminLayout({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const router = useRouter();

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            // Get user from Supabase client-side auth
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user?.email) {
                console.log('[ADMIN] No session found');
                setIsAuthorized(false);
                router.push('/login');
                return;
            }

            const email = session.user.email;
            setUserEmail(email);
            console.log('[ADMIN] User email:', email);

            // Check if user is admin
            if (ADMIN_EMAILS.includes(email)) {
                console.log('[ADMIN] Access granted');
                setIsAuthorized(true);
            } else {
                console.log('[ADMIN] Not an admin, redirecting');
                setIsAuthorized(false);
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('[ADMIN] Auth error:', error);
            setIsAuthorized(false);
            router.push('/dashboard');
        }
    };

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
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>
                        {userEmail?.split('@')[0]}
                    </p>
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

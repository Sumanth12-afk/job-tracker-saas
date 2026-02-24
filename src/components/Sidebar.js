'use client';

import styles from './Sidebar.module.css';
import {
    LayoutDashboard,
    KanbanSquare,
    Clock,
    BarChart3,
    FileText,
    Settings,
    LogOut,
    Zap,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: KanbanSquare },
    { id: 'followups', label: 'Follow-ups', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'resume', label: 'Resume Library', icon: FileText },
];

export default function Sidebar({ activeView, onViewChange, onLogout }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleNav = (id) => {
        onViewChange(id);
        setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className={styles.hamburger}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
                {/* Logo */}
                <div className={styles.logo}>
                    <span className={styles.logoIcon}><Zap size={20} strokeWidth={2.5} /></span>
                    <span className={styles.logoText}>JobTracker</span>
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;
                        return (
                            <button
                                key={item.id}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                onClick={() => handleNav(item.id)}
                            >
                                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom actions */}
                <div className={styles.bottom}>
                    <button
                        className={`${styles.navItem} ${activeView === 'settings' ? styles.active : ''}`}
                        onClick={() => handleNav('settings')}
                    >
                        <Settings size={18} strokeWidth={1.5} />
                        <span>Settings</span>
                    </button>
                    <button
                        className={`${styles.navItem} ${styles.logoutBtn}`}
                        onClick={onLogout}
                    >
                        <LogOut size={18} strokeWidth={1.5} />
                        <span>Log out</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

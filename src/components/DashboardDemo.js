'use client';

import styles from './DashboardDemo.module.css';
import {
    LayoutDashboard,
    KanbanSquare,
    Clock,
    BarChart3,
    FileText,
    Settings,
    Zap,
    Briefcase,
    Users,
    Trophy,
    TrendingUp,
    Search,
    Plus,
    RefreshCw,
    Mail,
    Calendar,
    Building2,
    ArrowRight,
} from 'lucide-react';

const MOCK_STATS = [
    { icon: Briefcase, label: 'Applied', value: '24', delta: '+5 this week', colorClass: 'iconApplied' },
    { icon: Users, label: 'Interviews', value: '7', delta: '+2 this week', colorClass: 'iconInterview' },
    { icon: Trophy, label: 'Offers', value: '2', delta: '+1 this month', colorClass: 'iconOffer' },
    { icon: TrendingUp, label: 'Response Rate', value: '42%', delta: '+5% this month', colorClass: 'iconRate' },
];

const MOCK_ACTIONS = [
    { type: 'follow-up', company: 'Google', role: 'Senior Frontend Engineer', time: '3d ago', note: 'Follow up with hiring manager' },
    { type: 'interview-prep', company: 'Stripe', role: 'Product Designer', time: '1d ago', note: 'Prepare for system design round' },
    { type: 'reply', company: 'Vercel', role: 'Developer Advocate', time: '2d ago', note: 'Reply to recruiter email' },
    { type: 'follow-up', company: 'Linear', role: 'Full Stack Engineer', time: '5d ago', note: 'Send thank you note' },
];

const MOCK_ACTIVITY = [
    { company: 'Stripe', role: 'Product Designer', time: 'Today', status: 'Interview', icon: Calendar },
    { company: 'Google', role: 'Sr. Frontend Engineer', time: 'Yesterday', status: 'Applied', icon: Mail },
    { company: 'Vercel', role: 'Developer Advocate', time: '2 days ago', status: 'Applied', icon: Mail },
    { company: 'OpenAI', role: 'ML Engineer', time: '3 days ago', status: 'Offer', icon: Trophy },
    { company: 'Figma', role: 'Design Engineer', time: '4 days ago', status: 'Interview', icon: Calendar },
];

const NAV_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, active: true },
    { label: 'Applications', icon: KanbanSquare },
    { label: 'Follow-ups', icon: Clock },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'Resume Library', icon: FileText },
];

export default function DashboardDemo() {
    return (
        <div className={styles.demoWrapper}>
            <div className={styles.demoFrame}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarLogo}>
                        <Zap size={16} strokeWidth={2.5} className={styles.logoIcon} />
                        <span>JobTracker</span>
                    </div>
                    <nav className={styles.sidebarNav}>
                        {NAV_ITEMS.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className={`${styles.sidebarItem} ${item.active ? styles.sidebarActive : ''}`}>
                                    <Icon size={14} />
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </nav>
                    <div className={styles.sidebarBottom}>
                        <div className={styles.sidebarItem}>
                            <Settings size={14} />
                            <span>Settings</span>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className={styles.mainArea}>
                    {/* Top Bar */}
                    <div className={styles.topBar}>
                        <div className={styles.searchBox}>
                            <Search size={12} className={styles.searchIcon} />
                            <span className={styles.searchPlaceholder}>Search applications...</span>
                        </div>
                        <div className={styles.topBarRight}>
                            <div className={styles.refreshBtn}><RefreshCw size={12} /></div>
                            <div className={styles.addBtn}>
                                <Plus size={12} strokeWidth={2.5} />
                                <span>Add Application</span>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        {/* Stat Cards */}
                        <div className={styles.statGrid}>
                            {MOCK_STATS.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={i} className={styles.statCard}>
                                        <div className={`${styles.statIconBox} ${styles[stat.colorClass]}`}>
                                            <Icon size={14} />
                                        </div>
                                        <div className={styles.statInfo}>
                                            <span className={styles.statLabel}>{stat.label}</span>
                                            <span className={styles.statNumber}>{stat.value}</span>
                                            <span className={styles.statDelta}>{stat.delta}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Middle Row */}
                        <div className={styles.middleRow}>
                            {/* Next Actions */}
                            <div className={styles.panel}>
                                <div className={styles.panelHeader}>
                                    <div>
                                        <h4 className={styles.panelTitle}>Next Actions</h4>
                                        <p className={styles.panelSub}>Stay on top of your job search</p>
                                    </div>
                                    <span className={styles.viewAll}>View All <ArrowRight size={10} /></span>
                                </div>
                                <div className={styles.actionsList}>
                                    {MOCK_ACTIONS.map((action, i) => (
                                        <div key={i} className={styles.actionItem}>
                                            <div className={styles.actionDot}>
                                                <Clock size={12} />
                                            </div>
                                            <div className={styles.actionContent}>
                                                <div className={styles.actionTop}>
                                                    <span className={`${styles.badge} ${styles[`badge_${action.type}`]}`}>
                                                        {action.type === 'follow-up' ? 'Follow up' : action.type === 'interview-prep' ? 'Interview Prep' : 'Reply'}
                                                    </span>
                                                    <span className={styles.actionTime}>{action.time}</span>
                                                </div>
                                                <span className={styles.actionCompany}>{action.company}</span>
                                                <span className={styles.actionRole}>{action.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className={styles.panel}>
                                <h4 className={styles.panelTitle}>Recent Activity</h4>
                                <div className={styles.activityList}>
                                    {MOCK_ACTIVITY.map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={i} className={styles.activityItem}>
                                                <div className={styles.activityIcon}>
                                                    <Icon size={12} />
                                                </div>
                                                <div className={styles.activityInfo}>
                                                    <span className={styles.activityCompany}>{item.company}</span>
                                                    <span className={styles.activityRole}>{item.role}</span>
                                                </div>
                                                <span className={styles.activityTime}>{item.time}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Metrics */}
                        <div className={styles.bottomMetrics}>
                            <div className={styles.metricCard}>
                                <span className={styles.metricLabel}>This Week</span>
                                <span className={styles.metricValue}>5 applications</span>
                                <span className={styles.metricDelta}>+25% from last week</span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricLabel}>Avg. Response Time</span>
                                <span className={styles.metricValue}>4.5 days</span>
                            </div>
                            <div className={styles.metricCard}>
                                <span className={styles.metricLabel}>Interview Rate</span>
                                <span className={styles.metricValue}>29%</span>
                                <span className={styles.metricNote}>Industry avg: 20%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glow effect behind the demo */}
            <div className={styles.glowEffect} />
        </div>
    );
}

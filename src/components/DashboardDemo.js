'use client';

import { useState } from 'react';
import styles from './DashboardDemo.module.css';
import {
    LayoutDashboard, KanbanSquare, Clock, BarChart3, FileText,
    Settings, Zap, Briefcase, Users, Trophy, TrendingUp,
    Search, Plus, RefreshCw, Mail, Calendar, Building2,
    ArrowRight, Target, Award, MapPin, DollarSign,
    GripVertical, AlertCircle, CheckCircle2, XCircle,
    Upload, Download, Eye, Star, MoreVertical,
    LogOut, Shield, Lock, Globe, Trash2, UserCircle,
} from 'lucide-react';

/* ============================================================
   MOCK DATA
   ============================================================ */

const MOCK_JOBS = [
    { id: 1, company: 'Google', role: 'Senior Frontend Engineer', location: 'Mountain View, CA', salary: '$180k-$250k', status: 'Interview', date: 'Jan 15', logo: '🔵' },
    { id: 2, company: 'Stripe', role: 'Product Designer', location: 'San Francisco, CA', salary: '$160k-$220k', status: 'Interview', date: 'Jan 18', logo: '🟣' },
    { id: 3, company: 'Vercel', role: 'Developer Advocate', location: 'Remote', salary: '$140k-$190k', status: 'Applied', date: 'Jan 20', logo: '⚫' },
    { id: 4, company: 'OpenAI', role: 'ML Engineer', location: 'San Francisco, CA', salary: '$200k-$300k', status: 'Offer', date: 'Jan 10', logo: '🟢' },
    { id: 5, company: 'Figma', role: 'Design Engineer', location: 'Remote', salary: '$150k-$210k', status: 'Applied', date: 'Jan 22', logo: '🔴' },
    { id: 6, company: 'Linear', role: 'Full Stack Engineer', location: 'Remote', salary: '$145k-$195k', status: 'Applied', date: 'Jan 23', logo: '🟡' },
    { id: 7, company: 'Notion', role: 'Backend Engineer', location: 'New York, NY', salary: '$155k-$205k', status: 'Rejected', date: 'Jan 8', logo: '⬜' },
    { id: 8, company: 'Airbnb', role: 'Data Scientist', location: 'San Francisco, CA', salary: '$170k-$240k', status: 'Applied', date: 'Jan 25', logo: '🟠' },
    { id: 9, company: 'Meta', role: 'iOS Engineer', location: 'Menlo Park, CA', salary: '$185k-$260k', status: 'Interview', date: 'Jan 12', logo: '🔵' },
    { id: 10, company: 'Netflix', role: 'Senior SRE', location: 'Los Gatos, CA', salary: '$200k-$350k', status: 'Applied', date: 'Jan 24', logo: '🔴' },
];

const MOCK_ACTIONS = [
    { type: 'follow-up', company: 'Google', role: 'Senior Frontend Engineer', time: '3d ago', note: 'Follow up with hiring manager' },
    { type: 'interview-prep', company: 'Stripe', role: 'Product Designer', time: '1d ago', note: 'Prepare for system design round' },
    { type: 'reply', company: 'Figma', role: 'Design Engineer', time: '2d ago', note: 'Reply to recruiter email' },
    { type: 'follow-up', company: 'Linear', role: 'Full Stack Engineer', time: '5d ago', note: 'Send thank you note' },
];

const MOCK_ACTIVITY = [
    { company: 'Vercel', role: 'Full Stack Engineer', time: '2 hours ago', status: 'Applied', icon: Mail },
    { company: 'Stripe', role: 'Senior Product Designer', time: '5 hours ago', status: 'Interview', icon: Calendar },
    { company: 'OpenAI', role: 'ML Engineer', time: '1 day ago', status: 'Offer', icon: Trophy },
    { company: 'Netflix', role: 'Senior SRE', time: '2 days ago', status: 'Applied', icon: Mail },
    { company: 'Meta', role: 'iOS Engineer', time: '3 days ago', status: 'Interview', icon: Calendar },
];

const MOCK_FOLLOWUPS = [
    { company: 'Google', role: 'Senior Frontend Engineer', daysAgo: 10, priority: 'high', lastAction: 'No response after phone screen', logo: '🔵' },
    { company: 'Meta', role: 'iOS Engineer', daysAgo: 7, priority: 'high', lastAction: 'Awaiting feedback from onsite', logo: '🔵' },
    { company: 'Vercel', role: 'Developer Advocate', daysAgo: 5, priority: 'medium', lastAction: 'Application submitted', logo: '⚫' },
    { company: 'Linear', role: 'Full Stack Engineer', daysAgo: 4, priority: 'medium', lastAction: 'Recruiter replied, pending scheduling', logo: '🟡' },
    { company: 'Airbnb', role: 'Data Scientist', daysAgo: 3, priority: 'low', lastAction: 'Applied via careers page', logo: '🟠' },
    { company: 'Netflix', role: 'Senior SRE', daysAgo: 2, priority: 'low', lastAction: 'Referral submitted', logo: '🔴' },
];

const MOCK_RESUMES = [
    { name: 'Software Engineer Resume', updated: 'Jan 20, 2025', uses: 8, type: 'PDF', starred: true },
    { name: 'Frontend Specialist Resume', updated: 'Jan 15, 2025', uses: 5, type: 'PDF', starred: true },
    { name: 'Full Stack Developer CV', updated: 'Dec 28, 2024', uses: 3, type: 'DOCX', starred: false },
    { name: 'Product Designer Resume', updated: 'Dec 10, 2024', uses: 2, type: 'PDF', starred: false },
];

const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'applications', label: 'Applications', icon: KanbanSquare },
    { key: 'followups', label: 'Follow-ups', icon: Clock },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'resumes', label: 'Resume Library', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
];

const KANBAN_COLS = [
    { key: 'Applied', color: '#818cf8', emoji: '📋' },
    { key: 'Interview', color: '#fbbf24', emoji: '🎤' },
    { key: 'Offer', color: '#22c55e', emoji: '🎉' },
    { key: 'Rejected', color: '#ef4444', emoji: '✕' },
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function DashboardDemo() {
    const [activeView, setActiveView] = useState('dashboard');

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
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.key}
                                    className={`${styles.sidebarItem} ${activeView === item.key ? styles.sidebarActive : ''}`}
                                    onClick={() => setActiveView(item.key)}
                                >
                                    <Icon size={14} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                    <div className={styles.sidebarBottom}>
                        <button className={styles.logoutBtn}>
                            <LogOut size={14} />
                            <span>Logout</span>
                        </button>
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

                    {/* Dynamic Content */}
                    <div className={styles.content}>
                        {activeView === 'dashboard' && <DashboardView />}
                        {activeView === 'applications' && <ApplicationsView />}
                        {activeView === 'followups' && <FollowupsView />}
                        {activeView === 'analytics' && <AnalyticsView />}
                        {activeView === 'resumes' && <ResumesView />}
                        {activeView === 'settings' && <SettingsView />}
                    </div>
                </div>
            </div>

            {/* Glow effect behind the demo */}
            <div className={styles.glowEffect} />
        </div>
    );
}

/* ============================================================
   VIEW: DASHBOARD HOME
   ============================================================ */
function DashboardView() {
    const STATS = [
        { icon: Briefcase, label: 'Applied', value: '24', delta: '+3 this week', colorClass: 'iconApplied' },
        { icon: Users, label: 'Interviews', value: '7', delta: '+2 this week', colorClass: 'iconInterview' },
        { icon: Trophy, label: 'Offers', value: '2', delta: '+1 this month', colorClass: 'iconOffer' },
        { icon: TrendingUp, label: 'Response Rate', value: '42%', delta: '+5% this month', colorClass: 'iconRate' },
    ];

    return (
        <>
            <div className={styles.statGrid}>
                {STATS.map((stat, i) => {
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

            <div className={styles.middleRow}>
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
                                <div className={styles.actionDot}><Clock size={10} /></div>
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

                <div className={styles.panel}>
                    <h4 className={styles.panelTitle}>Recent Activity</h4>
                    <div className={styles.activityList}>
                        {MOCK_ACTIVITY.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className={styles.activityItem}>
                                    <div className={styles.activityIcon}><Icon size={10} /></div>
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
        </>
    );
}

/* ============================================================
   VIEW: APPLICATIONS (Kanban)
   ============================================================ */
function ApplicationsView() {
    return (
        <div className={styles.kanban}>
            {KANBAN_COLS.map(col => {
                const colJobs = MOCK_JOBS.filter(j => j.status === col.key);
                return (
                    <div key={col.key} className={styles.kanbanCol}>
                        <div className={styles.kanbanColHeader}>
                            <span className={styles.kanbanColDot} style={{ background: col.color }} />
                            <span className={styles.kanbanColTitle}>{col.key}</span>
                            <span className={styles.kanbanColCount}>{colJobs.length}</span>
                        </div>
                        <div className={styles.kanbanCards}>
                            {colJobs.map(job => (
                                <div key={job.id} className={styles.kanbanCard}>
                                    <div className={styles.kanbanCardTop}>
                                        <span className={styles.kanbanLogo}>{job.logo}</span>
                                        <span className={styles.kanbanDate}>{job.date}</span>
                                    </div>
                                    <span className={styles.kanbanCompany}>{job.company}</span>
                                    <span className={styles.kanbanRole}>{job.role}</span>
                                    <div className={styles.kanbanMeta}>
                                        <span><MapPin size={8} /> {job.location}</span>
                                        <span><DollarSign size={8} /> {job.salary}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ============================================================
   VIEW: FOLLOW-UPS
   ============================================================ */
function FollowupsView() {
    return (
        <div className={styles.followups}>
            <div className={styles.followupsHeader}>
                <h4 className={styles.panelTitle}>Follow-up Center</h4>
                <p className={styles.panelSub}>Applications that need your attention</p>
            </div>
            <div className={styles.followupsTabs}>
                <button className={`${styles.fTab} ${styles.fTabActive}`}>All ({MOCK_FOLLOWUPS.length})</button>
                <button className={styles.fTab}>High Priority (2)</button>
                <button className={styles.fTab}>Overdue (1)</button>
            </div>
            <div className={styles.followupsList}>
                {MOCK_FOLLOWUPS.map((f, i) => (
                    <div key={i} className={styles.followupItem}>
                        <span className={styles.followupLogo}>{f.logo}</span>
                        <div className={styles.followupInfo}>
                            <span className={styles.followupCompany}>{f.company}</span>
                            <span className={styles.followupRole}>{f.role}</span>
                            <span className={styles.followupNote}>{f.lastAction}</span>
                        </div>
                        <div className={styles.followupRight}>
                            <span className={`${styles.priorityBadge} ${styles[`priority_${f.priority}`]}`}>{f.priority}</span>
                            <span className={styles.followupDays}>{f.daysAgo}d ago</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ============================================================
   VIEW: ANALYTICS
   ============================================================ */
function AnalyticsView() {
    const funnelData = [
        { label: 'Applied', count: 24, pct: 100, color: '#818cf8' },
        { label: 'Response', count: 10, pct: 42, color: '#60a5fa' },
        { label: 'Interview', count: 7, pct: 29, color: '#14b8a6' },
        { label: 'Offer', count: 2, pct: 8, color: '#22c55e' },
    ];

    const sourceData = [
        { name: 'LinkedIn', pct: 35, color: '#818cf8' },
        { name: 'Referral', pct: 25, color: '#14b8a6' },
        { name: 'Career Site', pct: 20, color: '#60a5fa' },
        { name: 'Recruiter', pct: 15, color: '#a78bfa' },
        { name: 'Other', pct: 5, color: '#6b7280' },
    ];

    return (
        <div className={styles.analyticsView}>
            {/* Score */}
            <div className={styles.scoreRow}>
                <div className={styles.scoreCard}>
                    <div className={styles.scoreRing}>
                        <svg viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                            <circle cx="40" cy="40" r="32" fill="none" stroke="#14b8a6" strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${(87 / 100) * 201} 201`}
                                transform="rotate(-90 40 40)" />
                        </svg>
                        <span className={styles.scoreNum}>87</span>
                    </div>
                    <div className={styles.scoreInfo}>
                        <span className={styles.scoreTitleText}>Job Search Score</span>
                        <span className={styles.scoreDesc}>Great work! You&apos;re above average.</span>
                        <span className={styles.scoreBadge}><Award size={10} /> Top 15%</span>
                    </div>
                </div>

                {/* Mini stat cards */}
                <div className={styles.miniStats}>
                    {[
                        { label: 'Response Rate', value: '42%', delta: '+5%', positive: true },
                        { label: 'Interview Rate', value: '29%', delta: '+9%', positive: true },
                        { label: 'Avg. Response', value: '4.5d', delta: '-1d', positive: true },
                        { label: 'Offer Rate', value: '8%', delta: '2/24', positive: false },
                    ].map((s, i) => (
                        <div key={i} className={styles.miniStat}>
                            <span className={styles.miniStatLabel}>{s.label}</span>
                            <span className={styles.miniStatVal}>{s.value}</span>
                            <span className={s.positive ? styles.miniStatUp : styles.miniStatMuted}>{s.delta}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Funnel + Sources */}
            <div className={styles.analyticsTwoCol}>
                <div className={styles.analyticsCard}>
                    <h5 className={styles.analyticsCardTitle}>Application Funnel</h5>
                    <div className={styles.funnelBars}>
                        {funnelData.map((f, i) => (
                            <div key={i} className={styles.funnelRow}>
                                <span className={styles.funnelLabel}>{f.label}</span>
                                <div className={styles.funnelTrack}>
                                    <div className={styles.funnelFill} style={{ width: `${f.pct}%`, background: f.color }} />
                                </div>
                                <span className={styles.funnelVal}>{f.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.analyticsCard}>
                    <h5 className={styles.analyticsCardTitle}>Application Sources</h5>
                    <div className={styles.sourcesChart}>
                        <div className={styles.donutMini}>
                            <svg viewBox="0 0 80 80">
                                {(() => {
                                    let offset = 0;
                                    const circ = 2 * Math.PI * 30;
                                    return sourceData.map((s, i) => {
                                        const dash = (s.pct / 100) * circ;
                                        const o = offset;
                                        offset += dash;
                                        return (
                                            <circle key={i} cx="40" cy="40" r="30" fill="none"
                                                stroke={s.color} strokeWidth="10"
                                                strokeDasharray={`${dash} ${circ - dash}`}
                                                strokeDashoffset={-o}
                                                transform="rotate(-90 40 40)" />
                                        );
                                    });
                                })()}
                            </svg>
                        </div>
                        <div className={styles.sourceLegend}>
                            {sourceData.map((s, i) => (
                                <div key={i} className={styles.sourceItem}>
                                    <span className={styles.sourceDot} style={{ background: s.color }} />
                                    <span className={styles.sourceName}>{s.name}</span>
                                    <span className={styles.sourcePct}>{s.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   VIEW: RESUME LIBRARY
   ============================================================ */
function ResumesView() {
    return (
        <div className={styles.resumeView}>
            <div className={styles.resumeHeader}>
                <div>
                    <h4 className={styles.panelTitle}>Resume Library</h4>
                    <p className={styles.panelSub}>Manage and organize your resumes</p>
                </div>
                <div className={styles.uploadBtn}>
                    <Upload size={10} />
                    <span>Upload Resume</span>
                </div>
            </div>
            <div className={styles.resumeGrid}>
                {MOCK_RESUMES.map((r, i) => (
                    <div key={i} className={styles.resumeCard}>
                        <div className={styles.resumeCardTop}>
                            <div className={styles.resumeFileIcon}>
                                <FileText size={16} />
                            </div>
                            <div className={styles.resumeActions}>
                                {r.starred && <Star size={10} className={styles.starFilled} />}
                                <MoreVertical size={10} />
                            </div>
                        </div>
                        <span className={styles.resumeName}>{r.name}</span>
                        <span className={styles.resumeMeta}>Updated {r.updated}</span>
                        <div className={styles.resumeBottom}>
                            <span className={styles.resumeType}>{r.type}</span>
                            <span className={styles.resumeUses}>Used {r.uses}x</span>
                        </div>
                        <div className={styles.resumeBtns}>
                            <button className={styles.resumeBtn}><Eye size={9} /> View</button>
                            <button className={styles.resumeBtn}><Download size={9} /> Download</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ============================================================
   VIEW: SETTINGS (All features)
   ============================================================ */
function SettingsView() {
    return (
        <div className={styles.settingsView}>
            {/* Profile Section */}
            <div className={styles.settingsSection}>
                <h4 className={styles.settingsSectionTitle}>
                    <UserCircle size={14} /> Profile
                </h4>
                <div className={styles.googleCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 800, fontSize: '1.2rem'
                        }}>DU</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>Demo User</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>demo.user@gmail.com</span>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Display Name</span>
                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text)' }}>Demo User</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Timezone</span>
                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text)' }}>America/Chicago (CST)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Google Connection */}
            <div className={styles.settingsSection}>
                <h4 className={styles.settingsSectionTitle}>
                    <Globe size={14} /> Gmail Integration
                </h4>
                <div className={styles.googleCard}>
                    <div className={styles.googleCardTop}>
                        <div className={styles.googleLogo}>
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                        </div>
                        <div className={styles.googleInfo}>
                            <span className={styles.googleTitle}>Google Account</span>
                            <span className={styles.googleEmail}>demo.user@gmail.com</span>
                        </div>
                        <span className={styles.connectedBadge}>
                            <CheckCircle2 size={10} /> Connected
                        </span>
                    </div>

                    <div className={styles.permissionsList}>
                        <span className={styles.permissionsLabel}>Permissions granted:</span>
                        <div className={styles.permissionItem}>
                            <Mail size={10} /> Read email subjects & bodies (for job detection)
                        </div>
                        <div className={styles.permissionItem}>
                            <Eye size={10} /> View email metadata (sender, date)
                        </div>
                        <div className={styles.permissionItem}>
                            <Search size={10} /> Search emails for job-related keywords
                        </div>
                    </div>

                    <div className={styles.googleActions}>
                        <button className={styles.scanBtn}>
                            <RefreshCw size={10} /> Scan Now
                        </button>
                        <button className={styles.disconnectBtn}>
                            <XCircle size={10} /> Disconnect
                        </button>
                    </div>

                    <div className={styles.lastScanInfo}>
                        <span>Last scan: 2 hours ago - 3 new applications found</span>
                    </div>
                </div>
            </div>

            {/* Privacy & Security */}
            <div className={styles.settingsSection}>
                <h4 className={styles.settingsSectionTitle}>
                    <Shield size={14} /> Privacy & Security
                </h4>
                <div className={styles.privacyCard}>
                    <p className={styles.privacyIntro}>
                        We take your privacy seriously. Here&apos;s exactly how your Gmail data is handled:
                    </p>
                    <div className={styles.privacyList}>
                        <div className={styles.privacyItem}>
                            <div className={styles.privacyIcon}><Eye size={12} /></div>
                            <div className={styles.privacyContent}>
                                <span className={styles.privacyTitle}>Read-Only Access</span>
                                <span className={styles.privacyDesc}>We only read your emails - we can never send, delete, or modify them.</span>
                            </div>
                        </div>
                        <div className={styles.privacyItem}>
                            <div className={styles.privacyIcon}><Search size={12} /></div>
                            <div className={styles.privacyContent}>
                                <span className={styles.privacyTitle}>Smart Filtering</span>
                                <span className={styles.privacyDesc}>We only scan for job-related emails. Personal emails are ignored.</span>
                            </div>
                        </div>
                        <div className={styles.privacyItem}>
                            <div className={styles.privacyIcon}><Lock size={12} /></div>
                            <div className={styles.privacyContent}>
                                <span className={styles.privacyTitle}>Encrypted & Secure</span>
                                <span className={styles.privacyDesc}>All data is encrypted in transit (TLS) and at rest.</span>
                            </div>
                        </div>
                        <div className={styles.privacyItem}>
                            <div className={styles.privacyIcon}><XCircle size={12} /></div>
                            <div className={styles.privacyContent}>
                                <span className={styles.privacyTitle}>No Third-Party Sharing</span>
                                <span className={styles.privacyDesc}>Your data is never sold, shared, or used for advertising.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Target Role */}
            <div className={styles.settingsSection}>
                <h4 className={styles.settingsSectionTitle}>
                    <Briefcase size={14} /> Target Role
                </h4>
                <div className={styles.googleCard}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ideal Role</span>
                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text)' }}>Senior Frontend Engineer</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Min Salary</span>
                                <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text)' }}>$150,000</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max Salary</span>
                                <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text)' }}>$250,000</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Work Type</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {['Remote', 'Hybrid', 'Onsite'].map((type) => (
                                    <span key={type} style={{
                                        padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                                        background: type === 'Remote' ? 'var(--primary)' : 'var(--bg)',
                                        color: type === 'Remote' ? 'white' : 'var(--muted)',
                                        border: `1px solid ${type === 'Remote' ? 'var(--primary)' : 'var(--border)'}`,
                                    }}>{type}</span>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferred Locations</span>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {['San Francisco', 'New York', 'Austin', 'Seattle'].map((loc) => (
                                    <span key={loc} style={{
                                        padding: '4px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500,
                                        background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)', color: 'var(--primary)',
                                    }}>{loc}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Goals */}
            <div className={styles.settingsSection}>
                <h4 className={styles.settingsSectionTitle}>
                    <Trophy size={14} /> Application Goals
                </h4>
                <div className={styles.googleCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                        {/* Progress Ring */}
                        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
                                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--primary)" strokeWidth="6"
                                    strokeDasharray={`${2 * Math.PI * 34 * 0.7} ${2 * Math.PI * 34 * 0.3}`}
                                    strokeLinecap="round" />
                            </svg>
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>7</span>
                                <span style={{ fontSize: '0.55rem', color: 'var(--muted)' }}>of 10</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>This Week</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>7 / 10</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Streak</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24' }}>🔥 5 weeks</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)' }}>
                            <span>Weekly Target</span>
                            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>10 apps/week</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '70%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Export CSV */}
            <div className={styles.settingsSection}>
                <h4 className={styles.settingsSectionTitle}>
                    <FileText size={14} /> Export Data
                </h4>
                <div className={styles.googleCard}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Download as CSV</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Export all 10 job applications</span>
                        </div>
                        <button style={{
                            padding: '8px 18px', borderRadius: '8px', background: 'var(--primary)',
                            color: 'white', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            <FileText size={12} /> Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Public Profile */}
            <div className={styles.settingsSection}>
                <h4 className={styles.settingsSectionTitle}>
                    <Globe size={14} /> Public Profile
                </h4>
                <div className={styles.googleCard}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--accent-bg)', borderRadius: '10px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                                <Eye size={14} /> Profile is Public
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Anyone with the link can see your aggregated stats</span>
                        </div>
                        <div style={{
                            width: '42px', height: '24px', borderRadius: '12px',
                            background: 'var(--primary)', position: 'relative', cursor: 'pointer',
                        }}>
                            <div style={{
                                width: '18px', height: '18px', borderRadius: '50%',
                                background: 'white', position: 'absolute', top: '3px', right: '3px',
                            }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '14px', fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                        🔗 yoursite.com/profile/demo-user
                        <span style={{ marginLeft: 'auto', cursor: 'pointer', color: 'var(--muted)' }}>📋</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</span>
                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text)' }}>demo-user</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Display Name</span>
                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text)' }}>Demo User</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>Visible on Profile</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            {['Activity Heatmap', 'Application Pipeline', 'Source Breakdown', 'Streak Badge'].map((item) => (
                                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text)', cursor: 'pointer' }}>
                                    <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }}>✓</span>
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Account */}
            <div className={styles.settingsSection}>
                <h4 className={styles.settingsSectionTitle}>
                    <UserCircle size={14} /> Account
                </h4>
                <div className={styles.accountCard}>
                    <div className={styles.accountRow}>
                        <div className={styles.accountInfo}>
                            <span className={styles.accountName}>Demo User</span>
                            <span className={styles.accountEmail}>demo.user@gmail.com</span>
                        </div>
                        <button className={styles.logoutBtnLarge}>
                            <LogOut size={12} /> Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Components
import Sidebar from '@/components/Sidebar';
import DashboardHome from '@/components/DashboardHome';
import KanbanBoard from '@/components/KanbanBoard';
import AddJobModal from '@/components/AddJobModal';
import JobDetailDrawer from '@/components/JobDetailDrawer';
import SearchFilter from '@/components/SearchFilter';
import GmailConnect from '@/components/GmailConnect';
import Analytics from '@/components/Analytics';
import ResumeLibrary from '@/components/ResumeLibrary';
import FollowUpCenter from '@/components/FollowUpCenter';
import OnboardingTour from '@/components/OnboardingTour';
import SettingsPublicProfile from '@/components/SettingsPublicProfile';
import SettingsProfile from '@/components/SettingsProfile';
import SettingsTargetRole from '@/components/SettingsTargetRole';
import SettingsGoals from '@/components/SettingsGoals';
import SettingsExport from '@/components/SettingsExport';

import { Search, RefreshCw, Plus, AlertTriangle, Trash2, Shield, Eye, Lock, Filter, XCircle, Trash } from 'lucide-react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // View state
    const [activeView, setActiveView] = useState('dashboard');

    // Data state
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [gmailConnected, setGmailConnected] = useState(false);
    const [notification, setNotification] = useState(null);

    // Check for Gmail connection status from URL params
    useEffect(() => {
        const gmailConnectedParam = searchParams.get('gmail_connected');
        const gmailError = searchParams.get('gmail_error');

        if (gmailConnectedParam === 'true') {
            setGmailConnected(true);
            setNotification({ type: 'success', message: 'Gmail connected successfully!' });
            window.history.replaceState({}, '', '/dashboard');
        } else if (gmailError) {
            setNotification({ type: 'error', message: `Gmail connection failed: ${gmailError}` });
            window.history.replaceState({}, '', '/dashboard');
        }
    }, [searchParams]);

    // Check Gmail connection on load
    useEffect(() => {
        const checkGmailStatus = async () => {
            try {
                const response = await fetch('/api/gmail/status');
                const data = await response.json();
                setGmailConnected(data.connected);
            } catch (err) {
                console.error('Error checking Gmail status:', err);
            }
        };
        checkGmailStatus();
    }, []);

    // Auto-dismiss notifications
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    // Fetch jobs
    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [user]);

    // Filter jobs
    useEffect(() => {
        let result = [...jobs];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                job =>
                    job.company_name.toLowerCase().includes(query) ||
                    job.job_title.toLowerCase().includes(query)
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter(job => job.status === statusFilter);
        }

        setFilteredJobs(result);
    }, [jobs, searchQuery, statusFilter]);

    const fetchJobs = async () => {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .select('*')
                .eq('user_id', user.id)
                .order('date_applied', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddJob = async (jobData) => {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .insert([{ ...jobData, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            setJobs(prev => [data, ...prev]);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error adding job:', error);
            throw error;
        }
    };

    const handleAddJobsFromGmail = async (gmailJobs) => {
        for (const job of gmailJobs) {
            try {
                const { data, error } = await supabase
                    .from('job_applications')
                    .insert([{
                        company_name: job.company_name,
                        job_title: job.job_title,
                        date_applied: job.date_applied,
                        status: job.status,
                        source: 'gmail',
                        user_id: user.id,
                        gmail_message_id: job.gmail_message_id || job.id,
                        contact_email: job.contact_email,
                    }])
                    .select()
                    .single();

                if (error) throw error;
                setJobs(prev => [data, ...prev]);
            } catch (error) {
                console.error('Error adding job from Gmail:', error);
            }
        }
        setNotification({
            type: 'success',
            message: `Added ${gmailJobs.length} application(s) from Gmail`
        });
    };

    const handleUpdateJob = async (id, updates) => {
        try {
            const { data, error } = await supabase
                .from('job_applications')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            setJobs(prev => prev.map(job => job.id === id ? data : job));
            if (selectedJob?.id === id) {
                setSelectedJob(data);
            }
        } catch (error) {
            console.error('Error updating job:', error);
            throw error;
        }
    };

    const handleDeleteJob = async (id) => {
        try {
            const { error } = await supabase
                .from('job_applications')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;
            setJobs(prev => prev.filter(job => job.id !== id));
            setSelectedJob(null);
        } catch (error) {
            console.error('Error deleting job:', error);
            throw error;
        }
    };

    const handleDeleteAllJobs = async () => {
        if (!confirm('⚠️ Are you sure you want to delete ALL job applications? This cannot be undone!')) {
            return;
        }
        try {
            const { error } = await supabase
                .from('job_applications')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            setJobs([]);
            setNotification({ type: 'success', message: 'All jobs deleted successfully' });
        } catch (error) {
            console.error('Error deleting all jobs:', error);
            setNotification({ type: 'error', message: 'Failed to delete all jobs' });
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        await handleUpdateJob(id, { status: newStatus });
    };

    const handleMarkFollowedUp = async (id) => {
        await handleUpdateJob(id, { followed_up: true });
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    if (authLoading || loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner"></div>
                <p>Loading your applications...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // ---- VIEW TITLES ----
    const viewTitles = {
        dashboard: 'Dashboard',
        applications: 'Applications',
        followups: 'Follow-up Center',
        analytics: 'Analytics',
        resume: 'Resume Library',
        settings: 'Settings',
    };

    const viewSubtitles = {
        applications: 'Track your job applications from interest to offer',
        followups: 'Stay on top of your applications with smart follow-ups',
        analytics: 'Track your progress and optimize your strategy',
        resume: 'Manage your base resume and tailored versions',
        settings: 'Manage your account and integrations',
    };

    // ---- RENDER VIEW CONTENT ----
    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <DashboardHome
                        jobs={jobs}
                        onViewChange={setActiveView}
                    />
                );

            case 'applications':
                return (
                    <>
                        <div className={styles.controlsRow}>
                            <SearchFilter
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                            />
                        </div>
                        <div data-tour="kanban-board">
                            <KanbanBoard
                                jobs={filteredJobs}
                                onJobClick={setSelectedJob}
                                onStatusChange={handleStatusChange}
                                userEmail={user?.email}
                            />
                        </div>
                    </>
                );

            case 'followups':
                return (
                    <FollowUpCenter
                        jobs={jobs}
                        onJobClick={setSelectedJob}
                        onMarkFollowedUp={handleMarkFollowedUp}
                    />
                );

            case 'analytics':
                return <Analytics jobs={jobs} />;

            case 'resume':
                return <ResumeLibrary userId={user?.id} mode="manage" />;

            case 'settings':
                return (
                    <div className={styles.settingsContent}>
                        {/* Profile */}
                        <SettingsProfile userEmail={user?.email} />

                        <div data-tour="gmail-connect">
                            <GmailConnect
                                onJobsFound={handleAddJobsFromGmail}
                                isConnected={gmailConnected}
                                setIsConnected={setGmailConnected}
                                userId={user?.id}
                            />
                        </div>

                        {/* Privacy & Security */}
                        <div className={styles.privacySection}>
                            <h3 className={styles.sectionTitle}>
                                <Shield size={18} /> Privacy & Security
                            </h3>
                            <div className={styles.privacyCard}>
                                <p className={styles.privacyIntro}>
                                    We take your privacy seriously. Here's exactly how your Gmail data is handled:
                                </p>
                                <div className={styles.privacyList}>
                                    <div className={styles.privacyItem}>
                                        <div className={styles.privacyIcon} style={{ background: 'rgba(20, 184, 166, 0.15)', color: '#14b8a6' }}>
                                            <Eye size={16} />
                                        </div>
                                        <div className={styles.privacyContent}>
                                            <strong>Read-Only Access</strong>
                                            <span>We only read your emails - we can never send, delete, or modify them.</span>
                                        </div>
                                    </div>
                                    <div className={styles.privacyItem}>
                                        <div className={styles.privacyIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                                            <Filter size={16} />
                                        </div>
                                        <div className={styles.privacyContent}>
                                            <strong>Smart Filtering</strong>
                                            <span>We only scan for job-related emails (confirmations, interviews, offers). Personal emails are ignored.</span>
                                        </div>
                                    </div>
                                    <div className={styles.privacyItem}>
                                        <div className={styles.privacyIcon} style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                                            <Lock size={16} />
                                        </div>
                                        <div className={styles.privacyContent}>
                                            <strong>Encrypted & Secure</strong>
                                            <span>All data is encrypted in transit (TLS) and at rest. Your tokens are securely stored.</span>
                                        </div>
                                    </div>
                                    <div className={styles.privacyItem}>
                                        <div className={styles.privacyIcon} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                                            <XCircle size={16} />
                                        </div>
                                        <div className={styles.privacyContent}>
                                            <strong>No Third-Party Sharing</strong>
                                            <span>Your data is never sold, shared, or used for advertising. Period.</span>
                                        </div>
                                    </div>
                                    <div className={styles.privacyItem}>
                                        <div className={styles.privacyIcon} style={{ background: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' }}>
                                            <Trash size={16} />
                                        </div>
                                        <div className={styles.privacyContent}>
                                            <strong>Disconnect Anytime</strong>
                                            <span>Revoke access with one click. We'll delete all stored tokens immediately.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Target Role */}
                        <SettingsTargetRole />

                        {/* Application Goals */}
                        <SettingsGoals jobs={jobs} />

                        {/* Export */}
                        <SettingsExport jobs={jobs} />

                        {/* Public Profile */}
                        <SettingsPublicProfile userId={user?.id} />

                        <ResumeLibrary userId={user?.id} mode="manage" />

                        <div className={styles.dangerZone}>
                            <h4>
                                <AlertTriangle size={16} strokeWidth={2} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                                Danger Zone
                            </h4>
                            <p>Delete all your job applications. This cannot be undone.</p>
                            <button
                                onClick={handleDeleteAllJobs}
                                className="btn"
                                style={{
                                    backgroundColor: 'var(--danger)',
                                    color: 'white',
                                    marginTop: 'var(--space-2)'
                                }}
                                disabled={jobs.length === 0}
                            >
                                <Trash2 size={16} strokeWidth={2} /> Delete All Jobs ({jobs.length})
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <Sidebar
                activeView={activeView}
                onViewChange={setActiveView}
                onLogout={handleLogout}
            />

            {/* Main Area */}
            <div className={styles.mainArea}>
                {/* Top Bar */}
                <header className={styles.topBar}>
                    <div className={styles.searchBox}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.topBarRight}>
                        <button
                            onClick={fetchJobs}
                            className={styles.refreshBtn}
                            title="Refresh"
                        >
                            <RefreshCw size={16} />
                        </button>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className={styles.addBtn}
                            data-tour="add-job"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            <span>Add Application</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className={styles.content}>
                    {/* Page Title (not for dashboard home) */}
                    {activeView !== 'dashboard' && (
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>{viewTitles[activeView]}</h1>
                            {viewSubtitles[activeView] && (
                                <p className={styles.pageSubtitle}>{viewSubtitles[activeView]}</p>
                            )}
                        </div>
                    )}

                    {renderContent()}
                </main>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`${styles.toast} ${styles[notification.type]}`}>
                    {notification.message}
                    <button
                        onClick={() => setNotification(null)}
                        className={styles.toastClose}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Onboarding Tour */}
            <OnboardingTour userId={user?.id} />

            {/* Add Job Modal */}
            {isAddModalOpen && (
                <AddJobModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddJob}
                />
            )}

            {/* Job Detail Drawer */}
            {selectedJob && (
                <JobDetailDrawer
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    onUpdate={handleUpdateJob}
                    onDelete={handleDeleteJob}
                    userId={user?.id}
                />
            )}
        </div>
    );
}

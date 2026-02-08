'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import SummaryBar from '@/components/SummaryBar';
import KanbanBoard from '@/components/KanbanBoard';
import AddJobButton from '@/components/AddJobButton';
import AddJobModal from '@/components/AddJobModal';
import JobDetailDrawer from '@/components/JobDetailDrawer';
import SearchFilter from '@/components/SearchFilter';
import GmailConnect from '@/components/GmailConnect';
import Analytics from '@/components/Analytics';
import ExportButton from '@/components/ExportButton';
import ResumeLibrary from '@/components/ResumeLibrary';
import OnboardingTour from '@/components/OnboardingTour';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showSettings, setShowSettings] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [gmailConnected, setGmailConnected] = useState(false);
    const [notification, setNotification] = useState(null);

    // Check for Gmail connection status from URL params
    useEffect(() => {
        const gmailConnectedParam = searchParams.get('gmail_connected');
        const gmailError = searchParams.get('gmail_error');

        if (gmailConnectedParam === 'true') {
            setGmailConnected(true);
            setNotification({ type: 'success', message: 'Gmail connected successfully!' });
            // Clean URL
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
                        gmail_message_id: job.gmail_message_id || job.id, // Store message ID for duplicate detection
                        contact_email: job.contact_email, // Store email for follow-up feature
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

    // Calculate stats
    const stats = {
        total: jobs.length,
        interviews: jobs.filter(j => j.status === 'Interview').length,
        offers: jobs.filter(j => j.status === 'Offer').length,
        pending: jobs.filter(j => {
            if (j.status !== 'Applied' || j.followed_up) return false;
            const daysSinceApplied = Math.floor(
                (new Date() - new Date(j.date_applied)) / (1000 * 60 * 60 * 24)
            );
            return daysSinceApplied >= 7;
        }).length,
    };

    return (
        <div className={styles.container}>
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

            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>📋</span>
                        <span className={styles.logoText}>JobTracker</span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        className={`btn btn-ghost btn-sm ${showAnalytics ? styles.activeBtn : ''}`}
                        title="Analytics"
                    >
                        📊 <span className={styles.btnText}>Analytics</span>
                    </button>
                    <ExportButton jobs={jobs} />
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`btn btn-ghost btn-sm ${showSettings ? styles.activeBtn : ''}`}
                        data-tour="settings"
                        title="Settings"
                    >
                        ⚙️ <span className={styles.btnText}>Settings</span>
                    </button>
                    <button onClick={toggleTheme} className="btn btn-ghost btn-sm" title="Toggle theme">
                        {theme === 'dark' ? '🌙' : '☀️'}
                    </button>
                    <span className={styles.userEmail}>{user.email}</span>
                    <button onClick={handleLogout} className={`btn btn-ghost btn-sm ${styles.logoutBtn}`} title="Log out">
                        🚪 <span className={styles.btnText}>Log out</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Settings Panel */}
                {showSettings && (
                    <div className={styles.settingsPanel}>
                        <div data-tour="gmail-connect">
                            <GmailConnect
                                onJobsFound={handleAddJobsFromGmail}
                                isConnected={gmailConnected}
                                setIsConnected={setGmailConnected}
                                userId={user?.id}
                            />
                        </div>

                        {/* Resume Library */}
                        <ResumeLibrary userId={user?.id} mode="manage" />

                        {/* Danger Zone */}
                        <div className={styles.dangerZone}>
                            <h4>⚠️ Danger Zone</h4>
                            <p>Delete all your job applications. This cannot be undone.</p>
                            <button
                                onClick={handleDeleteAllJobs}
                                className="btn"
                                style={{
                                    backgroundColor: 'var(--color-error)',
                                    color: 'white',
                                    marginTop: 'var(--space-2)'
                                }}
                                disabled={jobs.length === 0}
                            >
                                🗑️ Delete All Jobs ({jobs.length})
                            </button>
                        </div>
                    </div>
                )}

                {/* Analytics Panel */}
                {showAnalytics && (
                    <div className={styles.analyticsPanel}>
                        <Analytics jobs={jobs} />
                    </div>
                )}

                {/* Summary Bar */}
                <SummaryBar stats={stats} />

                {/* Search & Filter */}
                <div className={styles.controlsRow}>
                    <SearchFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />
                </div>

                {/* Kanban Board */}
                <div data-tour="kanban-board">
                    <KanbanBoard
                        jobs={filteredJobs}
                        onJobClick={setSelectedJob}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            </main>

            {/* Floating Add Button */}
            <div data-tour="add-job">
                <AddJobButton onClick={() => setIsAddModalOpen(true)} />
            </div>

            {/* Onboarding Tour for New Users */}
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

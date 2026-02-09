'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import styles from './admin.module.css';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        initAndFetch();
    }, []);

    const initAndFetch = async () => {
        // Get user email first
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
            setUserEmail(session.user.email);
            await fetchStats(session.user.email);
        } else {
            setError('Not authenticated');
            setLoading(false);
        }
    };

    const fetchStats = async (email) => {
        try {
            const res = await fetch('/api/admin/stats', {
                headers: {
                    'x-admin-email': email
                }
            });
            if (!res.ok) throw new Error('Failed to fetch stats');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    // Prepare chart data
    const statusData = Object.entries(stats?.statusBreakdown || {}).map(([name, value]) => ({
        name,
        value
    }));

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1>📊 Admin Dashboard</h1>
                <p>Overview of your Job Tracker SaaS platform</p>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <p className={styles.statValue}>{stats?.overview?.totalUsers || 0}</p>
                    <p className={styles.statLabel}>Total Users</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📋</div>
                    <p className={styles.statValue}>{stats?.overview?.totalJobs || 0}</p>
                    <p className={styles.statLabel}>Total Jobs Tracked</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📧</div>
                    <p className={styles.statValue}>{stats?.overview?.gmailJobs || 0}</p>
                    <p className={styles.statLabel}>From Gmail</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>✍️</div>
                    <p className={styles.statValue}>{stats?.overview?.manualJobs || 0}</p>
                    <p className={styles.statLabel}>Manual Entries</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsSection}>
                {/* Activity Chart */}
                <div className={styles.chartCard}>
                    <h3>📈 Activity (Last 30 Days)</h3>
                    {stats?.activityChart?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={stats.activityChart}>
                                <defs>
                                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    tickFormatter={(val) => val.slice(5)}
                                />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="jobs"
                                    stroke="#6366f1"
                                    fillOpacity={1}
                                    fill="url(#colorJobs)"
                                    name="Jobs Added"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="activeUsers"
                                    stroke="#22c55e"
                                    fill="transparent"
                                    name="Active Users"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.emptyState}>No activity data yet</div>
                    )}
                </div>

                {/* Status Distribution */}
                <div className={styles.chartCard}>
                    <h3>📊 Jobs by Status</h3>
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.emptyState}>No job data yet</div>
                    )}
                </div>
            </div>

            {/* Gmail Tokens & ML Stats Row */}
            <div className={styles.chartsSection}>
                {/* Gmail Token Status */}
                <div className={styles.chartCard}>
                    <h3>🔐 Gmail Connection Status</h3>
                    <div className={styles.tokenStatus}>
                        <div className={styles.tokenItem}>
                            <p className={`${styles.tokenCount} ${styles.tokenValid}`}>
                                {stats?.gmailTokens?.valid || 0}
                            </p>
                            <p className={styles.tokenLabel}>Valid Tokens</p>
                        </div>
                        <div className={styles.tokenItem}>
                            <p className={`${styles.tokenCount} ${styles.tokenExpired}`}>
                                {stats?.gmailTokens?.expired || 0}
                            </p>
                            <p className={styles.tokenLabel}>Expired Tokens</p>
                        </div>
                        <div className={styles.tokenItem}>
                            <p className={styles.tokenCount} style={{ color: '#94a3b8' }}>
                                {stats?.gmailTokens?.total || 0}
                            </p>
                            <p className={styles.tokenLabel}>Total Connected</p>
                        </div>
                    </div>
                </div>

                {/* ML Performance */}
                <div className={styles.chartCard}>
                    <h3>🤖 ML Classification Stats</h3>
                    <div className={styles.tokenStatus}>
                        <div className={styles.tokenItem}>
                            <p className={styles.tokenCount} style={{ color: '#6366f1' }}>
                                {stats?.scanStats?.total || 0}
                            </p>
                            <p className={styles.tokenLabel}>Total Scans</p>
                        </div>
                        <div className={styles.tokenItem}>
                            <p className={styles.tokenCount} style={{ color: '#22c55e' }}>
                                {stats?.scanStats?.ruleClassified || 0}
                            </p>
                            <p className={styles.tokenLabel}>Rule-Based</p>
                        </div>
                        <div className={styles.tokenItem}>
                            <p className={styles.tokenCount} style={{ color: '#f59e0b' }}>
                                {stats?.scanStats?.mlClassified || 0}
                            </p>
                            <p className={styles.tokenLabel}>ML-Based</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Last Updated */}
            <p style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', marginTop: '2rem' }}>
                Last updated: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString() : 'N/A'}
            </p>
        </div>
    );
}

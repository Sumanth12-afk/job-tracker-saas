'use client';

import { useEffect, useState } from 'react';
import styles from '../admin.module.css';

export default function SystemHealthPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHealth();
    }, []);

    const fetchHealth = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch health:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    const tokenHealthPercent = stats?.gmailTokens?.total > 0
        ? Math.round((stats.gmailTokens.valid / stats.gmailTokens.total) * 100)
        : 100;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1>🔍 System Health</h1>
                <p>Monitor the health of your platform</p>
            </div>

            {/* Health Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🔐</div>
                    <p className={styles.statValue} style={{
                        color: tokenHealthPercent >= 80 ? '#22c55e' : tokenHealthPercent >= 50 ? '#f59e0b' : '#ef4444'
                    }}>
                        {tokenHealthPercent}%
                    </p>
                    <p className={styles.statLabel}>Gmail Token Health</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>✅</div>
                    <p className={styles.statValue} style={{ color: '#22c55e' }}>
                        {stats?.gmailTokens?.valid || 0}
                    </p>
                    <p className={styles.statLabel}>Valid Tokens</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⚠️</div>
                    <p className={styles.statValue} style={{ color: '#ef4444' }}>
                        {stats?.gmailTokens?.expired || 0}
                    </p>
                    <p className={styles.statLabel}>Expired Tokens</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📊</div>
                    <p className={styles.statValue}>{stats?.scanStats?.total || 0}</p>
                    <p className={styles.statLabel}>Total Scans</p>
                </div>
            </div>

            {/* System Info */}
            <div className={styles.chartCard} style={{ marginTop: '1.5rem' }}>
                <h3>📋 System Information</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b' }}>Total Users</span>
                        <span style={{ color: '#f1f5f9' }}>{stats?.overview?.totalUsers || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b' }}>Total Jobs Tracked</span>
                        <span style={{ color: '#f1f5f9' }}>{stats?.overview?.totalJobs || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b' }}>Gmail Connected Users</span>
                        <span style={{ color: '#f1f5f9' }}>{stats?.gmailTokens?.total || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b' }}>Average Jobs Found per Scan</span>
                        <span style={{ color: '#f1f5f9' }}>{stats?.scanStats?.avgFound || 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Health Indicators */}
            <div className={styles.chartCard} style={{ marginTop: '1.5rem' }}>
                <h3>🚦 Health Indicators</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    <HealthIndicator
                        label="Gmail Token Health"
                        value={tokenHealthPercent}
                        threshold={{ warning: 80, critical: 50 }}
                    />
                    <HealthIndicator
                        label="Active Users (Last 7 Days)"
                        value={stats?.activityChart?.length > 0 ? 100 : 0}
                        threshold={{ warning: 50, critical: 20 }}
                    />
                </div>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'center', marginTop: '2rem' }}>
                Last updated: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString() : 'N/A'}
            </p>
        </div>
    );
}

function HealthIndicator({ label, value, threshold }) {
    const getColor = () => {
        if (value >= threshold.warning) return '#22c55e';
        if (value >= threshold.critical) return '#f59e0b';
        return '#ef4444';
    };

    const getStatus = () => {
        if (value >= threshold.warning) return 'Healthy';
        if (value >= threshold.critical) return 'Warning';
        return 'Critical';
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            background: '#0f172a',
            borderRadius: '8px',
            borderLeft: `4px solid ${getColor()}`
        }}>
            <span style={{ color: '#f1f5f9' }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '100px',
                    height: '8px',
                    background: '#334155',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${value}%`,
                        height: '100%',
                        background: getColor(),
                        borderRadius: '4px'
                    }} />
                </div>
                <span style={{ color: getColor(), fontWeight: 500, minWidth: '70px' }}>
                    {getStatus()}
                </span>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import styles from '../admin.module.css';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b'];

export default function MLMonitoringPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
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

    const mlStats = stats?.scanStats || {};
    const totalClassified = (mlStats.ruleClassified || 0) + (mlStats.mlClassified || 0);

    const classificationData = [
        { name: 'Rule-Based', value: mlStats.ruleClassified || 0, color: '#22c55e' },
        { name: 'ML-Based', value: mlStats.mlClassified || 0, color: '#6366f1' },
    ];

    const rulesPercent = totalClassified > 0
        ? ((mlStats.ruleClassified / totalClassified) * 100).toFixed(1)
        : 0;
    const mlPercent = totalClassified > 0
        ? ((mlStats.mlClassified / totalClassified) * 100).toFixed(1)
        : 0;

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1>🤖 ML Monitoring</h1>
                <p>Monitor ML classification performance and drift</p>
            </div>

            {/* ML Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎯</div>
                    <p className={styles.statValue}>{mlStats.total || 0}</p>
                    <p className={styles.statLabel}>Total Scans</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📏</div>
                    <p className={styles.statValue} style={{ color: '#22c55e' }}>
                        {mlStats.ruleClassified || 0}
                    </p>
                    <p className={styles.statLabel}>Rule-Based Classifications</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🧠</div>
                    <p className={styles.statValue} style={{ color: '#6366f1' }}>
                        {mlStats.mlClassified || 0}
                    </p>
                    <p className={styles.statLabel}>ML Classifications</p>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📊</div>
                    <p className={styles.statValue}>{mlStats.avgFound || 'N/A'}</p>
                    <p className={styles.statLabel}>Avg Jobs per Scan</p>
                </div>
            </div>

            {/* Charts */}
            <div className={styles.chartsSection}>
                {/* Classification Distribution */}
                <div className={styles.chartCard}>
                    <h3>📊 Classification Source Distribution</h3>
                    {totalClassified > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={classificationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {classificationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No classification data yet</p>
                            <p style={{ fontSize: '0.75rem' }}>Run some Gmail scans to see data</p>
                        </div>
                    )}
                </div>

                {/* Drift Indicator */}
                <div className={styles.chartCard}>
                    <h3>📈 Rules vs ML Ratio</h3>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{
                            display: 'flex',
                            height: '30px',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            background: '#334155'
                        }}>
                            <div style={{
                                width: `${rulesPercent}%`,
                                background: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                {rulesPercent > 10 && `${rulesPercent}%`}
                            </div>
                            <div style={{
                                width: `${mlPercent}%`,
                                background: '#6366f1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                {mlPercent > 10 && `${mlPercent}%`}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Rules ({rulesPercent}%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '2px' }} />
                                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>ML ({mlPercent}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Model Info */}
            <div className={styles.chartCard} style={{ marginTop: '1.5rem' }}>
                <h3>🏷️ Model Information</h3>
                <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b' }}>Current Model Version</span>
                        <span style={{ color: '#6366f1', fontFamily: 'monospace' }}>v1.0.0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b' }}>Classification Strategy</span>
                        <span style={{ color: '#f1f5f9' }}>Hybrid (Rules + ML)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b' }}>ML Confidence Threshold</span>
                        <span style={{ color: '#f1f5f9' }}>60%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#0f172a', borderRadius: '8px' }}>
                        <span style={{ color: '#64748b' }}>Base Model</span>
                        <span style={{ color: '#f1f5f9' }}>DistilBERT (fine-tuned)</span>
                    </div>
                </div>
            </div>

            {/* Health Status */}
            <div className={styles.chartCard} style={{ marginTop: '1.5rem' }}>
                <h3>🚦 ML Health Status</h3>
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: rulesPercent > 70 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${rulesPercent > 70 ? '#22c55e' : '#6366f1'}`
                }}>
                    <span style={{ fontSize: '2rem' }}>
                        {rulesPercent > 70 ? '✅' : rulesPercent > 30 ? '🟡' : '🧠'}
                    </span>
                    <div>
                        <p style={{ color: '#f1f5f9', margin: 0, fontWeight: 500 }}>
                            {rulesPercent > 70
                                ? 'Rule-Based Dominance - Healthy'
                                : rulesPercent > 30
                                    ? 'Balanced Classification'
                                    : 'ML-Heavy Classification'}
                        </p>
                        <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                            {rulesPercent > 70
                                ? 'Most emails are being classified by efficient rules. ML is used for edge cases.'
                                : rulesPercent > 30
                                    ? 'Good balance between rules and ML. Consider adding more rules for common patterns.'
                                    : 'ML is handling most classifications. This may indicate new email patterns.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

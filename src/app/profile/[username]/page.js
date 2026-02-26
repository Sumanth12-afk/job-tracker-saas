'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './profile.module.css';

// Activity Heatmap Component
function ActivityHeatmap({ dailyActivity }) {
    const weeks = 52;
    const days = 7;
    const today = new Date();

    const cells = [];
    for (let w = weeks - 1; w >= 0; w--) {
        for (let d = 0; d < days; d++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (w * 7 + (6 - d)));
            const key = date.toISOString().split('T')[0];
            const count = dailyActivity[key] || 0;
            cells.push({ key, count, date });
        }
    }

    const getLevel = (count) => {
        if (count === 0) return 0;
        if (count <= 1) return 1;
        if (count <= 3) return 2;
        if (count <= 5) return 3;
        return 4;
    };

    const months = [];
    let lastMonth = -1;
    cells.forEach((cell, i) => {
        const m = cell.date.getMonth();
        if (m !== lastMonth) {
            months.push({ name: cell.date.toLocaleString('en-US', { month: 'short' }), index: Math.floor(i / 7) });
            lastMonth = m;
        }
    });

    return (
        <div className={styles.heatmapContainer}>
            <div className={styles.heatmapMonths}>
                {months.map((m, i) => (
                    <span key={i} style={{ gridColumnStart: m.index + 1 }}>{m.name}</span>
                ))}
            </div>
            <div className={styles.heatmapGrid}>
                {cells.map((cell, i) => (
                    <div
                        key={i}
                        className={`${styles.heatmapCell} ${styles[`level${getLevel(cell.count)}`]}`}
                        title={`${cell.key}: ${cell.count} application${cell.count !== 1 ? 's' : ''}`}
                    />
                ))}
            </div>
            <div className={styles.heatmapLegend}>
                <span>Less</span>
                <div className={`${styles.heatmapCell} ${styles.level0}`} />
                <div className={`${styles.heatmapCell} ${styles.level1}`} />
                <div className={`${styles.heatmapCell} ${styles.level2}`} />
                <div className={`${styles.heatmapCell} ${styles.level3}`} />
                <div className={`${styles.heatmapCell} ${styles.level4}`} />
                <span>More</span>
            </div>
        </div>
    );
}

// Funnel Component
function FunnelChart({ statusCounts, total }) {
    const stages = [
        { key: 'Applied', label: 'Applied', color: '#818cf8', icon: '📄' },
        { key: 'Interview', label: 'Interviews', color: '#14b8a6', icon: '🎙️' },
        { key: 'Offer', label: 'Offers', color: '#22c55e', icon: '🎉' },
        { key: 'Rejected', label: 'Closed', color: '#6b7280', icon: '📋' },
    ];

    return (
        <div className={styles.funnel}>
            {stages.map((stage) => {
                const count = statusCounts[stage.key] || 0;
                const pct = total > 0 ? ((count / total) * 100) : 0;
                return (
                    <div key={stage.key} className={styles.funnelStage}>
                        <div className={styles.funnelLabel}>
                            <span className={styles.funnelIcon}>{stage.icon}</span>
                            <span className={styles.funnelText}>{stage.label}</span>
                            <span className={styles.funnelCount}>{count}</span>
                        </div>
                        <div className={styles.funnelBarTrack}>
                            <div
                                className={styles.funnelBar}
                                style={{ width: `${Math.max(pct, 2)}%`, background: stage.color }}
                            />
                        </div>
                        <span className={styles.funnelPct}>{pct.toFixed(0)}%</span>
                    </div>
                );
            })}
        </div>
    );
}

// Source Pills
function SourceBreakdown({ sourceCounts, total }) {
    const sources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
    const colors = ['#818cf8', '#14b8a6', '#f59e0b', '#ef4444', '#22c55e'];

    return (
        <div className={styles.sourceList}>
            {sources.map(([source, count], i) => {
                const pct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                return (
                    <div key={source} className={styles.sourceItem}>
                        <div className={styles.sourceBar}>
                            <div
                                className={styles.sourceFill}
                                style={{ width: `${pct}%`, background: colors[i % colors.length] }}
                            />
                        </div>
                        <span className={styles.sourceLabel}>
                            {source === 'manual' ? 'Manual Entry' : source === 'gmail' ? 'Gmail Import' : source}
                        </span>
                        <span className={styles.sourcePct}>{pct}%</span>
                    </div>
                );
            })}
        </div>
    );
}

// Monthly Trend
function MonthlyTrend({ monthlyTrend }) {
    const max = Math.max(...monthlyTrend.map(m => m.count), 1);

    return (
        <div className={styles.trendChart}>
            {monthlyTrend.map((m, i) => (
                <div key={i} className={styles.trendBarWrap}>
                    <div className={styles.trendBarOuter}>
                        <div
                            className={styles.trendBarInner}
                            style={{ height: `${(m.count / max) * 100}%` }}
                        />
                    </div>
                    <span className={styles.trendLabel}>{m.month}</span>
                    <span className={styles.trendCount}>{m.count}</span>
                </div>
            ))}
        </div>
    );
}

// Animated Counter
function AnimatedNumber({ value }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1200;
        const step = (ts) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.floor(eased * value));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [value]);

    return <span>{display}</span>;
}

export default function PublicProfilePage() {
    const params = useParams();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/profile/${params.username}`);
                if (!res.ok) {
                    setError('Profile not found');
                    return;
                }
                const json = await res.json();
                setData(json);
            } catch {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [params.username]);

    if (loading) {
        return (
            <div className={styles.loadingPage}>
                <div className={styles.loadingSpinner} />
                <span>Loading profile...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={styles.errorPage}>
                <div className={styles.errorIcon}>🔒</div>
                <h1>Profile Not Found</h1>
                <p>This profile doesn't exist or is set to private.</p>
                <a href="/" className={styles.ctaBtn}>Track Your Job Search</a>
            </div>
        );
    }

    const { profile, stats } = data;
    const interviewRate = stats.total > 0 ? ((stats.statusCounts.Interview + stats.statusCounts.Offer) / stats.total * 100).toFixed(1) : 0;
    const offerRate = stats.total > 0 ? (stats.statusCounts.Offer / stats.total * 100).toFixed(1) : 0;
    const initials = profile.display_name
        ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : profile.username[0].toUpperCase();

    return (
        <div className={styles.page}>
            {/* Ambient background effects */}
            <div className={styles.bgGlow} />
            <div className={styles.bgGrid} />

            <div className={styles.container}>
                {/* Hero Card */}
                <div className={styles.heroCard}>
                    <div className={styles.heroGlow} />
                    <div className={styles.heroContent}>
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.display_name || profile.username} className={styles.avatarImg} />
                        ) : (
                            <div className={styles.avatar}>{initials}</div>
                        )}
                        <div className={styles.heroInfo}>
                            <h1 className={styles.name}>{profile.display_name || profile.username}</h1>
                            {profile.target_role && (
                                <span className={styles.role}>
                                    🎯 {profile.target_role}
                                </span>
                            )}
                            {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
                            <div className={styles.badges}>
                                <span className={styles.badge}>
                                    📅 Member since {new Date(stats.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                                {stats.streak > 0 && profile.show_streak && (
                                    <span className={styles.badgeStreak}>
                                        🔥 {stats.streak} week streak
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Banner */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}><AnimatedNumber value={stats.total} /></span>
                        <span className={styles.statLabel}>Applications</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}><AnimatedNumber value={stats.statusCounts.Interview} /></span>
                        <span className={styles.statLabel}>Interviews</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}><AnimatedNumber value={stats.statusCounts.Offer} /></span>
                        <span className={styles.statLabel}>Offers</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumberAccent}>{interviewRate}%</span>
                        <span className={styles.statLabel}>Interview Rate</span>
                    </div>
                </div>

                {/* Activity Heatmap */}
                {profile.show_heatmap && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>📊</span> Application Activity
                        </h2>
                        <div className={styles.sectionCard}>
                            <ActivityHeatmap dailyActivity={stats.dailyActivity} />
                        </div>
                    </div>
                )}

                {/* Funnel */}
                {profile.show_funnel && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🔄</span> Application Pipeline
                        </h2>
                        <div className={styles.sectionCard}>
                            <FunnelChart statusCounts={stats.statusCounts} total={stats.total} />
                        </div>
                    </div>
                )}

                {/* Two-column: Sources + Monthly Trend */}
                <div className={styles.twoCol}>
                    {profile.show_sources && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                                <span className={styles.sectionIcon}>📡</span> Sources
                            </h2>
                            <div className={styles.sectionCard}>
                                <SourceBreakdown sourceCounts={stats.sourceCounts} total={stats.total} />
                            </div>
                        </div>
                    )}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>📈</span> Monthly Trend
                        </h2>
                        <div className={styles.sectionCard}>
                            <MonthlyTrend monthlyTrend={stats.monthlyTrend} />
                        </div>
                    </div>
                </div>

                {/* CTA Footer */}
                <div className={styles.ctaSection}>
                    <div className={styles.ctaGlow} />
                    <h2 className={styles.ctaTitle}>Track your own job search</h2>
                    <p className={styles.ctaSubtitle}>Join thousands of job seekers using AppTracker to organize and optimize their job search.</p>
                    <a href="/signup" className={styles.ctaBtn}>
                        Get Started - It's Free
                    </a>
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <span>Powered by <a href="/" className={styles.footerLink}>AppTracker</a></span>
                </footer>
            </div>
        </div>
    );
}

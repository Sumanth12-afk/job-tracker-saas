'use client';

import { useMemo } from 'react';
import styles from './Analytics.module.css';

export default function Analytics({ jobs }) {
    const stats = useMemo(() => {
        const total = jobs.length;
        const applied = jobs.filter(j => j.status === 'Applied').length;
        const interviews = jobs.filter(j => j.status === 'Interview').length;
        const offers = jobs.filter(j => j.status === 'Offer').length;
        const rejected = jobs.filter(j => j.status === 'Rejected').length;

        // Calculate rates
        const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
        const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;
        const responseRate = total > 0 ? Math.round(((interviews + offers + rejected) / total) * 100) : 0;
        const successRate = total > 0 ? Math.round((offers / total) * 100) : 0;
        const pendingCount = applied;

        // Weekly activity (last 4 weeks)
        const now = new Date();
        const weeks = [0, 1, 2, 3].map(weeksAgo => {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (weeksAgo * 7) - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const count = jobs.filter(j => {
                const d = new Date(j.date_applied);
                return d >= weekStart && d <= weekEnd;
            }).length;

            return {
                label: weeksAgo === 0 ? 'This week' : `${weeksAgo}w ago`,
                count
            };
        }).reverse();

        // Application momentum
        const thisWeek = weeks[3]?.count || 0;
        const lastWeek = weeks[2]?.count || 0;
        const momentum = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

        // Top companies
        const companyCounts = {};
        jobs.forEach(j => {
            const company = j.company_name || 'Unknown';
            companyCounts[company] = (companyCounts[company] || 0) + 1;
        });
        const topCompanies = Object.entries(companyCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Average days to response
        const responseTimes = jobs
            .filter(j => j.status !== 'Applied' && j.date_applied)
            .map(j => {
                const appliedDate = new Date(j.date_applied);
                const updated = new Date(j.updated_at || j.date_applied);
                return Math.max(0, Math.floor((updated - appliedDate) / (1000 * 60 * 60 * 24)));
            })
            .filter(d => d > 0 && d < 90);

        const avgResponseDays = responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;

        // Best day to apply
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayStats = [0, 0, 0, 0, 0, 0, 0];
        jobs.filter(j => j.status === 'Interview' || j.status === 'Offer').forEach(j => {
            if (j.date_applied) {
                const day = new Date(j.date_applied).getDay();
                dayStats[day]++;
            }
        });
        const bestDayIndex = dayStats.indexOf(Math.max(...dayStats));
        const bestDay = dayStats[bestDayIndex] > 0 ? dayNames[bestDayIndex] : 'N/A';

        // Oldest pending
        const pendingJobs = jobs.filter(j => j.status === 'Applied');
        let oldestPending = null;
        if (pendingJobs.length > 0) {
            pendingJobs.sort((a, b) => new Date(a.date_applied) - new Date(b.date_applied));
            const oldest = pendingJobs[0];
            const daysPending = Math.floor((now - new Date(oldest.date_applied)) / (1000 * 60 * 60 * 24));
            oldestPending = { company: oldest.company_name, days: daysPending };
        }

        return {
            total, applied, interviews, offers, rejected,
            interviewRate, offerRate, responseRate, successRate, pendingCount,
            momentum, weeks, topCompanies, avgResponseDays, bestDay, oldestPending
        };
    }, [jobs]);

    const maxWeekCount = Math.max(...stats.weeks.map(w => w.count), 1);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>📊 Analytics</h2>
                <p className={styles.subtitle}>Your job search at a glance</p>
            </div>

            {/* Funnel Section */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Application Funnel</h3>
                <div className={styles.funnel}>
                    <div className={styles.funnelStep}>
                        <div className={styles.funnelBar} style={{ width: '100%', background: 'var(--color-applied)' }}>
                            <span>{stats.total} Applied</span>
                        </div>
                    </div>
                    <div className={styles.funnelStep}>
                        <div className={styles.funnelBar} style={{
                            width: `${stats.total > 0 ? (stats.interviews / stats.total) * 100 : 0}%`,
                            minWidth: stats.interviews > 0 ? '80px' : '0',
                            background: 'var(--color-interview)'
                        }}>
                            <span>{stats.interviews} Interview</span>
                        </div>
                        <span className={styles.funnelRate}>{stats.interviewRate}%</span>
                    </div>
                    <div className={styles.funnelStep}>
                        <div className={styles.funnelBar} style={{
                            width: `${stats.total > 0 ? (stats.offers / stats.total) * 100 : 0}%`,
                            minWidth: stats.offers > 0 ? '60px' : '0',
                            background: 'var(--color-offer)'
                        }}>
                            <span>{stats.offers} Offer</span>
                        </div>
                        <span className={styles.funnelRate}>{stats.offerRate}%</span>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.successRate}%</span>
                    <span className={styles.statLabel}>Success Rate</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.responseRate}%</span>
                    <span className={styles.statLabel}>Response Rate</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.avgResponseDays}</span>
                    <span className={styles.statLabel}>Avg Days to Hear Back</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{stats.pendingCount}</span>
                    <span className={styles.statLabel}>Pending Applications</span>
                </div>
            </div>

            {/* Insights Section */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>💡 Insights</h3>
                <div className={styles.insightsGrid}>
                    <div className={styles.insightCard}>
                        <span className={styles.insightIcon}>📈</span>
                        <div>
                            <span className={`${styles.insightValue} ${stats.momentum >= 0 ? styles.positive : styles.negative}`}>
                                {stats.momentum >= 0 ? '+' : ''}{stats.momentum}%
                            </span>
                            <span className={styles.insightLabel}>Momentum vs last week</span>
                        </div>
                    </div>
                    <div className={styles.insightCard}>
                        <span className={styles.insightIcon}>📅</span>
                        <div>
                            <span className={styles.insightValue}>{stats.bestDay}</span>
                            <span className={styles.insightLabel}>Best day to apply</span>
                        </div>
                    </div>
                    {stats.oldestPending && (
                        <div className={styles.insightCard}>
                            <span className={styles.insightIcon}>⏰</span>
                            <div>
                                <span className={styles.insightValue}>{stats.oldestPending.days} days</span>
                                <span className={styles.insightLabel}>Oldest pending ({stats.oldestPending.company})</span>
                            </div>
                        </div>
                    )}
                    <div className={styles.insightCard}>
                        <span className={styles.insightIcon}>🎯</span>
                        <div>
                            <span className={styles.insightValue}>{stats.rejected}</span>
                            <span className={styles.insightLabel}>Rejections (keep going!)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Activity */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Weekly Activity</h3>
                <div className={styles.barChart}>
                    {stats.weeks.map((week, i) => (
                        <div key={i} className={styles.barItem}>
                            <div className={styles.barWrapper}>
                                <div
                                    className={styles.bar}
                                    style={{
                                        height: `${(week.count / maxWeekCount) * 100}%`,
                                        minHeight: week.count > 0 ? '8px' : '0'
                                    }}
                                >
                                    {week.count > 0 && <span>{week.count}</span>}
                                </div>
                            </div>
                            <span className={styles.barLabel}>{week.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Companies */}
            {stats.topCompanies.length > 0 && (
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Top Companies</h3>
                    <div className={styles.companyList}>
                        {stats.topCompanies.map(([company, count], i) => (
                            <div key={i} className={styles.companyItem}>
                                <span className={styles.companyRank}>#{i + 1}</span>
                                <span className={styles.companyName}>{company}</span>
                                <span className={styles.companyCount}>{count} apps</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

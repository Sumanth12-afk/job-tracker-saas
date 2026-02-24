'use client';

import { useMemo } from 'react';
import { differenceInDays, differenceInWeeks, format, subDays, subWeeks } from 'date-fns';
import styles from './DashboardHome.module.css';
import {
    Briefcase,
    Users,
    Trophy,
    TrendingUp,
    Clock,
    ArrowRight,
    Mail,
    Calendar,
    Building2,
} from 'lucide-react';

export default function DashboardHome({ jobs, onViewChange }) {
    const now = new Date();
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);
    const twoWeeksAgo = subDays(now, 14);

    // ---- STAT CARDS ----
    const stats = useMemo(() => {
        const total = jobs.length;
        const interviews = jobs.filter(j => j.status === 'Interview').length;
        const offers = jobs.filter(j => j.status === 'Offer').length;

        // Response rate = (interview + offer + rejected) / total
        const responded = jobs.filter(j =>
            ['Interview', 'Offer', 'Rejected'].includes(j.status)
        ).length;
        const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

        // "This week" deltas
        const thisWeekJobs = jobs.filter(j => new Date(j.date_applied) >= weekAgo);
        const thisWeekInterviews = jobs.filter(
            j => j.status === 'Interview' && new Date(j.updated_at || j.date_applied) >= weekAgo
        ).length;
        const thisWeekOffers = jobs.filter(
            j => j.status === 'Offer' && new Date(j.updated_at || j.date_applied) >= weekAgo
        ).length;

        // Last month response rate for comparison
        const lastMonthJobs = jobs.filter(j => new Date(j.date_applied) >= monthAgo);
        const lastMonthResponded = lastMonthJobs.filter(j =>
            ['Interview', 'Offer', 'Rejected'].includes(j.status)
        ).length;
        const lastMonthRate = lastMonthJobs.length > 0
            ? Math.round((lastMonthResponded / lastMonthJobs.length) * 100) : 0;

        return {
            total, interviews, offers, responseRate,
            thisWeekCount: thisWeekJobs.length,
            thisWeekInterviews,
            thisWeekOffers,
            responseRateDelta: responseRate - lastMonthRate,
        };
    }, [jobs, weekAgo, monthAgo]);

    // ---- NEXT ACTIONS ----
    const nextActions = useMemo(() => {
        const actions = [];

        jobs.forEach(job => {
            const daysSince = differenceInDays(now, new Date(job.date_applied));

            // Follow-up needed (applied > 7 days, not followed up)
            if (job.status === 'Applied' && !job.followed_up && daysSince >= 7) {
                actions.push({
                    id: job.id,
                    type: 'follow-up',
                    label: 'Follow up',
                    company: job.company_name,
                    role: job.job_title,
                    note: 'Follow up with hiring manager',
                    timeAgo: `${daysSince}d ago`,
                    urgency: daysSince,
                });
            }

            // Interview prep (upcoming interviews)
            if (job.status === 'Interview') {
                actions.push({
                    id: job.id,
                    type: 'interview-prep',
                    label: 'Interview Prep',
                    company: job.company_name,
                    role: job.job_title,
                    note: 'Prepare for technical interview',
                    timeAgo: job.updated_at ? `${differenceInDays(now, new Date(job.updated_at))}d ago` : 'Recently',
                    urgency: 100, // high priority
                });
            }

            // Reply needed (if contact email exists and applied recently)
            if (job.contact_email && job.status === 'Applied' && daysSince >= 3 && daysSince < 7) {
                actions.push({
                    id: job.id,
                    type: 'reply',
                    label: 'Reply',
                    company: job.company_name,
                    role: job.job_title,
                    note: 'Reply to recruiter email',
                    timeAgo: `${daysSince}d ago`,
                    urgency: daysSince + 50,
                });
            }
        });

        return actions.sort((a, b) => b.urgency - a.urgency).slice(0, 5);
    }, [jobs, now]);

    // ---- RECENT ACTIVITY ----
    const recentActivity = useMemo(() => {
        return [...jobs]
            .sort((a, b) => new Date(b.updated_at || b.date_applied) - new Date(a.updated_at || a.date_applied))
            .slice(0, 5)
            .map(job => {
                const date = new Date(job.updated_at || job.date_applied);
                const daysDiff = differenceInDays(now, date);
                let timeAgo;
                if (daysDiff === 0) timeAgo = 'Today';
                else if (daysDiff === 1) timeAgo = 'Yesterday';
                else if (daysDiff < 7) timeAgo = `${daysDiff} days ago`;
                else timeAgo = `${Math.floor(daysDiff / 7)} week${Math.floor(daysDiff / 7) > 1 ? 's' : ''} ago`;

                return {
                    id: job.id,
                    company: job.company_name,
                    role: job.job_title,
                    timeAgo,
                    status: job.status,
                };
            });
    }, [jobs, now]);

    // ---- BOTTOM METRICS ----
    const bottomMetrics = useMemo(() => {
        const thisWeek = jobs.filter(j => new Date(j.date_applied) >= weekAgo);
        const lastWeek = jobs.filter(j => {
            const d = new Date(j.date_applied);
            return d >= twoWeeksAgo && d < weekAgo;
        });
        const weekChange = lastWeek.length > 0
            ? Math.round(((thisWeek.length - lastWeek.length) / lastWeek.length) * 100)
            : 0;

        // avg response time (days from applied to interview/offer)
        const responded = jobs.filter(j =>
            ['Interview', 'Offer'].includes(j.status) && j.updated_at
        );
        const avgResponseDays = responded.length > 0
            ? (responded.reduce((sum, j) =>
                sum + differenceInDays(new Date(j.updated_at), new Date(j.date_applied)), 0
            ) / responded.length).toFixed(1)
            : '—';

        // interview rate
        const total = jobs.length;
        const interviews = jobs.filter(j => ['Interview', 'Offer'].includes(j.status)).length;
        const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;

        return {
            thisWeekCount: thisWeek.length,
            weekChange,
            avgResponseDays,
            interviewRate,
        };
    }, [jobs, weekAgo, twoWeeksAgo]);

    const getActionBadgeClass = (type) => {
        switch (type) {
            case 'follow-up': return styles.badgeFollowUp;
            case 'reply': return styles.badgeReply;
            case 'interview-prep': return styles.badgeInterviewPrep;
            default: return '';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Applied': return <Mail size={16} />;
            case 'Interview': return <Calendar size={16} />;
            case 'Offer': return <Trophy size={16} />;
            default: return <Building2 size={16} />;
        }
    };

    return (
        <div className={styles.container}>
            {/* Summary Stat Cards */}
            <div className={styles.statGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconApplied}`}>
                        <Briefcase size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Applied</span>
                        <span className={styles.statNumber}>{stats.total}</span>
                        {stats.thisWeekCount > 0 && (
                            <span className={styles.statDelta}>+{stats.thisWeekCount} this week</span>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconInterview}`}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Interviews</span>
                        <span className={styles.statNumber}>{stats.interviews}</span>
                        {stats.thisWeekInterviews > 0 && (
                            <span className={styles.statDelta}>+{stats.thisWeekInterviews} this week</span>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconOffer}`}>
                        <Trophy size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Offers</span>
                        <span className={styles.statNumber}>{stats.offers}</span>
                        {stats.thisWeekOffers > 0 && (
                            <span className={styles.statDelta}>+{stats.thisWeekOffers} this week</span>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconRate}`}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Response Rate</span>
                        <span className={styles.statNumber}>{stats.responseRate}%</span>
                        {stats.responseRateDelta !== 0 && (
                            <span className={`${styles.statDelta} ${stats.responseRateDelta < 0 ? styles.negative : ''}`}>
                                {stats.responseRateDelta > 0 ? '+' : ''}{stats.responseRateDelta}% this month
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Middle Row: Next Actions + Recent Activity */}
            <div className={styles.middleRow}>
                {/* Next Actions */}
                <div className={styles.nextActions}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h3 className={styles.sectionTitle}>Next Actions</h3>
                            <p className={styles.sectionSubtitle}>Stay on top of your job search</p>
                        </div>
                        <button
                            className={styles.viewAllBtn}
                            onClick={() => onViewChange('followups')}
                        >
                            View All <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className={styles.actionsList}>
                        {nextActions.length === 0 ? (
                            <p className={styles.emptyText}>No pending actions — you&apos;re all caught up! 🎉</p>
                        ) : (
                            nextActions.map((action) => (
                                <div key={action.id} className={styles.actionItem}>
                                    <div className={styles.actionIcon}>
                                        <Clock size={18} />
                                    </div>
                                    <div className={styles.actionContent}>
                                        <div className={styles.actionTop}>
                                            <span className={`${styles.actionBadge} ${getActionBadgeClass(action.type)}`}>
                                                {action.label}
                                            </span>
                                            <span className={styles.actionTime}>{action.timeAgo}</span>
                                        </div>
                                        <span className={styles.actionCompany}>{action.company}</span>
                                        <span className={styles.actionRole}>{action.role}</span>
                                        <span className={styles.actionNote}>{action.note}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={styles.recentActivity}>
                    <h3 className={styles.sectionTitle}>Recent Activity</h3>

                    <div className={styles.activityList}>
                        {recentActivity.length === 0 ? (
                            <p className={styles.emptyText}>No recent activity yet.</p>
                        ) : (
                            recentActivity.map((item) => (
                                <div key={item.id} className={styles.activityItem}>
                                    <div className={styles.activityIcon}>
                                        {getStatusIcon(item.status)}
                                    </div>
                                    <div className={styles.activityInfo}>
                                        <span className={styles.activityCompany}>{item.company}</span>
                                        <span className={styles.activityRole}>{item.role}</span>
                                        <span className={styles.activityTime}>{item.timeAgo}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        className={styles.viewAllBtn}
                        onClick={() => onViewChange('applications')}
                        style={{ marginTop: 12 }}
                    >
                        View All Activity
                    </button>
                </div>
            </div>

            {/* Bottom Metrics */}
            <div className={styles.bottomMetrics}>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>This Week</span>
                    <span className={styles.metricValue}>{bottomMetrics.thisWeekCount} applications</span>
                    {bottomMetrics.weekChange !== 0 && (
                        <span className={`${styles.metricDelta} ${bottomMetrics.weekChange < 0 ? styles.negative : ''}`}>
                            {bottomMetrics.weekChange > 0 ? '+' : ''}{bottomMetrics.weekChange}% from last week
                        </span>
                    )}
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Avg. Response Time</span>
                    <span className={styles.metricValue}>{bottomMetrics.avgResponseDays} days</span>
                </div>
                <div className={styles.metricCard}>
                    <span className={styles.metricLabel}>Interview Rate</span>
                    <span className={styles.metricValue}>{bottomMetrics.interviewRate}%</span>
                    <span className={styles.metricNote}>Industry avg: 20%</span>
                </div>
            </div>
        </div>
    );
}

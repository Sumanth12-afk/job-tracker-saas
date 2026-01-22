'use client';

import { useState, useMemo } from 'react';
import { format, differenceInDays, subDays } from 'date-fns';
import styles from './FollowUpCenter.module.css';

export default function FollowUpCenter({ jobs, onJobClick, onMarkFollowedUp }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    const data = useMemo(() => {
        const now = new Date();

        // Priority jobs (if user marked them - using notes to store priority for now)
        const priorityJobs = jobs.filter(job =>
            job.notes?.toLowerCase().includes('#priority') ||
            job.notes?.toLowerCase().includes('#important')
        );

        // Stale applications (14+ days, still in Applied, no follow-up)
        const staleApplications = jobs.filter(job => {
            if (job.status !== 'Applied') return false;
            const days = differenceInDays(now, new Date(job.date_applied));
            return days >= 14 && days < 30;
        });

        // Ghost detection (30+ days with no response)
        const ghostedJobs = jobs.filter(job => {
            if (job.status !== 'Applied') return false;
            const days = differenceInDays(now, new Date(job.date_applied));
            return days >= 30;
        });

        // Needs follow-up (7+ days, not ghosted yet)
        const needsFollowUp = jobs.filter(job => {
            if (job.status !== 'Applied' || job.followed_up) return false;
            const days = differenceInDays(now, new Date(job.date_applied));
            return days >= 7 && days < 14;
        });

        // Upcoming interviews
        const upcomingInterviews = jobs.filter(job => {
            if (!job.interview_date) return false;
            const interviewDate = new Date(job.interview_date);
            const daysUntil = differenceInDays(interviewDate, now);
            return daysUntil >= 0 && daysUntil <= 7;
        }).sort((a, b) => new Date(a.interview_date) - new Date(b.interview_date));

        // Application momentum (streak calculation)
        let streak = 0;
        let checkDate = new Date(now);
        for (let i = 0; i < 30; i++) {
            const dayJobs = jobs.filter(j => {
                const jobDate = new Date(j.date_applied);
                return jobDate.toDateString() === checkDate.toDateString();
            });
            if (dayJobs.length > 0) {
                streak++;
                checkDate = subDays(checkDate, 1);
            } else if (i > 0) {
                break; // Streak broken
            } else {
                checkDate = subDays(checkDate, 1); // Check yesterday if nothing today
            }
        }

        // This week vs last week
        const thisWeekStart = subDays(now, 7);
        const lastWeekStart = subDays(now, 14);
        const thisWeekApps = jobs.filter(j => new Date(j.date_applied) >= thisWeekStart).length;
        const lastWeekApps = jobs.filter(j => {
            const d = new Date(j.date_applied);
            return d >= lastWeekStart && d < thisWeekStart;
        }).length;

        return {
            priorityJobs,
            staleApplications,
            ghostedJobs,
            needsFollowUp,
            upcomingInterviews,
            streak,
            thisWeekApps,
            lastWeekApps,
            totalAttention: priorityJobs.length + staleApplications.length + ghostedJobs.length +
                needsFollowUp.length + upcomingInterviews.length
        };
    }, [jobs]);

    if (data.totalAttention === 0 && data.streak === 0) {
        return null;
    }

    const tabs = [
        { id: 'all', label: 'All', count: data.totalAttention },
        { id: 'priority', label: '⭐ Priority', count: data.priorityJobs.length },
        { id: 'stale', label: '🕐 Stale', count: data.staleApplications.length },
        { id: 'ghost', label: '👻 Ghosted', count: data.ghostedJobs.length },
    ].filter(tab => tab.id === 'all' || tab.count > 0);

    return (
        <div className={styles.container}>
            <button
                className={styles.header}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className={styles.title}>
                    <span className={styles.icon}>⚠️</span>
                    Needs Attention
                    <span className={styles.badge}>{data.totalAttention}</span>
                </span>
                <span className={styles.chevron}>
                    {isExpanded ? '▲' : '▼'}
                </span>
            </button>

            {isExpanded && (
                <div className={styles.content}>
                    {/* Momentum Banner */}
                    <div className={styles.momentumBanner}>
                        <div className={styles.streakSection}>
                            <span className={styles.streakIcon}>🔥</span>
                            <div>
                                <span className={styles.streakValue}>{data.streak} day streak</span>
                                <span className={styles.streakLabel}>Keep applying!</span>
                            </div>
                        </div>
                        <div className={styles.weeklyStats}>
                            <span className={styles.weekApps}>{data.thisWeekApps} apps this week</span>
                            {data.lastWeekApps > 0 && (
                                <span className={`${styles.weekChange} ${data.thisWeekApps >= data.lastWeekApps ? styles.positive : styles.negative}`}>
                                    {data.thisWeekApps >= data.lastWeekApps ? '↑' : '↓'}
                                    vs {data.lastWeekApps} last week
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    {tabs.length > 1 && (
                        <div className={styles.tabs}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label} {tab.count > 0 && <span>({tab.count})</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Priority Jobs */}
                    {(activeTab === 'all' || activeTab === 'priority') && data.priorityJobs.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>
                                <span>⭐</span> Priority Applications
                                <span className={styles.sectionHint}>Add #priority in notes to mark</span>
                            </h4>
                            <div className={styles.list}>
                                {data.priorityJobs.slice(0, 5).map(job => (
                                    <div key={job.id} className={`${styles.item} ${styles.priorityItem}`} onClick={() => onJobClick(job)}>
                                        <div className={styles.itemInfo}>
                                            <span className={styles.company}>{job.company_name}</span>
                                            <span className={styles.meta}>{job.job_title} • {job.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stale Applications */}
                    {(activeTab === 'all' || activeTab === 'stale') && data.staleApplications.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>
                                <span>🕐</span> Stale Applications (14+ days)
                            </h4>
                            <div className={styles.list}>
                                {data.staleApplications.slice(0, 5).map(job => {
                                    const days = differenceInDays(new Date(), new Date(job.date_applied));
                                    return (
                                        <div key={job.id} className={`${styles.item} ${styles.staleItem}`}>
                                            <div className={styles.itemInfo} onClick={() => onJobClick(job)}>
                                                <span className={styles.company}>{job.company_name}</span>
                                                <span className={styles.meta}>
                                                    {job.job_title} • {days} days waiting
                                                </span>
                                            </div>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={(e) => { e.stopPropagation(); onMarkFollowedUp(job.id); }}
                                                title="Mark as followed up"
                                            >
                                                📧
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Ghost Detection */}
                    {(activeTab === 'all' || activeTab === 'ghost') && data.ghostedJobs.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>
                                <span>👻</span> Likely Ghosted (30+ days)
                                <span className={styles.sectionHint}>Consider moving on</span>
                            </h4>
                            <div className={styles.list}>
                                {data.ghostedJobs.slice(0, 5).map(job => {
                                    const days = differenceInDays(new Date(), new Date(job.date_applied));
                                    return (
                                        <div key={job.id} className={`${styles.item} ${styles.ghostItem}`} onClick={() => onJobClick(job)}>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.company}>{job.company_name}</span>
                                                <span className={styles.meta}>
                                                    {job.job_title} • {days} days - no response
                                                </span>
                                            </div>
                                            <span className={styles.ghostBadge}>👻</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Follow-up Needed */}
                    {activeTab === 'all' && data.needsFollowUp.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>
                                <span>⏰</span> Follow-up Needed (7+ days)
                            </h4>
                            <div className={styles.list}>
                                {data.needsFollowUp.slice(0, 5).map(job => {
                                    const days = differenceInDays(new Date(), new Date(job.date_applied));
                                    return (
                                        <div key={job.id} className={styles.item}>
                                            <div className={styles.itemInfo} onClick={() => onJobClick(job)}>
                                                <span className={styles.company}>{job.company_name}</span>
                                                <span className={styles.meta}>
                                                    {job.job_title} • {days} days ago
                                                </span>
                                            </div>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={(e) => { e.stopPropagation(); onMarkFollowedUp(job.id); }}
                                                title="Mark as followed up"
                                            >
                                                ✓
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Interviews */}
                    {activeTab === 'all' && data.upcomingInterviews.length > 0 && (
                        <div className={styles.section}>
                            <h4 className={styles.sectionTitle}>
                                <span>📅</span> Upcoming Interviews
                            </h4>
                            <div className={styles.list}>
                                {data.upcomingInterviews.slice(0, 5).map(job => {
                                    const interviewDate = new Date(job.interview_date);
                                    const daysUntil = differenceInDays(interviewDate, new Date());
                                    return (
                                        <div key={job.id} className={styles.item} onClick={() => onJobClick(job)}>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.company}>{job.company_name}</span>
                                                <span className={styles.meta}>
                                                    {format(interviewDate, 'MMM d, h:mm a')}
                                                    {daysUntil === 0 && <span className={styles.today}> (Today!)</span>}
                                                    {daysUntil === 1 && <span className={styles.tomorrow}> (Tomorrow)</span>}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

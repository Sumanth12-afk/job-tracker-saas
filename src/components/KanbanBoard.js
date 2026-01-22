'use client';

import { useState, useMemo } from 'react';
import { differenceInDays } from 'date-fns';
import JobCard from './JobCard';
import EmptyState from './EmptyState';
import styles from './KanbanBoard.module.css';

const STATUS_COLUMNS = [
    { id: 'Applied', title: 'Applied', color: 'var(--color-applied)' },
    { id: 'Interview', title: 'Interview', color: 'var(--color-interview)' },
    { id: 'Offer', title: 'Offer', color: 'var(--color-offer)' },
    { id: 'Rejected', title: 'Rejected', color: 'var(--color-rejected)' },
];

const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function KanbanBoard({ jobs, onJobClick, onStatusChange }) {
    const [draggedJob, setDraggedJob] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [visibleCounts, setVisibleCounts] = useState({
        NeedsAttention: INITIAL_VISIBLE_COUNT,
        Applied: INITIAL_VISIBLE_COUNT,
        Interview: INITIAL_VISIBLE_COUNT,
        Offer: INITIAL_VISIBLE_COUNT,
        Rejected: INITIAL_VISIBLE_COUNT,
    });

    // Compute jobs that need attention
    const needsAttentionJobs = useMemo(() => {
        const now = new Date();
        return jobs
            .map(job => {
                const daysSinceApplied = differenceInDays(now, new Date(job.date_applied));
                const isPriority = job.notes?.toLowerCase().includes('#priority') ||
                    job.notes?.toLowerCase().includes('#important');
                const isStale = job.status === 'Applied' && daysSinceApplied >= 14 && daysSinceApplied < 30;
                const isGhosted = job.status === 'Applied' && daysSinceApplied >= 30;
                const needsFollowUp = job.status === 'Applied' && !job.followed_up && daysSinceApplied >= 7 && daysSinceApplied < 14;

                if (isPriority || isStale || isGhosted || needsFollowUp) {
                    return {
                        ...job,
                        attentionType: isPriority ? 'priority' : isGhosted ? 'ghosted' : isStale ? 'stale' : 'followup',
                        daysSinceApplied
                    };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => {
                // Priority first, then ghosted, then stale, then followup
                const order = { priority: 0, ghosted: 1, stale: 2, followup: 3 };
                return order[a.attentionType] - order[b.attentionType];
            });
    }, [jobs]);

    const handleDragStart = (e, job) => {
        setDraggedJob(job);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedJob(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e, columnId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        setDragOverColumn(null);

        // Can't drop into Needs Attention column
        if (columnId === 'NeedsAttention') return;

        if (draggedJob && draggedJob.status !== columnId) {
            await onStatusChange(draggedJob.id, columnId);
        }
    };

    const handleRejectGhosted = async (jobId) => {
        await onStatusChange(jobId, 'Rejected');
    };

    const getJobsByStatus = (status) => {
        return jobs.filter(job => job.status === status);
    };

    const handleLoadMore = (columnId) => {
        setVisibleCounts(prev => ({
            ...prev,
            [columnId]: prev[columnId] + LOAD_MORE_COUNT
        }));
    };

    const handleCollapse = (columnId) => {
        setVisibleCounts(prev => ({
            ...prev,
            [columnId]: INITIAL_VISIBLE_COUNT
        }));
    };

    const getAttentionBadge = (type) => {
        switch (type) {
            case 'priority': return { emoji: '⭐', label: 'Priority', className: styles.priorityBadge };
            case 'ghosted': return { emoji: '👻', label: 'Ghosted', className: styles.ghostedBadge };
            case 'stale': return { emoji: '🕐', label: 'Stale', className: styles.staleBadge };
            case 'followup': return { emoji: '📧', label: 'Follow up', className: styles.followupBadge };
            default: return null;
        }
    };

    if (jobs.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={styles.board}>
            {/* Regular Status Columns (Applied, Interview, Offer, Rejected) */}
            {STATUS_COLUMNS.map(column => {
                const columnJobs = getJobsByStatus(column.id);
                const visibleCount = visibleCounts[column.id];
                const visibleJobs = columnJobs.slice(0, visibleCount);
                const hasMore = columnJobs.length > visibleCount;
                const isExpanded = visibleCount > INITIAL_VISIBLE_COUNT && columnJobs.length > INITIAL_VISIBLE_COUNT;
                const remainingCount = columnJobs.length - visibleCount;
                const isDragOver = dragOverColumn === column.id;

                return (
                    <div
                        key={column.id}
                        className={`${styles.column} ${isDragOver ? styles.columnDragOver : ''}`}
                        onDragOver={(e) => handleDragOver(e, column.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className={styles.columnHeader}>
                            <div
                                className={styles.columnIndicator}
                                style={{ backgroundColor: column.color }}
                            />
                            <h3 className={styles.columnTitle}>{column.title}</h3>
                            <span className={styles.columnCount}>{columnJobs.length}</span>
                        </div>

                        <div className={styles.columnContent}>
                            {visibleJobs.map(job => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onClick={() => onJobClick(job)}
                                    onDragStart={(e) => handleDragStart(e, job)}
                                    onDragEnd={handleDragEnd}
                                    isDragging={draggedJob?.id === job.id}
                                />
                            ))}

                            {/* Load More / Collapse buttons */}
                            {(hasMore || isExpanded) && (
                                <div className={styles.columnActions}>
                                    {hasMore && (
                                        <button
                                            className={styles.loadMoreBtn}
                                            onClick={() => handleLoadMore(column.id)}
                                        >
                                            ▼ Load More ({remainingCount})
                                        </button>
                                    )}

                                    {isExpanded && (
                                        <button
                                            className={styles.collapseBtn}
                                            onClick={() => handleCollapse(column.id)}
                                        >
                                            ▲ Collapse
                                        </button>
                                    )}
                                </div>
                            )}

                            {columnJobs.length === 0 && (
                                <div className={styles.emptyColumn}>
                                    <span>No applications</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Needs Attention Column - Far Right */}
            <div
                className={`${styles.column} ${styles.attentionColumn}`}
                onDragOver={(e) => handleDragOver(e, 'NeedsAttention')}
                onDragLeave={handleDragLeave}
            >
                <div className={styles.columnHeader}>
                    <div className={styles.columnIndicator} style={{ backgroundColor: 'var(--color-attention)' }} />
                    <h3 className={styles.columnTitle}>⚠️ Needs Attention</h3>
                    <span className={`${styles.columnCount} ${styles.attentionCount}`}>
                        {needsAttentionJobs.length}
                    </span>
                </div>

                <div className={styles.columnContent}>
                    {needsAttentionJobs
                        .slice(0, visibleCounts.NeedsAttention)
                        .map(job => {
                            const badge = getAttentionBadge(job.attentionType);
                            return (
                                <div key={`attention-${job.id}`} className={styles.attentionCardWrapper}>
                                    <div className={styles.attentionHeader}>
                                        <span className={`${styles.attentionBadge} ${badge.className}`}>
                                            {badge.emoji} {badge.label}
                                        </span>
                                        <span className={styles.daysAgo}>{job.daysSinceApplied}d ago</span>
                                    </div>
                                    <JobCard
                                        job={job}
                                        onClick={() => onJobClick(job)}
                                        onDragStart={(e) => handleDragStart(e, job)}
                                        onDragEnd={handleDragEnd}
                                        isDragging={draggedJob?.id === job.id}
                                    />
                                    {/* Reject button for ghosted jobs */}
                                    {job.attentionType === 'ghosted' && (
                                        <button
                                            className={styles.rejectBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRejectGhosted(job.id);
                                            }}
                                        >
                                            ❌ Move to Rejected
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                    {/* Load More / Collapse */}
                    {(needsAttentionJobs.length > visibleCounts.NeedsAttention ||
                        (visibleCounts.NeedsAttention > INITIAL_VISIBLE_COUNT && needsAttentionJobs.length > INITIAL_VISIBLE_COUNT)) && (
                            <div className={styles.columnActions}>
                                {needsAttentionJobs.length > visibleCounts.NeedsAttention && (
                                    <button
                                        className={styles.loadMoreBtn}
                                        onClick={() => handleLoadMore('NeedsAttention')}
                                    >
                                        ▼ Load More ({needsAttentionJobs.length - visibleCounts.NeedsAttention})
                                    </button>
                                )}
                                {visibleCounts.NeedsAttention > INITIAL_VISIBLE_COUNT && needsAttentionJobs.length > INITIAL_VISIBLE_COUNT && (
                                    <button
                                        className={styles.collapseBtn}
                                        onClick={() => handleCollapse('NeedsAttention')}
                                    >
                                        ▲ Collapse
                                    </button>
                                )}
                            </div>
                        )}

                    {needsAttentionJobs.length === 0 && (
                        <div className={styles.emptyColumn}>
                            <span>✅ All caught up!</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

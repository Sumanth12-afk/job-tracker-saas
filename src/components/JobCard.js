import { format } from 'date-fns';
import styles from './JobCard.module.css';

export default function JobCard({ job, onClick, onDragStart, onDragEnd, isDragging }) {
    // Check if follow-up is pending (applied > 7 days ago and not followed up)
    const isPendingFollowUp = () => {
        if (job.status !== 'Applied' || job.followed_up) return false;
        const daysSinceApplied = Math.floor(
            (new Date() - new Date(job.date_applied)) / (1000 * 60 * 60 * 24)
        );
        return daysSinceApplied >= 7;
    };

    // Check if interview is upcoming
    const hasUpcomingInterview = () => {
        if (!job.interview_date) return false;
        const interviewDate = new Date(job.interview_date);
        const now = new Date();
        const daysUntilInterview = Math.floor(
            (interviewDate - now) / (1000 * 60 * 60 * 24)
        );
        return daysUntilInterview >= 0 && daysUntilInterview <= 7;
    };

    return (
        <div
            className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
            onClick={onClick}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <h4 className={styles.company}>{job.company_name}</h4>
            <p className={styles.title}>{job.job_title}</p>
            <div className={styles.footer}>
                <span className={styles.date}>
                    {format(new Date(job.date_applied), 'MMM d, yyyy')}
                </span>
                {isPendingFollowUp() && (
                    <span className={styles.indicator} title="Follow-up needed">
                        ⏰
                    </span>
                )}
                {hasUpcomingInterview() && (
                    <span className={styles.indicator} title="Interview soon">
                        📅
                    </span>
                )}
            </div>
        </div>
    );
}

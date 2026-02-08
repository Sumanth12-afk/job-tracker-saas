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

    // Extract email address from "Name <email>" format
    const extractEmail = (contactEmail) => {
        if (!contactEmail) return null;
        const match = contactEmail.match(/<([^>]+)>/);
        return match ? match[1] : contactEmail;
    };

    // Generate mailto link for follow-up email
    const getFollowUpLink = () => {
        const email = extractEmail(job.contact_email);
        if (!email) return null;

        const dateApplied = format(new Date(job.date_applied), 'MMMM d, yyyy');
        const subject = encodeURIComponent(
            `Following up on ${job.job_title} Application`
        );
        const body = encodeURIComponent(
            `Hi,\n\n` +
            `I hope this email finds you well. I wanted to follow up on my application for the ${job.job_title} position at ${job.company_name} that I submitted on ${dateApplied}.\n\n` +
            `I am very excited about the opportunity to join your team and would love to discuss how my skills and experience align with your needs.\n\n` +
            `Please let me know if there's any additional information I can provide.\n\n` +
            `Thank you for your time and consideration.\n\n` +
            `Best regards`
        );

        return `mailto:${email}?subject=${subject}&body=${body}`;
    };

    const handleFollowUp = (e) => {
        e.stopPropagation(); // Prevent card click
        const link = getFollowUpLink();
        if (link) {
            window.location.href = link;
        }
    };

    const hasContactEmail = !!job.contact_email;

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
                <div className={styles.actions}>
                    {hasContactEmail && (
                        <button
                            className={styles.followUpBtn}
                            onClick={handleFollowUp}
                            title="Send follow-up email"
                        >
                            📧
                        </button>
                    )}
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
        </div>
    );
}


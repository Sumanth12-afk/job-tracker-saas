import styles from './SummaryBar.module.css';

export default function SummaryBar({ stats }) {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <span className={styles.number}>{stats.total}</span>
                <span className={styles.label}>Total Applications</span>
            </div>
            <div className={styles.card}>
                <span className={`${styles.number} ${styles.interview}`}>{stats.interviews}</span>
                <span className={styles.label}>Interviews</span>
            </div>
            <div className={styles.card}>
                <span className={`${styles.number} ${styles.offer}`}>{stats.offers}</span>
                <span className={styles.label}>Offers</span>
            </div>
            <div className={styles.card}>
                <span className={`${styles.number} ${styles.pending}`}>{stats.pending}</span>
                <span className={styles.label}>Follow-ups Pending</span>
            </div>
        </div>
    );
}

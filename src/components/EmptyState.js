import styles from './EmptyState.module.css';

export default function EmptyState() {
    return (
        <div className={styles.container}>
            <div className={styles.icon}>🎯</div>
            <h3 className={styles.title}>You&apos;re just getting started</h3>
            <p className={styles.description}>
                Add your first job application to begin tracking your journey.
                Every application brings you closer to your goal.
            </p>
            <p className={styles.hint}>
                Click the <strong>+ Add Job</strong> button to get started
            </p>
        </div>
    );
}

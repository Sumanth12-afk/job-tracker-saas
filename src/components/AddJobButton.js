import styles from './AddJobButton.module.css';

export default function AddJobButton({ onClick }) {
    return (
        <button
            className={styles.fab}
            onClick={onClick}
            aria-label="Add new job application"
        >
            <span className={styles.icon}>+</span>
            <span className={styles.text}>Add Job</span>
        </button>
    );
}

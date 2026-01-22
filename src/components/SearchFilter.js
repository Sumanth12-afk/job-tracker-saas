import styles from './SearchFilter.module.css';

export default function SearchFilter({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange
}) {
    return (
        <div className={styles.container}>
            <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by company or job title..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {searchQuery && (
                    <button
                        className={styles.clearBtn}
                        onClick={() => onSearchChange('')}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>

            <div className={styles.filterWrapper}>
                <label htmlFor="statusFilter" className={styles.filterLabel}>
                    Status:
                </label>
                <select
                    id="statusFilter"
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
        </div>
    );
}

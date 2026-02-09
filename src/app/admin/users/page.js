'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../admin.module.css';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        initAndFetch();
    }, []);

    const initAndFetch = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
            setUserEmail(session.user.email);
            await fetchUsers(1, session.user.email);
        }
    };

    const fetchUsers = async (page, email = userEmail) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users?page=${page}&limit=20`, {
                headers: { 'x-admin-email': email }
            });
            const data = await res.json();
            setUsers(data.users || []);
            setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        setDetailsLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                headers: { 'x-admin-email': userEmail }
            });
            const data = await res.json();
            setUserDetails(data);
        } catch (err) {
            console.error('Failed to fetch user details:', err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        setSelectedUser(userId);
        await fetchUserDetails(userId);
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user\'s data? This cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'x-admin-email': userEmail }
            });
            if (res.ok) {
                fetchUsers(pagination.page);
                setSelectedUser(null);
                setUserDetails(null);
            }
        } catch (err) {
            console.error('Failed to delete user:', err);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1>👥 User Management</h1>
                <p>View and manage all users on the platform ({pagination.total} total)</p>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <>
                    <table className={styles.usersTable}>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>First Activity</th>
                                <th>Last Activity</th>
                                <th>Jobs</th>
                                <th>Gmail</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.user_id}>
                                    <td title={user.user_id}>
                                        {user.user_id?.substring(0, 8)}...
                                    </td>
                                    <td>{formatDate(user.first_job)}</td>
                                    <td>{formatDate(user.last_activity)}</td>
                                    <td>{user.job_count}</td>
                                    <td>
                                        {user.gmail_connected ? (
                                            <span className={`${styles.badge} ${user.gmail_expired ? styles.badgeRed : styles.badgeGreen}`}>
                                                {user.gmail_expired ? 'Expired' : 'Connected'}
                                            </span>
                                        ) : (
                                            <span className={`${styles.badge} ${styles.badgeGray}`}>
                                                Not Connected
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className={`${styles.actionButton} ${styles.viewButton}`}
                                            onClick={() => handleViewUser(user.user_id)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            onClick={() => handleDeleteUser(user.user_id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {pagination.totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                className={styles.pageButton}
                                onClick={() => fetchUsers(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                            >
                                Previous
                            </button>
                            <span style={{ color: '#94a3b8', padding: '0.5rem 1rem' }}>
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                className={styles.pageButton}
                                onClick={() => fetchUsers(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* User Details Modal */}
            {selectedUser && (
                <div className={styles.modal} onClick={() => setSelectedUser(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>User Details</h2>
                            <button
                                className={styles.closeButton}
                                onClick={() => setSelectedUser(null)}
                            >
                                ×
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className={styles.loadingContainer}>
                                <div className={styles.spinner}></div>
                            </div>
                        ) : userDetails ? (
                            <div>
                                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                    <strong>User ID:</strong> {userDetails.user_id}
                                </p>

                                <div className={styles.statsGrid} style={{ marginBottom: '1.5rem' }}>
                                    <div className={styles.statCard}>
                                        <p className={styles.statValue}>{userDetails.stats?.totalJobs || 0}</p>
                                        <p className={styles.statLabel}>Total Jobs</p>
                                    </div>
                                    <div className={styles.statCard}>
                                        <p className={styles.statValue}>{userDetails.stats?.sourceBreakdown?.gmail || 0}</p>
                                        <p className={styles.statLabel}>From Gmail</p>
                                    </div>
                                    <div className={styles.statCard}>
                                        <p className={styles.statValue}>{userDetails.stats?.sourceBreakdown?.manual || 0}</p>
                                        <p className={styles.statLabel}>Manual</p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Status Breakdown</h4>
                                    <div className={styles.statusGrid}>
                                        {Object.entries(userDetails.stats?.statusBreakdown || {}).map(([status, count]) => (
                                            <div key={status} className={styles.statusItem}>
                                                <div className={styles.statusCount}>{count}</div>
                                                <div className={styles.statusLabel}>{status}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>Gmail Connection</h4>
                                    {userDetails.gmail?.connected ? (
                                        <p style={{ color: userDetails.gmail.expired ? '#ef4444' : '#22c55e' }}>
                                            {userDetails.gmail.expired ? '❌ Token Expired' : '✅ Connected'}
                                        </p>
                                    ) : (
                                        <p style={{ color: '#64748b' }}>Not connected</p>
                                    )}
                                </div>

                                <div>
                                    <p style={{ color: '#64748b' }}>
                                        <strong>First Activity:</strong> {formatDateTime(userDetails.stats?.firstActivity)}
                                    </p>
                                    <p style={{ color: '#64748b' }}>
                                        <strong>Last Activity:</strong> {formatDateTime(userDetails.stats?.lastActivity)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.error}>Failed to load user details</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

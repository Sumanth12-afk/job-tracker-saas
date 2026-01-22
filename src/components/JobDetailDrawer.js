'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import ResumeLibrary from './ResumeLibrary';
import styles from './JobDetailDrawer.module.css';

export default function JobDetailDrawer({ job, onClose, onUpdate, onDelete, userId }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        company_name: job.company_name,
        job_title: job.job_title,
        job_link: job.job_link || '',
        date_applied: job.date_applied,
        status: job.status,
        interview_date: job.interview_date ? format(new Date(job.interview_date), "yyyy-MM-dd'T'HH:mm") : '',
        notes: job.notes || '',
        resume_version: job.resume_version || '',
    });
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onUpdate(job.id, {
                ...formData,
                job_link: formData.job_link || null,
                notes: formData.notes || null,
                interview_date: formData.interview_date || null,
                resume_version: formData.resume_version || null,
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating job:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await onDelete(job.id);
        } catch (error) {
            console.error('Error deleting job:', error);
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return 'var(--color-applied)';
            case 'Interview': return 'var(--color-interview)';
            case 'Offer': return 'var(--color-offer)';
            case 'Rejected': return 'var(--color-rejected)';
            default: return 'var(--color-gray-400)';
        }
    };

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.drawer}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.company}>{job.company_name}</h2>
                        <p className={styles.title}>{job.job_title}</p>
                    </div>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close drawer"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.body}>
                    {/* Status Badge */}
                    <div className={styles.statusSection}>
                        <span
                            className={styles.statusBadge}
                            style={{
                                backgroundColor: `${getStatusColor(job.status)}20`,
                                color: getStatusColor(job.status),
                            }}
                        >
                            {job.status}
                        </span>
                        <span className={styles.date}>
                            Applied {format(new Date(job.date_applied), 'MMMM d, yyyy')}
                        </span>
                    </div>

                    {/* Timeline */}
                    <div className={styles.timeline}>
                        <h3 className={styles.sectionTitle}>Timeline</h3>
                        <div className={styles.timelineItem}>
                            <div
                                className={styles.timelineDot}
                                style={{ backgroundColor: 'var(--color-applied)' }}
                            />
                            <span>Applied on {format(new Date(job.date_applied), 'MMM d, yyyy')}</span>
                        </div>
                        {job.status === 'Interview' && (
                            <div className={styles.timelineItem}>
                                <div
                                    className={styles.timelineDot}
                                    style={{ backgroundColor: 'var(--color-interview)' }}
                                />
                                <span>Interview stage</span>
                            </div>
                        )}
                        {job.status === 'Offer' && (
                            <div className={styles.timelineItem}>
                                <div
                                    className={styles.timelineDot}
                                    style={{ backgroundColor: 'var(--color-offer)' }}
                                />
                                <span>Received offer! 🎉</span>
                            </div>
                        )}
                        {job.status === 'Rejected' && (
                            <div className={styles.timelineItem}>
                                <div
                                    className={styles.timelineDot}
                                    style={{ backgroundColor: 'var(--color-rejected)' }}
                                />
                                <span>Application closed</span>
                            </div>
                        )}
                    </div>

                    {/* Details / Edit Form */}
                    {isEditing ? (
                        <div className={styles.editForm}>
                            <div className="input-group">
                                <label className="input-label">Company Name</label>
                                <input
                                    name="company_name"
                                    className="input"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Job Title</label>
                                <input
                                    name="job_title"
                                    className="input"
                                    value={formData.job_title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Status</label>
                                <select
                                    name="status"
                                    className="input"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="Applied">Applied</option>
                                    <option value="Interview">Interview</option>
                                    <option value="Offer">Offer</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Job Link</label>
                                <input
                                    name="job_link"
                                    type="url"
                                    className="input"
                                    value={formData.job_link}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Interview Date</label>
                                <input
                                    name="interview_date"
                                    type="datetime-local"
                                    className="input"
                                    value={formData.interview_date}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Notes</label>
                                <textarea
                                    name="notes"
                                    className={`input ${styles.textarea}`}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">📝 Resume Version</label>
                                <ResumeLibrary
                                    userId={userId}
                                    mode="select"
                                    selectedVersion={formData.resume_version}
                                    onSelect={(value) => setFormData(prev => ({ ...prev, resume_version: value }))}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.details}>
                            {job.job_link && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Job Link</span>
                                    <a
                                        href={job.job_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.link}
                                    >
                                        View Job Posting →
                                    </a>
                                </div>
                            )}
                            {job.interview_date && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Interview Date</span>
                                    <span>{format(new Date(job.interview_date), 'MMMM d, yyyy h:mm a')}</span>
                                </div>
                            )}
                            {job.notes && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Notes</span>
                                    <p className={styles.notes}>{job.notes}</p>
                                </div>
                            )}
                            {job.resume_version && (
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>📝 Resume Version</span>
                                    <span className={styles.resumeBadge}>{job.resume_version}</span>
                                </div>
                            )}
                            {!job.job_link && !job.interview_date && !job.notes && !job.resume_version && (
                                <p className={styles.noDetails}>No additional details. Click Edit to add more.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className={styles.footer}>
                    {isEditing ? (
                        <>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{ color: 'var(--color-error)' }}
                            >
                                Delete
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </button>
                        </>
                    )}
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className={styles.confirmOverlay}>
                        <div className={styles.confirmModal}>
                            <h3>Delete this application?</h3>
                            <p>This action cannot be undone.</p>
                            <div className={styles.confirmActions}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ background: 'var(--color-error)' }}
                                    onClick={handleDelete}
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

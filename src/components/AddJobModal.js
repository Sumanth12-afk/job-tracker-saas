'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import styles from './AddJobModal.module.css';

export default function AddJobModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        company_name: '',
        job_title: '',
        date_applied: format(new Date(), 'yyyy-MM-dd'),
        status: 'Applied',
        job_link: '',
        notes: '',
        interview_date: '',
    });
    const [showExpanded, setShowExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                job_link: formData.job_link || null,
                notes: formData.notes || null,
                interview_date: formData.interview_date || null,
            };
            await onSubmit(dataToSubmit);
        } catch (err) {
            setError(err.message || 'Failed to add job');
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Add Job Application</h2>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.row}>
                        <div className="input-group">
                            <label htmlFor="company_name" className="input-label">
                                Company Name *
                            </label>
                            <input
                                id="company_name"
                                name="company_name"
                                type="text"
                                className="input"
                                placeholder="e.g., Google"
                                value={formData.company_name}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className="input-group">
                            <label htmlFor="job_title" className="input-label">
                                Job Title *
                            </label>
                            <input
                                id="job_title"
                                name="job_title"
                                type="text"
                                className="input"
                                placeholder="e.g., Software Engineer"
                                value={formData.job_title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className="input-group">
                            <label htmlFor="date_applied" className="input-label">
                                Date Applied *
                            </label>
                            <input
                                id="date_applied"
                                name="date_applied"
                                type="date"
                                className="input"
                                value={formData.date_applied}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="status" className="input-label">
                                Status
                            </label>
                            <select
                                id="status"
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
                    </div>

                    {/* Expandable Section */}
                    <button
                        type="button"
                        className={styles.expandBtn}
                        onClick={() => setShowExpanded(!showExpanded)}
                    >
                        {showExpanded ? '− Hide additional fields' : '+ Add more details'}
                    </button>

                    {showExpanded && (
                        <div className={styles.expanded}>
                            <div className="input-group">
                                <label htmlFor="job_link" className="input-label">
                                    Job Link
                                </label>
                                <input
                                    id="job_link"
                                    name="job_link"
                                    type="url"
                                    className="input"
                                    placeholder="https://..."
                                    value={formData.job_link}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="interview_date" className="input-label">
                                    Interview Date
                                </label>
                                <input
                                    id="interview_date"
                                    name="interview_date"
                                    type="datetime-local"
                                    className="input"
                                    value={formData.interview_date}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="notes" className="input-label">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    className={`input ${styles.textarea}`}
                                    placeholder="Any notes about this application..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Adding...
                                </>
                            ) : (
                                'Add Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

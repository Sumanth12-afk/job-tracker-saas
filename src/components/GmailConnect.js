'use client';

import { useState } from 'react';
import styles from './GmailConnect.module.css';

export default function GmailConnect({ onJobsFound, isConnected, setIsConnected, userId }) {
    const [isScanning, setIsScanning] = useState(false);
    const [foundJobs, setFoundJobs] = useState([]);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('30'); // days
    const [scanStats, setScanStats] = useState(null); // Track scan statistics

    const handleConnect = async () => {
        try {
            setError('');
            // Pass user ID to auth endpoint for database storage
            const authUrl = userId ? `/api/gmail/auth?user_id=${userId}` : '/api/gmail/auth';
            window.location.href = authUrl;
        } catch (err) {
            setError('Failed to connect to Gmail');
        }
    };

    const handleScan = async () => {
        setIsScanning(true);
        setError('');

        try {
            const response = await fetch(`/api/gmail/scan?days=${timeRange}&userId=${userId}`);
            const data = await response.json();

            // Handle rate limiting
            if (response.status === 429) {
                const retryAfter = data.retryAfter || 60;
                setError(`⏱️ Slow down! Too many scans. Please wait ${retryAfter} seconds before scanning again.`);
                setIsScanning(false);
                return;
            }

            if (data.error) {
                throw new Error(data.error);
            }

            setFoundJobs(data.jobs || []);

            // Store scan statistics for display
            setScanStats({
                scanned: data.scanned || 0,
                found: data.jobs?.length || 0,
                alreadyImported: data.alreadyImported || 0,
                timeRange: data.timeRange || `${timeRange} days`
            });

            console.log('Gmail scan result:', { jobs: data.jobs?.length, scanned: data.scanned, alreadyImported: data.alreadyImported, existingJobsCount: data.existingJobsCount });

            // Show appropriate message based on results
            if (data.jobs?.length === 0) {
                if (data.alreadyImported > 0) {
                    setError(`✅ All caught up! ${data.alreadyImported} job email(s) already imported.`);
                } else if (data.existingJobsCount > 0) {
                    // No new emails found, but user has existing jobs tracked
                    setError(`✅ All caught up! You have ${data.existingJobsCount} jobs already tracked from Gmail.`);
                } else if (data.scanned > 0) {
                    setError(`Scanned ${data.scanned} emails but no new job applications found`);
                } else {
                    setError(`No job emails found in the last ${timeRange} days`);
                }
            }
        } catch (err) {
            setError(err.message || 'Failed to scan emails');
        } finally {
            setIsScanning(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await fetch('/api/gmail/disconnect', { method: 'POST' });
            setIsConnected(false);
            setFoundJobs([]);
        } catch (err) {
            setError('Failed to disconnect');
        }
    };

    const handleAddJob = (job) => {
        onJobsFound([job]);
        setFoundJobs(prev => prev.filter(j => j.id !== job.id));
    };

    const handleAddAll = () => {
        onJobsFound(foundJobs);
        setFoundJobs([]);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <svg className={styles.gmailIcon} viewBox="0 0 24 24" width="24" height="24">
                        <path fill="#EA4335" d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                    </svg>
                </div>
                <div>
                    <h3 className={styles.title}>Gmail Integration</h3>
                    <p className={styles.subtitle}>
                        Auto-detect job application confirmation emails
                    </p>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {!isConnected ? (
                <div className={styles.connectSection}>
                    <p className={styles.disclaimer}>
                        We only scan for job-related emails. We never read personal emails,
                        store email content, or share your data.
                    </p>
                    <button
                        onClick={handleConnect}
                        className={`btn btn-secondary ${styles.connectBtn}`}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Connect Gmail
                    </button>
                </div>
            ) : (
                <div className={styles.connectedSection}>
                    <div className={styles.statusBar}>
                        <span className={styles.connectedBadge}>✓ Connected</span>
                        <button
                            onClick={handleDisconnect}
                            className="btn btn-ghost btn-sm"
                        >
                            Disconnect
                        </button>
                    </div>

                    <div className={styles.scanControls}>
                        <label className={styles.timeLabel}>
                            Scan emails from:
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className={styles.timeSelect}
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="180">Last 6 months</option>
                                <option value="365">Last year</option>
                            </select>
                        </label>

                        <button
                            onClick={handleScan}
                            className="btn btn-primary"
                            disabled={isScanning}
                        >
                            {isScanning ? (
                                <>
                                    <span className="spinner"></span>
                                    Scanning...
                                </>
                            ) : (
                                '🔍 Scan for Job Emails'
                            )}
                        </button>
                    </div>

                    {/* Scan Statistics Display */}
                    {scanStats && (
                        <div className={styles.scanStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{scanStats.scanned}</span>
                                <span className={styles.statLabel}>Emails Scanned</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{scanStats.found}</span>
                                <span className={styles.statLabel}>Jobs Found</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statNumber}>{scanStats.alreadyImported}</span>
                                <span className={styles.statLabel}>Already Imported</span>
                            </div>
                        </div>
                    )}

                    {foundJobs.length > 0 && (
                        <div className={styles.foundJobs}>
                            <div className={styles.foundHeader}>
                                <span>Found {foundJobs.length} potential applications</span>
                                <button
                                    onClick={handleAddAll}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Add All
                                </button>
                            </div>
                            <div className={styles.jobsList}>
                                {foundJobs.map((job, index) => (
                                    <div key={index} className={styles.foundJob}>
                                        <div className={styles.jobInfo}>
                                            <span className={styles.jobCompany}>{job.company_name}</span>
                                            <span className={styles.jobTitle}>{job.job_title}</span>
                                            <span className={styles.jobDate}>{job.date_applied}</span>
                                        </div>
                                        <button
                                            onClick={() => handleAddJob(job)}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

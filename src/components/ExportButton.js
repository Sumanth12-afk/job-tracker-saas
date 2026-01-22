'use client';

import { useState } from 'react';
import styles from './ExportButton.module.css';

export default function ExportButton({ jobs }) {
    const [isExporting, setIsExporting] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const exportToCSV = () => {
        setIsExporting(true);
        try {
            // Calculate days since applied for each job
            const now = new Date();
            const enhancedJobs = jobs.map(job => {
                const daysSinceApplied = Math.floor(
                    (now - new Date(job.date_applied)) / (1000 * 60 * 60 * 24)
                );

                // Determine if needs attention
                let attentionStatus = '';
                const isPriority = job.notes?.toLowerCase().includes('#priority') ||
                    job.notes?.toLowerCase().includes('#important');
                if (isPriority) {
                    attentionStatus = 'Priority';
                } else if (job.status === 'Applied' && daysSinceApplied >= 30) {
                    attentionStatus = 'Ghosted (30+ days)';
                } else if (job.status === 'Applied' && daysSinceApplied >= 14) {
                    attentionStatus = 'Stale (14+ days)';
                } else if (job.status === 'Applied' && !job.followed_up && daysSinceApplied >= 7) {
                    attentionStatus = 'Needs Follow-up';
                }

                return {
                    ...job,
                    daysSinceApplied,
                    attentionStatus
                };
            });

            const headers = [
                'Company',
                'Position',
                'Status',
                'Date Applied',
                'Days Since Applied',
                'Needs Attention',
                'Followed Up',
                'Source'
            ];

            const rows = enhancedJobs.map(job => [
                job.company_name || '',
                job.job_title || '',
                job.status || '',
                job.date_applied || '',
                job.daysSinceApplied || 0,
                job.attentionStatus || '',
                job.followed_up ? 'Yes' : 'No',
                job.source || 'manual'
            ]);

            // Clean up special characters for CSV compatibility
            const cleanRows = rows.map(row =>
                row.map(cell => String(cell).replace(/—/g, '-').replace(/[^\x00-\x7F]/g, ''))
            );

            const csvContent = [
                headers.join(','),
                ...cleanRows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Add UTF-8 BOM for Excel compatibility
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
            setShowMenu(false);
        }
    };

    const exportToJSON = () => {
        setIsExporting(true);
        try {
            const data = jobs.map(job => ({
                company: job.company_name,
                position: job.job_title,
                status: job.status,
                dateApplied: job.date_applied,
                salary: job.salary_range,
                location: job.location,
                url: job.url,
                notes: job.notes
            }));

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
            setShowMenu(false);
        }
    };

    const generateSummaryReport = () => {
        setIsExporting(true);
        try {
            const total = jobs.length;
            const byStatus = {
                Applied: jobs.filter(j => j.status === 'Applied').length,
                Interview: jobs.filter(j => j.status === 'Interview').length,
                Offer: jobs.filter(j => j.status === 'Offer').length,
                Rejected: jobs.filter(j => j.status === 'Rejected').length,
            };

            const report = `
JOB APPLICATION REPORT
Generated: ${new Date().toLocaleDateString()}
====================================

SUMMARY
-------
Total Applications: ${total}
Interviews: ${byStatus.Interview}
Offers: ${byStatus.Offer}
Rejections: ${byStatus.Rejected}
Pending: ${byStatus.Applied}

Interview Rate: ${total > 0 ? Math.round((byStatus.Interview / total) * 100) : 0}%
Offer Rate: ${byStatus.Interview > 0 ? Math.round((byStatus.Offer / byStatus.Interview) * 100) : 0}%

APPLICATIONS BY STATUS
----------------------
${Object.entries(byStatus).map(([status, count]) =>
                `${status}: ${count} (${total > 0 ? Math.round((count / total) * 100) : 0}%)`
            ).join('\n')}

RECENT APPLICATIONS
-------------------
${jobs.slice(0, 10).map(job =>
                `• ${job.company_name || 'Unknown'} - ${job.job_title || 'Position'} [${job.status}]`
            ).join('\n')}

====================================
Generated by JobTracker
            `.trim();

            const blob = new Blob([report], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `job-report-${new Date().toISOString().split('T')[0]}.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
            setShowMenu(false);
        }
    };

    return (
        <div className={styles.container}>
            <button
                className={`btn btn-secondary ${styles.exportBtn}`}
                onClick={() => setShowMenu(!showMenu)}
                disabled={isExporting || jobs.length === 0}
            >
                {isExporting ? (
                    <>
                        <span className="spinner"></span>
                        Exporting...
                    </>
                ) : (
                    <>📥 Export Data</>
                )}
            </button>

            {showMenu && (
                <div className={styles.menu}>
                    <button onClick={exportToCSV} className={styles.menuItem}>
                        <span className={styles.menuIcon}>📊</span>
                        <div>
                            <strong>CSV Spreadsheet</strong>
                            <span>For Excel, Google Sheets</span>
                        </div>
                    </button>
                    <button onClick={exportToJSON} className={styles.menuItem}>
                        <span className={styles.menuIcon}>📄</span>
                        <div>
                            <strong>JSON Data</strong>
                            <span>For developers, backups</span>
                        </div>
                    </button>
                    <button onClick={generateSummaryReport} className={styles.menuItem}>
                        <span className={styles.menuIcon}>📋</span>
                        <div>
                            <strong>Summary Report</strong>
                            <span>Quick text overview</span>
                        </div>
                    </button>
                </div>
            )}

            {showMenu && <div className={styles.overlay} onClick={() => setShowMenu(false)} />}
        </div>
    );
}

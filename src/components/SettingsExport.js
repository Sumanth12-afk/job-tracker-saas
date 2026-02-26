'use client';

import { Download } from 'lucide-react';
import styles from './SettingsExport.module.css';

export default function SettingsExport({ jobs }) {
    const handleExport = () => {
        if (!jobs || jobs.length === 0) return;

        const headers = ['Company', 'Job Title', 'Status', 'Date Applied', 'Source', 'Job Link', 'Notes', 'Interview Date', 'Followed Up'];
        const rows = jobs.map(j => [
            j.company_name || '',
            j.job_title || '',
            j.status || '',
            j.date_applied || '',
            j.source || 'manual',
            j.job_link || '',
            (j.notes || '').replace(/"/g, '""'),
            j.interview_date || '',
            j.followed_up ? 'Yes' : 'No',
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.exportCard}>
            <h3 className={styles.sectionTitle}>
                <Download size={18} /> Export Data
            </h3>
            <div className={styles.cardBody}>
                <p className={styles.description}>
                    Download all your job applications as a CSV file. Compatible with Excel, Google Sheets, and other spreadsheet apps.
                </p>
                <div className={styles.exportRow}>
                    <button onClick={handleExport} className={styles.exportBtn} disabled={!jobs || jobs.length === 0}>
                        <Download size={14} /> Export {jobs?.length || 0} Applications as CSV
                    </button>
                </div>
            </div>
        </div>
    );
}

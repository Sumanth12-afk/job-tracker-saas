import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
    title: 'Privacy Policy - JobTracker',
    description: 'Privacy Policy for JobTracker job application tracking platform.',
};

export default function PrivacyPage() {
    return (
        <div className={styles.legalPage}>
            <header className={styles.legalHeader}>
                <Link href="/" className={styles.legalLogo}>
                    <ClipboardList size={20} /> JobTracker
                </Link>
                <Link href="/" className={styles.legalBack}>← Back to Home</Link>
            </header>

            <div className={styles.legalContainer}>
                <h1 className={styles.legalTitle}>Privacy Policy</h1>
                <p className={styles.legalUpdated}>Last updated: February 26, 2026</p>

                <div className={styles.legalContent}>
                    <h2>1. Overview</h2>
                    <p>
                        JobTracker ("we", "our", "the Service") is committed to protecting your privacy. This Privacy
                        Policy explains what data we collect, how we use it, and your rights regarding your personal information.
                    </p>

                    <h2>2. Information We Collect</h2>
                    <p>We collect the following types of information:</p>

                    <p><strong>Account Information</strong></p>
                    <ul>
                        <li>Email address (from sign-up or Google OAuth)</li>
                        <li>Display name (optional, set by you)</li>
                        <li>Profile picture (optional, uploaded by you)</li>
                    </ul>

                    <p><strong>Job Application Data</strong></p>
                    <ul>
                        <li>Company names, job titles, and application dates</li>
                        <li>Application status (Applied, Interview, Offer, Rejected)</li>
                        <li>Notes, job links, and interview dates you enter</li>
                        <li>Resume file names (files stored in your browser, not our servers)</li>
                    </ul>

                    <p><strong>Gmail Data (Only if you opt in)</strong></p>
                    <ul>
                        <li>We scan your Gmail inbox for job-related emails using read-only access</li>
                        <li>We extract only: sender name (company), subject line (job title), and date</li>
                        <li>We do <strong>not</strong> store the full email body</li>
                        <li>We do <strong>not</strong> access drafts, sent mail, or attachments</li>
                        <li>We <strong>cannot</strong> send, delete, or modify any emails</li>
                    </ul>

                    <p><strong>Usage Data</strong></p>
                    <ul>
                        <li>We may collect anonymous usage analytics (page views, feature usage) to improve the Service</li>
                        <li>We do not use third-party tracking cookies</li>
                    </ul>

                    <h2>3. How We Use Your Data</h2>
                    <ul>
                        <li><strong>Provide the Service:</strong> Display your job applications, analytics, and follow-up reminders</li>
                        <li><strong>Gmail Integration:</strong> Automatically detect and import job application confirmations</li>
                        <li><strong>Public Profile:</strong> Display your aggregated stats (only if you enable it)</li>
                        <li><strong>Improve the Service:</strong> Understand usage patterns to build better features</li>
                    </ul>
                    <p>We do <strong>not</strong> sell, rent, or share your personal data with third parties for marketing purposes.</p>

                    <h2>4. Data Storage & Security</h2>
                    <ul>
                        <li>Your data is stored in <strong>Supabase</strong> (built on PostgreSQL), which provides encryption at rest and in transit</li>
                        <li>Row Level Security (RLS) ensures you can only access your own data</li>
                        <li>Gmail OAuth tokens are stored encrypted and are never exposed to the client</li>
                        <li>Some preferences (timezone, target role, goals) are stored locally in your browser via localStorage</li>
                        <li>Profile pictures are stored in Supabase Storage with access controls</li>
                    </ul>

                    <h2>5. Third-Party Services</h2>
                    <p>We use the following third-party services:</p>
                    <ul>
                        <li><strong>Supabase:</strong> Database, authentication, and file storage (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                        <li><strong>Google OAuth:</strong> Sign-in and Gmail integration (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                        <li><strong>Netlify:</strong> Web hosting (<a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
                    </ul>

                    <h2>6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li><strong>Access:</strong> View all data we store about you (visible in your dashboard)</li>
                        <li><strong>Export:</strong> Download your data as CSV at any time from Settings</li>
                        <li><strong>Delete:</strong> Permanently delete all your job application data from Settings → Danger Zone</li>
                        <li><strong>Disconnect Gmail:</strong> Revoke Gmail access at any time from Settings</li>
                        <li><strong>Disable Public Profile:</strong> Toggle your profile to private at any time</li>
                        <li><strong>Account Deletion:</strong> Contact us to fully delete your account and all associated data</li>
                    </ul>

                    <h2>7. Data Retention</h2>
                    <p>
                        We retain your data for as long as your account is active. If you delete your data using the
                        Danger Zone feature, it is permanently removed from our database. If you wish to fully delete
                        your account, contact us and we will remove all data within 30 days.
                    </p>

                    <h2>8. Children's Privacy</h2>
                    <p>
                        The Service is not intended for children under 16 years of age. We do not knowingly collect
                        personal information from children under 16.
                    </p>

                    <h2>9. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify users of significant changes
                        via email or in-app notification. The "Last updated" date at the top reflects the most recent revision.
                    </p>

                    <h2>10. Contact Us</h2>
                    <p>
                        For privacy-related questions or requests, contact us at{' '}
                        <a href="mailto:nallandhigalsumanth@gmail.com">nallandhigalsumanth@gmail.com</a>.
                    </p>
                </div>
            </div>

            <footer className={styles.legalFooter}>
                <span>© 2026 JobTracker. All rights reserved. | <Link href="/terms">Terms of Service</Link></span>
            </footer>
        </div>
    );
}

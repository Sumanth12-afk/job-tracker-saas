import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import styles from '../legal.module.css';

export const metadata = {
    title: 'Terms of Service - JobTracker',
    description: 'Terms of Service for JobTracker job application tracking platform.',
};

export default function TermsPage() {
    return (
        <div className={styles.legalPage}>
            <header className={styles.legalHeader}>
                <Link href="/" className={styles.legalLogo}>
                    <ClipboardList size={20} /> JobTracker
                </Link>
                <Link href="/" className={styles.legalBack}>← Back to Home</Link>
            </header>

            <div className={styles.legalContainer}>
                <h1 className={styles.legalTitle}>Terms of Service</h1>
                <p className={styles.legalUpdated}>Last updated: February 26, 2026</p>

                <div className={styles.legalContent}>
                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using JobTracker ("the Service"), you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use the Service.
                    </p>

                    <h2>2. Description of Service</h2>
                    <p>
                        JobTracker is a web-based application that helps users track and manage their job applications,
                        interviews, and offers. The Service includes features such as manual job entry, Gmail integration
                        for automatic application detection, analytics, follow-up reminders, and public profile portfolios.
                    </p>

                    <h2>3. Account Registration</h2>
                    <p>To use the Service, you must:</p>
                    <ul>
                        <li>Create an account using a valid email address or Google Sign-In</li>
                        <li>Be at least 16 years of age</li>
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the security of your account credentials</li>
                    </ul>
                    <p>
                        You are responsible for all activity that occurs under your account. Notify us immediately if you
                        suspect unauthorized access.
                    </p>

                    <h2>4. Gmail Integration</h2>
                    <p>
                        If you choose to connect your Gmail account, the Service will access your emails in
                        <strong> read-only mode</strong> to detect job application confirmations. Specifically:
                    </p>
                    <ul>
                        <li>We only read emails matching job-related patterns (e.g., "application received", "thank you for applying")</li>
                        <li>We <strong>never</strong> send, delete, or modify your emails</li>
                        <li>We do not store the full content of your emails</li>
                        <li>We only extract: company name, job title, and date</li>
                        <li>You can disconnect Gmail at any time from Settings</li>
                    </ul>

                    <h2>5. User Data</h2>
                    <p>
                        You retain ownership of all data you input into the Service. This includes job applications,
                        notes, resumes, and profile information. You may export your data at any time using the CSV export
                        feature, and delete all your data through the Danger Zone in Settings.
                    </p>

                    <h2>6. Public Profiles</h2>
                    <p>
                        If you enable the Public Profile feature, certain aggregated statistics about your job search will
                        be visible to anyone with your profile link. <strong>No sensitive information</strong> (company names,
                        notes, salary details, or email content) is ever exposed on public profiles. You control which
                        statistics are visible and can disable your public profile at any time.
                    </p>

                    <h2>7. Acceptable Use</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the Service for any unlawful purpose</li>
                        <li>Attempt to gain unauthorized access to other users' data</li>
                        <li>Upload malicious content or attempt to compromise the Service</li>
                        <li>Use automated tools to scrape or overload the Service</li>
                        <li>Resell or redistribute access to the Service</li>
                    </ul>

                    <h2>8. Service Availability</h2>
                    <p>
                        We strive to keep the Service available 24/7, but we do not guarantee uninterrupted access.
                        We may perform maintenance, updates, or experience downtime. We are not liable for any losses
                        resulting from service interruptions.
                    </p>

                    <h2>9. Limitation of Liability</h2>
                    <p>
                        The Service is provided "as is" without warranties of any kind, either express or implied.
                        JobTracker shall not be liable for any indirect, incidental, special, or consequential damages
                        arising from your use of the Service. Our total liability shall not exceed the amount you paid
                        for the Service in the 12 months preceding the claim.
                    </p>

                    <h2>10. Termination</h2>
                    <p>
                        You may terminate your account at any time by deleting your data and ceasing use of the Service.
                        We reserve the right to suspend or terminate accounts that violate these terms.
                    </p>

                    <h2>11. Changes to Terms</h2>
                    <p>
                        We may update these Terms from time to time. We will notify users of significant changes via email
                        or in-app notification. Continued use of the Service after changes constitutes acceptance of the updated terms.
                    </p>

                    <h2>12. Contact</h2>
                    <p>
                        If you have questions about these Terms, contact us at <a href="mailto:nallandhigalsumanth@gmail.com">nallandhigalsumanth@gmail.com</a>.
                    </p>
                </div>
            </div>

            <footer className={styles.legalFooter}>
                <span>© 2026 JobTracker. All rights reserved. | <Link href="/privacy">Privacy Policy</Link></span>
            </footer>
        </div>
    );
}

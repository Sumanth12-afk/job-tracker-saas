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
            <div className={styles.bgGlow} />
            <div className={styles.bgGrid} />

            <header className={styles.legalHeader}>
                <Link href="/" className={styles.legalLogo}>
                    <ClipboardList size={20} /> JobTracker
                </Link>
                <Link href="/" className={styles.legalBack}>← Back to Home</Link>
            </header>

            <div className={styles.legalContainer}>
                <div className={styles.legalHero}>
                    <div className={styles.legalBadge}>📜 Legal</div>
                    <h1 className={styles.legalTitle}>Terms of Service</h1>
                    <p className={styles.legalUpdated}>Last updated: February 26, 2026</p>
                    <div className={styles.legalDivider} />
                </div>

                {/* Table of Contents */}
                <div className={styles.toc}>
                    {['Acceptance', 'Service', 'Accounts', 'Gmail', 'Data', 'Public Profiles', 'Usage', 'Availability', 'Liability', 'Termination', 'Changes', 'Contact'].map((item) => (
                        <span key={item} className={styles.tocItem}>{item}</span>
                    ))}
                </div>

                <div className={styles.legalContent}>
                    {/* Section 1 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>1</span>
                            <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                By accessing or using JobTracker (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use the Service.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>2</span>
                            <h2 className={styles.sectionTitle}>Description of Service</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                JobTracker is a web-based application that helps users track and manage their job applications,
                                interviews, and offers. The Service includes:
                            </p>
                            <ul>
                                <li>Manual job entry and Kanban board tracking</li>
                                <li>Gmail integration for automatic application detection</li>
                                <li>Analytics and insights dashboard</li>
                                <li>Follow-up reminders and streak tracking</li>
                                <li>Public profile portfolios</li>
                                <li>Resume library management</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>3</span>
                            <h2 className={styles.sectionTitle}>Account Registration</h2>
                        </div>
                        <div className={styles.sectionBody}>
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
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>4</span>
                            <h2 className={styles.sectionTitle}>Gmail Integration</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                If you choose to connect your Gmail account, the Service will access your emails in
                                <strong> read-only mode</strong> to detect job application confirmations.
                            </p>
                            <div className={styles.highlight}>
                                <p>
                                    🔒 We <strong>never</strong> send, delete, or modify your emails. We do not store the full
                                    content of your emails. We only extract: company name, job title, and date.
                                </p>
                            </div>
                            <ul>
                                <li>We only read emails matching job-related patterns</li>
                                <li>We extract only: sender name (company), subject line (job title), and date</li>
                                <li>You can disconnect Gmail at any time from Settings</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>5</span>
                            <h2 className={styles.sectionTitle}>User Data</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                You retain ownership of all data you input into the Service. This includes job applications,
                                notes, resumes, and profile information. You may:
                            </p>
                            <ul>
                                <li>Export your data at any time using the CSV export feature</li>
                                <li>Delete all your data through Settings → Danger Zone</li>
                                <li>Request full account deletion by contacting us</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 6 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>6</span>
                            <h2 className={styles.sectionTitle}>Public Profiles</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                If you enable the Public Profile feature, certain <strong>aggregated statistics</strong> about your job search will
                                be visible to anyone with your profile link.
                            </p>
                            <div className={styles.highlight}>
                                <p>
                                    🛡️ <strong>No sensitive information</strong> (company names, notes, salary details, or email content)
                                    is ever exposed. You control which stats are visible and can disable your profile at any time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 7 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>7</span>
                            <h2 className={styles.sectionTitle}>Acceptable Use</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>You agree not to:</p>
                            <ul>
                                <li>Use the Service for any unlawful purpose</li>
                                <li>Attempt to gain unauthorized access to other users&apos; data</li>
                                <li>Upload malicious content or attempt to compromise the Service</li>
                                <li>Use automated tools to scrape or overload the Service</li>
                                <li>Resell or redistribute access to the Service</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 8 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>8</span>
                            <h2 className={styles.sectionTitle}>Service Availability</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                We strive to keep the Service available 24/7, but we do not guarantee uninterrupted access.
                                We may perform maintenance, updates, or experience downtime. We are not liable for any losses
                                resulting from service interruptions.
                            </p>
                        </div>
                    </div>

                    {/* Section 9 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>9</span>
                            <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                The Service is provided &quot;as is&quot; without warranties of any kind. JobTracker shall not be
                                liable for any indirect, incidental, special, or consequential damages arising from your use of
                                the Service. Our total liability shall not exceed the amount you paid for the Service in the
                                12 months preceding the claim.
                            </p>
                        </div>
                    </div>

                    {/* Section 10 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>10</span>
                            <h2 className={styles.sectionTitle}>Termination</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                You may terminate your account at any time by deleting your data and ceasing use of the Service.
                                We reserve the right to suspend or terminate accounts that violate these terms.
                            </p>
                        </div>
                    </div>

                    {/* Section 11 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>11</span>
                            <h2 className={styles.sectionTitle}>Changes to Terms</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                We may update these Terms from time to time. We will notify users of significant changes via email
                                or in-app notification. Continued use of the Service after changes constitutes acceptance.
                            </p>
                        </div>
                    </div>

                    {/* Section 12 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>12</span>
                            <h2 className={styles.sectionTitle}>Contact</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                If you have questions about these Terms, contact us at{' '}
                                <a href="mailto:nallandhigalsumanth@gmail.com">nallandhigalsumanth@gmail.com</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className={styles.legalFooter}>
                © 2026 JobTracker. All rights reserved. | <Link href="/privacy">Privacy Policy</Link>
            </footer>
        </div>
    );
}

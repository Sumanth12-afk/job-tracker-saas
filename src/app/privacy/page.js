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
                    <div className={styles.legalBadge}>🔒 Privacy</div>
                    <h1 className={styles.legalTitle}>Privacy Policy</h1>
                    <p className={styles.legalUpdated}>Last updated: February 26, 2026</p>
                    <div className={styles.legalDivider} />
                </div>

                {/* Table of Contents */}
                <div className={styles.toc}>
                    {['Overview', 'Data Collection', 'How We Use Data', 'Storage & Security', 'Third Parties', 'Your Rights', 'Retention', 'Children', 'Changes', 'Contact'].map((item) => (
                        <span key={item} className={styles.tocItem}>{item}</span>
                    ))}
                </div>

                <div className={styles.legalContent}>
                    {/* Section 1 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>1</span>
                            <h2 className={styles.sectionTitle}>Overview</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                JobTracker (&quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;) is committed to protecting your privacy. This Privacy
                                Policy explains what data we collect, how we use it, and your rights regarding your personal information.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>2</span>
                            <h2 className={styles.sectionTitle}>Information We Collect</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>We collect the following types of information:</p>

                            <div className={styles.dataLabel}>👤 Account Information</div>
                            <ul>
                                <li>Email address (from sign-up or Google OAuth)</li>
                                <li>Display name (optional, set by you)</li>
                                <li>Profile picture (optional, uploaded by you)</li>
                            </ul>

                            <div className={styles.dataLabel}>📋 Job Application Data</div>
                            <ul>
                                <li>Company names, job titles, and application dates</li>
                                <li>Application status (Applied, Interview, Offer, Rejected)</li>
                                <li>Notes, job links, and interview dates you enter</li>
                                <li>Resume file names (files stored in your browser, not our servers)</li>
                            </ul>

                            <div className={styles.dataLabel}>📧 Gmail Data (Only if you opt in)</div>
                            <div className={styles.highlight}>
                                <p>
                                    We scan your Gmail inbox using <strong>read-only access</strong> to detect job-related emails.
                                    We extract only: sender name (company), subject line (job title), and date. We do <strong>not</strong> store
                                    the full email body, and <strong>cannot</strong> send, delete, or modify any emails.
                                </p>
                            </div>

                            <div className={styles.dataLabel}>📊 Usage Data</div>
                            <ul>
                                <li>We may collect anonymous usage analytics to improve the Service</li>
                                <li>We do not use third-party tracking cookies</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>3</span>
                            <h2 className={styles.sectionTitle}>How We Use Your Data</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <ul>
                                <li><strong>Provide the Service:</strong> Display your job applications, analytics, and reminders</li>
                                <li><strong>Gmail Integration:</strong> Automatically detect and import job applications</li>
                                <li><strong>Public Profile:</strong> Display your aggregated stats (only if you enable it)</li>
                                <li><strong>Improve the Service:</strong> Understand usage patterns to build better features</li>
                            </ul>
                            <div className={styles.highlight}>
                                <p>
                                    🚫 We do <strong>not</strong> sell, rent, or share your personal data with third parties for marketing purposes. Ever.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>4</span>
                            <h2 className={styles.sectionTitle}>Data Storage & Security</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <ul>
                                <li>Data stored in <strong>Supabase</strong> (PostgreSQL) with encryption at rest and in transit</li>
                                <li><strong>Row Level Security</strong> ensures you can only access your own data</li>
                                <li>Gmail OAuth tokens stored encrypted, never exposed to the client</li>
                                <li>Some preferences stored locally in your browser via localStorage</li>
                                <li>Profile pictures stored in Supabase Storage with access controls</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>5</span>
                            <h2 className={styles.sectionTitle}>Third-Party Services</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>We use the following third-party services:</p>
                            <ul>
                                <li><strong>Supabase</strong> — Database, authentication, and file storage</li>
                                <li><strong>Google OAuth</strong> — Sign-in and Gmail integration</li>
                                <li><strong>Netlify</strong> — Web hosting and deployment</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 6 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>6</span>
                            <h2 className={styles.sectionTitle}>Your Rights</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>You have the right to:</p>
                            <ul>
                                <li><strong>Access:</strong> View all data we store about you (visible in your dashboard)</li>
                                <li><strong>Export:</strong> Download your data as CSV at any time from Settings</li>
                                <li><strong>Delete:</strong> Permanently delete all data from Settings → Danger Zone</li>
                                <li><strong>Disconnect Gmail:</strong> Revoke Gmail access at any time from Settings</li>
                                <li><strong>Disable Public Profile:</strong> Toggle your profile to private at any time</li>
                                <li><strong>Account Deletion:</strong> Contact us to fully delete your account within 30 days</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 7 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>7</span>
                            <h2 className={styles.sectionTitle}>Data Retention</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                We retain your data for as long as your account is active. If you delete your data using the
                                Danger Zone feature, it is permanently removed. For full account deletion, contact us and
                                we will remove all data within 30 days.
                            </p>
                        </div>
                    </div>

                    {/* Section 8 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>8</span>
                            <h2 className={styles.sectionTitle}>Children&apos;s Privacy</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                The Service is not intended for children under 16 years of age. We do not knowingly collect
                                personal information from children under 16.
                            </p>
                        </div>
                    </div>

                    {/* Section 9 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>9</span>
                            <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify users of significant changes
                                via email or in-app notification. The &quot;Last updated&quot; date at the top reflects the most recent revision.
                            </p>
                        </div>
                    </div>

                    {/* Section 10 */}
                    <div className={styles.legalSection}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionNumber}>10</span>
                            <h2 className={styles.sectionTitle}>Contact Us</h2>
                        </div>
                        <div className={styles.sectionBody}>
                            <p>
                                For privacy-related questions or requests, contact us at{' '}
                                <a href="mailto:nallandhigalsumanth@gmail.com">nallandhigalsumanth@gmail.com</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className={styles.legalFooter}>
                © 2026 JobTracker. All rights reserved. | <Link href="/terms">Terms of Service</Link>
            </footer>
        </div>
    );
}

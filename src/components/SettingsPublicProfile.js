'use client';

import { useState, useEffect } from 'react';
import { Globe, Link2, Save, Check, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import styles from './SettingsPublicProfile.module.css';

export default function SettingsPublicProfile({ userId }) {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showFunnel, setShowFunnel] = useState(true);
    const [showSources, setShowSources] = useState(true);
    const [showStreak, setShowStreak] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profile');
                const data = await res.json();
                if (data.profile) {
                    setUsername(data.profile.username || '');
                    setDisplayName(data.profile.display_name || '');
                    setBio(data.profile.bio || '');
                    setTargetRole(data.profile.target_role || '');
                    setIsPublic(data.profile.is_public || false);
                    setShowHeatmap(data.profile.show_heatmap ?? true);
                    setShowFunnel(data.profile.show_funnel ?? true);
                    setShowSources(data.profile.show_sources ?? true);
                    setShowStreak(data.profile.show_streak ?? true);
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            } finally {
                setLoaded(true);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    display_name: displayName,
                    bio,
                    target_role: targetRole,
                    is_public: isPublic,
                    show_heatmap: showHeatmap,
                    show_funnel: showFunnel,
                    show_sources: showSources,
                    show_streak: showStreak,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to save');
                return;
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const profileUrl = username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/profile/${username}` : '';

    const handleCopy = () => {
        if (profileUrl) {
            navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!loaded) return null;

    return (
        <div className={styles.profileSection}>
            <h3 className={styles.sectionTitle}>
                <Globe size={18} /> Public Profile
            </h3>
            <div className={styles.cardBody}>
                {/* Public toggle */}
                <div className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>
                            {isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                            {isPublic ? 'Profile is Public' : 'Profile is Private'}
                        </span>
                        <span className={styles.toggleDesc}>
                            {isPublic ? 'Anyone with the link can see your aggregated stats' : 'Enable to share your job search progress'}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`${styles.toggle} ${isPublic ? styles.toggleOn : ''}`}
                    >
                        <div className={styles.toggleThumb} />
                    </button>
                </div>

                {/* Profile URL preview */}
                {isPublic && username && (
                    <div className={styles.urlPreview}>
                        <Link2 size={14} />
                        <span className={styles.urlText}>{profileUrl}</span>
                        <button onClick={handleCopy} className={styles.copyBtn} title="Copy link">
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <a href={`/profile/${username}`} target="_blank" rel="noopener noreferrer" className={styles.previewBtn} title="Preview">
                            <ExternalLink size={14} />
                        </a>
                    </div>
                )}

                {/* Fields */}
                <div className={styles.fields}>
                    <div className={styles.field}>
                        <label className={styles.label}>Username (URL slug)</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                            placeholder="your-username"
                            className={styles.input}
                            maxLength={30}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="John Doe"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Target Role</label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="Senior Frontend Engineer"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="A short bio about your job search journey..."
                            className={styles.textarea}
                            rows={3}
                            maxLength={200}
                        />
                    </div>
                </div>

                {/* Visibility toggles */}
                <div className={styles.visibilitySection}>
                    <span className={styles.visibilityTitle}>Visible on profile</span>
                    <div className={styles.checkboxList}>
                        <label className={styles.checkboxItem}>
                            <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />
                            <span>Activity Heatmap</span>
                        </label>
                        <label className={styles.checkboxItem}>
                            <input type="checkbox" checked={showFunnel} onChange={(e) => setShowFunnel(e.target.checked)} />
                            <span>Application Pipeline</span>
                        </label>
                        <label className={styles.checkboxItem}>
                            <input type="checkbox" checked={showSources} onChange={(e) => setShowSources(e.target.checked)} />
                            <span>Source Breakdown</span>
                        </label>
                        <label className={styles.checkboxItem}>
                            <input type="checkbox" checked={showStreak} onChange={(e) => setShowStreak(e.target.checked)} />
                            <span>Streak Badge</span>
                        </label>
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button onClick={handleSave} className={styles.saveBtn} disabled={saving || !username}>
                    {saved ? <><Check size={14} /> Saved!</> : saving ? 'Saving...' : <><Save size={14} /> Save Profile</>}
                </button>
            </div>
        </div>
    );
}

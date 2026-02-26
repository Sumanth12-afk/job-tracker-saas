'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, Link2, Save, Check, Eye, EyeOff, Copy, ExternalLink, Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './SettingsPublicProfile.module.css';

export default function SettingsPublicProfile({ userId }) {
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
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
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const token = session?.access_token;
                const res = await fetch('/api/profile', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                });
                const data = await res.json();
                if (data.profile) {
                    setUsername(data.profile.username || '');
                    setDisplayName(data.profile.display_name || '');
                    setBio(data.profile.bio || '');
                    setTargetRole(data.profile.target_role || '');
                    setAvatarUrl(data.profile.avatar_url || '');
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

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Image must be under 2MB');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const ext = file.name.split('.').pop();
            const fileName = `${userId}/avatar.${ext}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                setError('Failed to upload image');
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setAvatarUrl(publicUrl);
        } catch {
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) {
                setError('Not logged in');
                setSaving(false);
                return;
            }
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username,
                    display_name: displayName,
                    bio,
                    target_role: targetRole,
                    avatar_url: avatarUrl,
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

    const initials = displayName
        ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : username ? username[0].toUpperCase() : '?';

    if (!loaded) return null;

    return (
        <div className={styles.profileSection}>
            <h3 className={styles.sectionTitle}>
                <Globe size={18} /> Public Profile
            </h3>
            <div className={styles.cardBody}>
                {/* Avatar upload */}
                <div className={styles.avatarRow}>
                    <div className={styles.avatarWrap} onClick={() => fileInputRef.current?.click()}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className={styles.avatarImg} />
                        ) : (
                            <div className={styles.avatarFallback}>{initials}</div>
                        )}
                        <div className={styles.avatarOverlay}>
                            <Camera size={18} />
                        </div>
                        {uploading && <div className={styles.avatarSpinner} />}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                    />
                    <div className={styles.avatarHint}>
                        <span>Click to upload photo</span>
                        <span className={styles.avatarSize}>Max 2MB, JPG or PNG</span>
                    </div>
                </div>

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

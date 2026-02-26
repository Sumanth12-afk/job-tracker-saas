'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Clock, Save, Check } from 'lucide-react';
import styles from './SettingsProfile.module.css';

const TIMEZONES = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Anchorage', 'Pacific/Honolulu', 'Europe/London', 'Europe/Berlin',
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata',
    'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland',
];

export default function SettingsProfile({ userEmail }) {
    const [displayName, setDisplayName] = useState('');
    const [timezone, setTimezone] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('jt_profile');
        if (stored) {
            const data = JSON.parse(stored);
            setDisplayName(data.displayName || '');
            setTimezone(data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        } else {
            setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('jt_profile', JSON.stringify({ displayName, timezone }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const initials = displayName
        ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : (userEmail ? userEmail[0].toUpperCase() : 'U');

    return (
        <div className={styles.profileCard}>
            <h3 className={styles.sectionTitle}>
                <User size={18} /> Profile
            </h3>
            <div className={styles.cardBody}>
                <div className={styles.avatarRow}>
                    <div className={styles.avatar}>{initials}</div>
                    <div className={styles.userInfo}>
                        {displayName && <span className={styles.displayName}>{displayName}</span>}
                        <span className={styles.email}>{userEmail || 'user@email.com'}</span>
                    </div>
                </div>

                <div className={styles.fields}>
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <User size={14} /> Display Name
                        </label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your name"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <Clock size={14} /> Timezone
                        </label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className={styles.select}
                        >
                            {TIMEZONES.map(tz => (
                                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button onClick={handleSave} className={styles.saveBtn}>
                    {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Profile</>}
                </button>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { Target, MapPin, DollarSign, Briefcase, Save, Check, X } from 'lucide-react';
import styles from './SettingsTargetRole.module.css';

const WORK_TYPES = ['Remote', 'Hybrid', 'On-site', 'Any'];

export default function SettingsTargetRole() {
    const [targetRole, setTargetRole] = useState('');
    const [salaryMin, setSalaryMin] = useState('');
    const [salaryMax, setSalaryMax] = useState('');
    const [workType, setWorkType] = useState('Any');
    const [locations, setLocations] = useState([]);
    const [locationInput, setLocationInput] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('jt_target_role');
        if (stored) {
            const data = JSON.parse(stored);
            setTargetRole(data.targetRole || '');
            setSalaryMin(data.salaryMin || '');
            setSalaryMax(data.salaryMax || '');
            setWorkType(data.workType || 'Any');
            setLocations(data.locations || []);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('jt_target_role', JSON.stringify({
            targetRole, salaryMin, salaryMax, workType, locations,
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const addLocation = () => {
        const loc = locationInput.trim();
        if (loc && !locations.includes(loc)) {
            setLocations([...locations, loc]);
            setLocationInput('');
        }
    };

    const removeLocation = (loc) => {
        setLocations(locations.filter(l => l !== loc));
    };

    const handleLocationKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLocation();
        }
    };

    return (
        <div className={styles.targetCard}>
            <h3 className={styles.sectionTitle}>
                <Target size={18} /> Target Role
            </h3>
            <div className={styles.cardBody}>
                <p className={styles.description}>
                    Define what you're looking for to get smarter insights.
                </p>

                <div className={styles.fields}>
                    <div className={styles.field}>
                        <label className={styles.label}>
                            <Briefcase size={14} /> Target Role
                        </label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            <MapPin size={14} /> Work Type
                        </label>
                        <div className={styles.workTypeRow}>
                            {WORK_TYPES.map(wt => (
                                <button
                                    key={wt}
                                    onClick={() => setWorkType(wt)}
                                    className={`${styles.workTypeBtn} ${workType === wt ? styles.workTypeActive : ''}`}
                                >
                                    {wt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.salaryRow}>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                <DollarSign size={14} /> Min Salary
                            </label>
                            <input
                                type="number"
                                value={salaryMin}
                                onChange={(e) => setSalaryMin(e.target.value)}
                                placeholder="50000"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                <DollarSign size={14} /> Max Salary
                            </label>
                            <input
                                type="number"
                                value={salaryMax}
                                onChange={(e) => setSalaryMax(e.target.value)}
                                placeholder="120000"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            <MapPin size={14} /> Preferred Locations
                        </label>
                        <div className={styles.locationInputRow}>
                            <input
                                type="text"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                onKeyDown={handleLocationKeyDown}
                                placeholder="Type a city and press Enter"
                                className={styles.input}
                            />
                            <button onClick={addLocation} className={styles.addLocBtn}>Add</button>
                        </div>
                        {locations.length > 0 && (
                            <div className={styles.tags}>
                                {locations.map(loc => (
                                    <span key={loc} className={styles.tag}>
                                        {loc}
                                        <button onClick={() => removeLocation(loc)} className={styles.tagRemove}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={handleSave} className={styles.saveBtn}>
                    {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Target</>}
                </button>
            </div>
        </div>
    );
}

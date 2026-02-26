'use client';

import { useState, useEffect, useMemo } from 'react';
import { Zap, Save, Check, Flame, TrendingUp } from 'lucide-react';
import { subDays } from 'date-fns';
import styles from './SettingsGoals.module.css';

export default function SettingsGoals({ jobs }) {
    const [weeklyGoal, setWeeklyGoal] = useState(10);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('jt_goals');
        if (stored) {
            const data = JSON.parse(stored);
            setWeeklyGoal(data.weeklyGoal || 10);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('jt_goals', JSON.stringify({ weeklyGoal }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const stats = useMemo(() => {
        const now = new Date();
        const weekAgo = subDays(now, 7);
        const thisWeek = jobs.filter(j => j.date_applied && new Date(j.date_applied) >= weekAgo).length;
        const progress = weeklyGoal > 0 ? Math.min(100, Math.round((thisWeek / weeklyGoal) * 100)) : 0;

        // Calculate streak (consecutive weeks meeting goal)
        let streak = 0;
        for (let w = 0; w < 12; w++) {
            const wStart = subDays(now, (w + 1) * 7);
            const wEnd = subDays(now, w * 7);
            const count = jobs.filter(j => {
                if (!j.date_applied) return false;
                const d = new Date(j.date_applied);
                return d >= wStart && d < wEnd;
            }).length;
            if (count >= weeklyGoal) {
                streak++;
            } else {
                break;
            }
        }

        return { thisWeek, progress, streak };
    }, [jobs, weeklyGoal]);

    const circumference = 2 * Math.PI * 44;
    const strokeDash = (stats.progress / 100) * circumference;

    return (
        <div className={styles.goalsCard}>
            <h3 className={styles.sectionTitle}>
                <Zap size={18} /> Application Goals
            </h3>
            <div className={styles.cardBody}>
                <div className={styles.topRow}>
                    {/* Progress Ring */}
                    <div className={styles.progressRing}>
                        <svg viewBox="0 0 100 100" className={styles.svg}>
                            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="6" />
                            <circle
                                cx="50" cy="50" r="44"
                                fill="none"
                                stroke={stats.progress >= 100 ? '#22c55e' : 'var(--primary)'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${strokeDash} ${circumference}`}
                                transform="rotate(-90 50 50)"
                                style={{ transition: 'stroke-dasharray 0.6s ease' }}
                            />
                        </svg>
                        <div className={styles.ringCenter}>
                            <span className={styles.ringNum}>{stats.thisWeek}</span>
                            <span className={styles.ringMax}>/{weeklyGoal}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className={styles.statsCol}>
                        <div className={styles.statBlock}>
                            <TrendingUp size={16} />
                            <div>
                                <span className={styles.statValue}>{stats.progress}%</span>
                                <span className={styles.statLabel}>Weekly Progress</span>
                            </div>
                        </div>
                        <div className={styles.statBlock}>
                            <Flame size={16} />
                            <div>
                                <span className={styles.statValue}>
                                    {stats.streak} week{stats.streak !== 1 ? 's' : ''}
                                </span>
                                <span className={styles.statLabel}>
                                    {stats.streak > 0 ? 'Goal Streak 🔥' : 'No streak yet'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goal Setting */}
                <div className={styles.goalSetting}>
                    <label className={styles.goalLabel}>Weekly application target</label>
                    <div className={styles.goalInputRow}>
                        <input
                            type="range"
                            min="1"
                            max="30"
                            value={weeklyGoal}
                            onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
                            className={styles.slider}
                        />
                        <span className={styles.goalValue}>{weeklyGoal}/week</span>
                    </div>
                </div>

                <button onClick={handleSave} className={styles.saveBtn}>
                    {saved ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save Goal</>}
                </button>
            </div>
        </div>
    );
}

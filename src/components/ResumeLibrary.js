'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './ResumeLibrary.module.css';

export default function ResumeLibrary({ userId, onSelect, selectedVersion, mode = 'select' }) {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newResume, setNewResume] = useState({ name: '', description: '', is_default: false });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchResumes();
        }
    }, [userId]);

    const fetchResumes = async () => {
        try {
            const { data, error } = await supabase
                .from('resume_versions')
                .select('*')
                .eq('user_id', userId)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResumes(data || []);
        } catch (err) {
            console.error('Error fetching resumes:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newResume.name.trim()) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('resume_versions')
                .insert({
                    user_id: userId,
                    name: newResume.name.trim(),
                    description: newResume.description.trim() || null,
                    is_default: newResume.is_default,
                });

            if (error) throw error;

            setNewResume({ name: '', description: '', is_default: false });
            setShowAdd(false);
            fetchResumes();
        } catch (err) {
            console.error('Error adding resume:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this resume version?')) return;

        try {
            const { error } = await supabase
                .from('resume_versions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchResumes();
        } catch (err) {
            console.error('Error deleting resume:', err);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const { error } = await supabase
                .from('resume_versions')
                .update({ is_default: true })
                .eq('id', id);

            if (error) throw error;
            fetchResumes();
        } catch (err) {
            console.error('Error setting default:', err);
        }
    };

    // Select mode - for use in JobDetailDrawer
    if (mode === 'select') {
        return (
            <div className={styles.selectContainer}>
                <select
                    className="input"
                    value={selectedVersion || ''}
                    onChange={(e) => onSelect(e.target.value)}
                >
                    <option value="">Select resume version...</option>
                    {resumes.map((resume) => (
                        <option key={resume.id} value={resume.name}>
                            {resume.name} {resume.is_default ? '(default)' : ''}
                        </option>
                    ))}
                </select>
                {resumes.length === 0 && !loading && (
                    <p className={styles.hint}>
                        No saved resumes. Add them in Settings → Resume Library
                    </p>
                )}
            </div>
        );
    }

    // Manage mode - for use in Settings panel
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>📝 Resume Library</h3>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setShowAdd(!showAdd)}
                >
                    {showAdd ? 'Cancel' : '+ Add'}
                </button>
            </div>

            {showAdd && (
                <div className={styles.addForm}>
                    <div className="input-group">
                        <input
                            className="input"
                            placeholder="Resume name (e.g., v2-frontend)"
                            value={newResume.name}
                            onChange={(e) => setNewResume({ ...newResume, name: e.target.value })}
                        />
                    </div>
                    <div className="input-group">
                        <input
                            className="input"
                            placeholder="Description (optional)"
                            value={newResume.description}
                            onChange={(e) => setNewResume({ ...newResume, description: e.target.value })}
                        />
                    </div>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={newResume.is_default}
                            onChange={(e) => setNewResume({ ...newResume, is_default: e.target.checked })}
                        />
                        Set as default
                    </label>
                    <button
                        className="btn btn-primary"
                        onClick={handleAdd}
                        disabled={saving || !newResume.name.trim()}
                    >
                        {saving ? 'Saving...' : 'Add Resume'}
                    </button>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : resumes.length === 0 ? (
                <div className={styles.empty}>
                    <p>No resume versions saved yet.</p>
                    <p className={styles.hint}>Add different versions to track which one you sent to each company.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {resumes.map((resume) => (
                        <div key={resume.id} className={styles.item}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>
                                    {resume.name}
                                    {resume.is_default && (
                                        <span className={styles.defaultBadge}>Default</span>
                                    )}
                                </span>
                                {resume.description && (
                                    <span className={styles.itemDesc}>{resume.description}</span>
                                )}
                            </div>
                            <div className={styles.itemActions}>
                                {!resume.is_default && (
                                    <button
                                        className={styles.actionBtn}
                                        onClick={() => handleSetDefault(resume.id)}
                                        title="Set as default"
                                    >
                                        ⭐
                                    </button>
                                )}
                                <button
                                    className={styles.actionBtn}
                                    onClick={() => handleDelete(resume.id)}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import styles from './OnboardingTour.module.css';

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to JobTracker! 🎉',
        description: 'Let us show you around. This quick tour will help you get started with tracking your job applications.',
        target: null, // No specific target - centered modal
        position: 'center'
    },
    {
        id: 'add-job',
        title: 'Add Your First Job ➕',
        description: 'Click this button to manually add a job application. Enter the company name, job title, application date and more!',
        target: '[data-tour="add-job"]',
        position: 'left'
    },
    {
        id: 'gmail',
        title: 'Connect Gmail ✉️',
        description: 'Click Settings (⚙️) to find the Gmail integration option. Connect your Gmail to automatically import job applications from confirmation emails!',
        target: '[data-tour="settings"]',
        position: 'left'
    },
    {
        id: 'kanban',
        title: 'Drag & Drop Cards 📋',
        description: 'Drag job cards between columns to update their status. Move from "Applied" → "Interview" → "Offer" as you progress in the hiring process!',
        target: '[data-tour="kanban-board"]',
        position: 'top'
    },
    {
        id: 'needs-attention',
        title: 'Needs Attention ⚠️',
        description: 'The rightmost column shows jobs that need your attention - stale applications, ghosted jobs, and priority items. Use the "Move to Rejected" button for ghosted applications.',
        target: null,
        position: 'center'
    },
    {
        id: 'done',
        title: 'You\'re All Set! 🚀',
        description: 'Start adding jobs and take control of your job search. Pro tip: Add #priority in job notes to mark important applications!',
        target: null,
        position: 'center'
    }
];

export default function OnboardingTour({ userId, onComplete }) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState({});

    useEffect(() => {
        // Check if user has seen the tour
        const tourCompleted = localStorage.getItem(`tour_completed_${userId}`);
        if (!tourCompleted && userId) {
            // Small delay to let the page render
            setTimeout(() => setIsVisible(true), 500);
        }
    }, [userId]);

    useEffect(() => {
        if (!isVisible) return;

        const step = TOUR_STEPS[currentStep];

        if (step.position === 'center' || !step.target) {
            setTooltipStyle({});
            return;
        }

        // Find the target element
        const targetEl = document.querySelector(step.target);
        if (!targetEl) {
            setTooltipStyle({});
            return;
        }

        // Get target position
        const rect = targetEl.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        // Add highlight to target
        targetEl.classList.add(styles.highlighted);

        // Calculate tooltip position
        let style = {};
        const tooltipWidth = 320;
        const tooltipHeight = 180;
        const padding = 16;

        switch (step.position) {
            case 'bottom':
                style = {
                    top: `${rect.bottom + scrollTop + padding}px`,
                    left: `${Math.max(padding, rect.left + scrollLeft + rect.width / 2 - tooltipWidth / 2)}px`
                };
                break;
            case 'top':
                style = {
                    top: `${rect.top + scrollTop - tooltipHeight - padding}px`,
                    left: `${Math.max(padding, rect.left + scrollLeft + rect.width / 2 - tooltipWidth / 2)}px`
                };
                break;
            case 'left':
                style = {
                    top: `${rect.top + scrollTop + rect.height / 2 - tooltipHeight / 2}px`,
                    left: `${rect.left + scrollLeft - tooltipWidth - padding}px`
                };
                break;
            case 'right':
                style = {
                    top: `${rect.top + scrollTop + rect.height / 2 - tooltipHeight / 2}px`,
                    left: `${rect.right + scrollLeft + padding}px`
                };
                break;
            default:
                style = {};
        }

        setTooltipStyle(style);

        // Scroll target into view
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Cleanup: remove highlight when step changes
        return () => {
            targetEl.classList.remove(styles.highlighted);
        };
    }, [currentStep, isVisible]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeTour();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        completeTour();
    };

    const completeTour = () => {
        localStorage.setItem(`tour_completed_${userId}`, 'true');
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];
    const isCenter = step.position === 'center';
    const isFirst = currentStep === 0;
    const isLast = currentStep === TOUR_STEPS.length - 1;

    return (
        <>
            {/* Overlay */}
            <div className={styles.overlay} onClick={handleSkip} />

            {/* Tooltip */}
            <div
                className={`${styles.tooltip} ${isCenter ? styles.centered : ''}`}
                style={isCenter ? {} : tooltipStyle}
            >
                {/* Progress indicator */}
                <div className={styles.progress}>
                    {TOUR_STEPS.map((_, idx) => (
                        <span
                            key={idx}
                            className={`${styles.dot} ${idx === currentStep ? styles.active : ''} ${idx < currentStep ? styles.completed : ''}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className={styles.content}>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                    {!isFirst && !isLast && (
                        <button className={styles.secondaryBtn} onClick={handlePrev}>
                            Back
                        </button>
                    )}

                    {!isLast && (
                        <button className={styles.skipBtn} onClick={handleSkip}>
                            Skip Tour
                        </button>
                    )}

                    <button className={styles.primaryBtn} onClick={handleNext}>
                        {isFirst ? "Let's Go!" : isLast ? 'Get Started' : 'Next'}
                    </button>
                </div>

                {/* Arrow pointer for non-centered tooltips */}
                {!isCenter && <div className={`${styles.arrow} ${styles[step.position]}`} />}
            </div>
        </>
    );
}

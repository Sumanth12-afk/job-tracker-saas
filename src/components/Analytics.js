'use client';

import { useMemo, useState } from 'react';
import { differenceInDays, subDays } from 'date-fns';
import styles from './Analytics.module.css';
import {
    TrendingUp,
    TrendingDown,
    Award,
    Target,
    Clock,
    Zap,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
} from 'lucide-react';

export default function Analytics({ jobs }) {
    const [dateRange, setDateRange] = useState('30');
    const now = new Date();

    const stats = useMemo(() => {
        // Filter jobs by selected date range
        let filteredJobs;
        const rangeDays = dateRange === 'all' ? null : parseInt(dateRange, 10);
        if (rangeDays) {
            const cutoff = subDays(now, rangeDays);
            filteredJobs = jobs.filter(j => j.date_applied && new Date(j.date_applied) >= cutoff);
        } else {
            filteredJobs = jobs;
        }

        const total = filteredJobs.length;
        const applied = filteredJobs.filter(j => j.status === 'Applied').length;
        const interviews = filteredJobs.filter(j => j.status === 'Interview').length;
        const offers = filteredJobs.filter(j => j.status === 'Offer').length;
        const rejected = filteredJobs.filter(j => j.status === 'Rejected').length;
        const responded = interviews + offers + rejected;

        // Rates
        const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
        const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0;
        const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

        // Avg response time
        const responseTimes = filteredJobs
            .filter(j => j.status !== 'Applied' && j.date_applied && j.updated_at)
            .map(j => {
                const d1 = new Date(j.date_applied);
                const d2 = new Date(j.updated_at);
                return Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
            })
            .filter(d => d > 0 && d < 90);
        const avgResponseDays = responseTimes.length > 0
            ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
            : 0;

        // Previous period stats for deltas (compare same-length window before)
        let prevJobs;
        if (rangeDays) {
            const prevStart = subDays(now, rangeDays * 2);
            const prevEnd = subDays(now, rangeDays);
            prevJobs = jobs.filter(j => {
                if (!j.date_applied) return false;
                const d = new Date(j.date_applied);
                return d >= prevStart && d < prevEnd;
            });
        } else {
            // "All time" - compare first half vs second half
            const sorted = [...jobs].filter(j => j.date_applied).sort((a, b) => new Date(a.date_applied) - new Date(b.date_applied));
            const mid = Math.floor(sorted.length / 2);
            prevJobs = sorted.slice(0, mid);
        }
        const prevTotal = prevJobs.length;
        const prevResponded = prevJobs.filter(j => ['Interview', 'Offer', 'Rejected'].includes(j.status)).length;
        const prevResponseRate = prevTotal > 0 ? Math.round((prevResponded / prevTotal) * 100) : 0;
        const prevInterviews = prevJobs.filter(j => j.status === 'Interview').length;
        const prevInterviewRate = prevTotal > 0 ? Math.round((prevInterviews / prevTotal) * 100) : 0;

        const responseRateDelta = responseRate - prevResponseRate;
        const interviewRateDelta = interviewRate - prevInterviewRate;

        // Previous period avg response time
        const prevResponseTimes = prevJobs
            .filter(j => j.status !== 'Applied' && j.date_applied && j.updated_at)
            .map(j => Math.max(0, Math.floor((new Date(j.updated_at) - new Date(j.date_applied)) / (1000 * 60 * 60 * 24))))
            .filter(d => d > 0 && d < 90);
        const prevAvgResponse = prevResponseTimes.length > 0
            ? (prevResponseTimes.reduce((a, b) => a + b, 0) / prevResponseTimes.length).toFixed(1)
            : 0;
        const responseTimeDelta = prevAvgResponse > 0 ? (parseFloat(avgResponseDays) - parseFloat(prevAvgResponse)).toFixed(1) : 0;

        // Job Search Score (gamification)
        let score = 50; // base
        if (total >= 5) score += 10;
        if (total >= 15) score += 10;
        if (responseRate >= 30) score += 10;
        if (interviewRate >= 15) score += 10;
        if (offers >= 1) score += 10;
        // Weekly activity bonus
        const weekAgo = subDays(now, 7);
        const thisWeekApps = filteredJobs.filter(j => new Date(j.date_applied) >= weekAgo).length;
        if (thisWeekApps >= 3) score += 5;
        if (thisWeekApps >= 7) score += 5;
        score = Math.min(score, 100);

        // Weekly response rate trend (last 6 weeks)
        const weeklyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const weekStart = subDays(now, (i + 1) * 7);
            const weekEnd = subDays(now, i * 7);
            const weekJobs = filteredJobs.filter(j => {
                const d = new Date(j.date_applied);
                return d >= weekStart && d < weekEnd;
            });
            const weekResponded = weekJobs.filter(j => ['Interview', 'Offer', 'Rejected'].includes(j.status)).length;
            const weekRate = weekJobs.length > 0 ? Math.round((weekResponded / weekJobs.length) * 100) : 0;
            weeklyTrend.push({
                label: `Week ${6 - i}`,
                rate: weekRate,
                count: weekJobs.length,
            });
        }

        // Application sources
        const sourceCounts = {};
        filteredJobs.forEach(j => {
            const source = j.source || 'Direct';
            const normalized = source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
            sourceCounts[normalized] = (sourceCounts[normalized] || 0) + 1;
        });
        const sourceEntries = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
        const sources = sourceEntries.map(([name, count]) => ({
            name,
            count,
            percent: total > 0 ? Math.round((count / total) * 100) : 0,
        }));

        // Per-company response times
        const companyResponseMap = {};
        filteredJobs.filter(j => j.status !== 'Applied' && j.date_applied && j.updated_at)
            .forEach(j => {
                const company = j.company_name || 'Unknown';
                const days = Math.max(0, differenceInDays(new Date(j.updated_at), new Date(j.date_applied)));
                if (days > 0 && days < 90) {
                    if (!companyResponseMap[company]) companyResponseMap[company] = [];
                    companyResponseMap[company].push(days);
                }
            });
        const companyResponseTimes = Object.entries(companyResponseMap)
            .map(([company, times]) => ({
                company,
                avgDays: parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)),
            }))
            .sort((a, b) => a.avgDays - b.avgDays)
            .slice(0, 6);
        const fastestResponder = companyResponseTimes.length > 0 ? companyResponseTimes[0] : null;

        // Source with best response rate
        let bestSourceInsight = null;
        if (sourceEntries.length > 1) {
            const sourceResponseRates = sourceEntries.map(([source]) => {
                const sJobs = filteredJobs.filter(j => (j.source || 'Direct') === source.toLowerCase() || (j.source || 'Direct') === source);
                const sResponded = sJobs.filter(j => ['Interview', 'Offer', 'Rejected'].includes(j.status)).length;
                return { source, rate: sJobs.length > 0 ? Math.round((sResponded / sJobs.length) * 100) : 0 };
            }).sort((a, b) => b.rate - a.rate);
            if (sourceResponseRates.length > 0 && sourceResponseRates[0].rate > 0) {
                bestSourceInsight = sourceResponseRates[0];
            }
        }

        // Best day to apply
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayStats = [0, 0, 0, 0, 0, 0, 0];
        filteredJobs.filter(j => ['Interview', 'Offer'].includes(j.status)).forEach(j => {
            if (j.date_applied) {
                dayStats[new Date(j.date_applied).getDay()]++;
            }
        });
        const bestDayIndex = dayStats.indexOf(Math.max(...dayStats));
        const bestDay = dayStats[bestDayIndex] > 0 ? dayNames[bestDayIndex] : null;

        // Momentum
        const twoWeeksAgo = subDays(now, 14);
        const weekAgoDate = subDays(now, 7);
        const thisWeek = filteredJobs.filter(j => new Date(j.date_applied) >= weekAgoDate).length;
        const lastWeek = filteredJobs.filter(j => {
            const d = new Date(j.date_applied);
            return d >= twoWeeksAgo && d < weekAgoDate;
        }).length;
        const momentum = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;

        return {
            total, applied, interviews, offers, rejected, responded,
            responseRate, interviewRate, offerRate,
            avgResponseDays, responseTimeDelta,
            responseRateDelta, interviewRateDelta,
            score, weeklyTrend, sources,
            companyResponseTimes, fastestResponder,
            bestSourceInsight, bestDay, momentum, thisWeekApps,
        };
    }, [jobs, now, dateRange]);

    // Donut chart colors
    const SOURCE_COLORS = ['#818cf8', '#14b8a6', '#60a5fa', '#a78bfa', '#9ca3af', '#fbbf24'];

    // Build SVG donut
    const donutSegments = useMemo(() => {
        const segments = [];
        let cumulative = 0;
        stats.sources.forEach((src, i) => {
            const pct = src.percent;
            segments.push({
                offset: cumulative,
                pct,
                color: SOURCE_COLORS[i % SOURCE_COLORS.length],
                name: src.name,
            });
            cumulative += pct;
        });
        return segments;
    }, [stats.sources]);

    // Line chart max
    const trendMax = Math.max(...stats.weeklyTrend.map(w => w.rate), 10);

    // Bar chart max for company response times
    const companyBarMax = Math.max(...stats.companyResponseTimes.map(c => c.avgDays), 1);

    const getDeltaIcon = (val) => {
        if (val > 0) return <ArrowUpRight size={14} />;
        if (val < 0) return <ArrowDownRight size={14} />;
        return <Minus size={14} />;
    };

    return (
        <div className={styles.container}>
            {/* Date Range Filter */}
            <div className={styles.dateFilter}>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className={styles.dateSelect}
                >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="all">All time</option>
                </select>
            </div>

            {/* ---- JOB SEARCH SCORE ---- */}
            <div className={styles.scoreSection}>
                <div className={styles.scoreCard}>
                    <div className={styles.scoreRing}>
                        <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
                            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
                            <circle
                                cx="60" cy="60" r="52"
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(stats.score / 100) * 327} 327`}
                                transform="rotate(-90 60 60)"
                                className={styles.scoreProgress}
                            />
                        </svg>
                        <div className={styles.scoreValue}>
                            <span className={styles.scoreNum}>{stats.score}</span>
                            <span className={styles.scoreMax}>/100</span>
                        </div>
                    </div>
                    <div className={styles.scoreInfo}>
                        <h3 className={styles.scoreTitle}>Weekly Job Search Score</h3>
                        <p className={styles.scoreDesc}>
                            {stats.score >= 80
                                ? `Great work! You're ${stats.score - 50 > 0 ? stats.score - 50 : 0}% above average.`
                                : stats.score >= 60
                                    ? "Good progress! Keep up the momentum."
                                    : "Apply to more jobs to boost your score!"}
                        </p>
                        {stats.score >= 75 && (
                            <span className={styles.scoreBadge}>
                                <Award size={14} /> Top {100 - stats.score + 10}%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ---- STAT CARDS ---- */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Target size={16} className={styles.statIconEl} />
                        <span className={styles.statLabel}>Response Rate</span>
                    </div>
                    <span className={styles.statValue}>{stats.responseRate}%</span>
                    <span className={`${styles.statDelta} ${stats.responseRateDelta >= 0 ? styles.positive : styles.negative}`}>
                        {getDeltaIcon(stats.responseRateDelta)}
                        {stats.responseRateDelta >= 0 ? '+' : ''}{stats.responseRateDelta}% from last month
                    </span>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <BarChart3 size={16} className={styles.statIconEl} />
                        <span className={styles.statLabel}>Interview Rate</span>
                    </div>
                    <span className={styles.statValue}>{stats.interviewRate}%</span>
                    <span className={`${styles.statDelta} ${stats.interviewRateDelta >= 0 ? styles.positive : styles.negative}`}>
                        {getDeltaIcon(stats.interviewRateDelta)}
                        {stats.interviewRateDelta >= 0 ? '+' : ''}{stats.interviewRateDelta}% vs last month
                    </span>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Clock size={16} className={styles.statIconEl} />
                        <span className={styles.statLabel}>Avg. Response Time</span>
                    </div>
                    <span className={styles.statValue}>{stats.avgResponseDays} <small>days</small></span>
                    <span className={`${styles.statDelta} ${parseFloat(stats.responseTimeDelta) <= 0 ? styles.positive : styles.negative}`}>
                        {getDeltaIcon(-parseFloat(stats.responseTimeDelta))}
                        {parseFloat(stats.responseTimeDelta) <= 0 ? '' : '+'}{stats.responseTimeDelta} day improvement
                    </span>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <Zap size={16} className={styles.statIconEl} />
                        <span className={styles.statLabel}>Offer Rate</span>
                    </div>
                    <span className={styles.statValue}>{stats.offerRate}%</span>
                    <span className={styles.statDeltaMuted}>
                        {stats.offers} out of {stats.total} apps
                    </span>
                </div>
            </div>

            {/* ---- TWO-COLUMN: FUNNEL + RESPONSE RATE TREND ---- */}
            <div className={styles.twoCol}>
                {/* Application Funnel */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Application Funnel</h3>
                    <div className={styles.funnel}>
                        {[
                            { label: 'Applied', count: stats.total, color: '#818cf8' },
                            { label: 'Response', count: stats.responded, color: '#60a5fa' },
                            { label: 'Interview', count: stats.interviews, color: '#14b8a6' },
                            { label: 'Offer', count: stats.offers, color: '#22c55e' },
                        ].map((step, i) => (
                            <div key={i} className={styles.funnelStep}>
                                <span className={styles.funnelLabel}>{step.label}</span>
                                <div className={styles.funnelTrack}>
                                    <div
                                        className={styles.funnelBar}
                                        style={{
                                            width: `${stats.total > 0 ? Math.max((step.count / stats.total) * 100, step.count > 0 ? 8 : 0) : 0}%`,
                                            background: step.color,
                                        }}
                                    />
                                </div>
                                <span className={styles.funnelCount}>{step.count}</span>
                            </div>
                        ))}
                    </div>
                    {/* Percentage stats row */}
                    <div className={styles.funnelPercents}>
                        <div className={styles.funnelPct}><strong>100%</strong><span>Applied</span></div>
                        <div className={styles.funnelPct}><strong>{stats.responseRate}%</strong><span>Response</span></div>
                        <div className={styles.funnelPct}><strong>{stats.interviewRate}%</strong><span>Interview</span></div>
                        <div className={styles.funnelPct}><strong>{stats.offerRate}%</strong><span>Offer</span></div>
                    </div>
                </div>

                {/* Response Rate Trend (Line Chart) */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Response Rate Trend</h3>
                    <div className={styles.lineChart}>
                        <svg viewBox={`0 0 280 140`} className={styles.lineSvg}>
                            {/* Grid lines */}
                            {[0, 25, 50, 75, 100].map(v => {
                                const y = 120 - (v / trendMax) * 100;
                                return (
                                    <g key={v}>
                                        <line x1="30" y1={y} x2="270" y2={y} stroke="var(--border)" strokeWidth="0.5" />
                                        <text x="24" y={y + 4} fill="var(--muted)" fontSize="9" textAnchor="end">{v}</text>
                                    </g>
                                );
                            })}
                            {/* Line path */}
                            <polyline
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                points={stats.weeklyTrend.map((w, i) => {
                                    const x = 30 + (i * 48);
                                    const y = 120 - (w.rate / trendMax) * 100;
                                    return `${x},${y}`;
                                }).join(' ')}
                            />
                            {/* Data points */}
                            {stats.weeklyTrend.map((w, i) => {
                                const x = 30 + (i * 48);
                                const y = 120 - (w.rate / trendMax) * 100;
                                return (
                                    <g key={i}>
                                        <circle cx={x} cy={y} r="4" fill="var(--primary)" />
                                        <circle cx={x} cy={y} r="2" fill="var(--surface)" />
                                        <text x={x} y="135" fill="var(--muted)" fontSize="8" textAnchor="middle">
                                            {w.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </div>

            {/* ---- TWO-COLUMN: SOURCES DONUT + AVG TIME TO REPLY ---- */}
            <div className={styles.twoCol}>
                {/* Application Sources - Donut Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Application Sources</h3>
                    <div className={styles.donutRow}>
                        <div className={styles.donutWrap}>
                            <svg viewBox="0 0 120 120" className={styles.donutSvg}>
                                {donutSegments.map((seg, i) => {
                                    const circumference = 2 * Math.PI * 45;
                                    const dashLength = (seg.pct / 100) * circumference;
                                    const dashOffset = -((seg.offset / 100) * circumference);
                                    return (
                                        <circle
                                            key={i}
                                            cx="60" cy="60" r="45"
                                            fill="none"
                                            stroke={seg.color}
                                            strokeWidth="14"
                                            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                                            strokeDashoffset={dashOffset}
                                            transform="rotate(-90 60 60)"
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                        <div className={styles.donutLegend}>
                            {stats.sources.map((src, i) => (
                                <div key={i} className={styles.legendItem}>
                                    <span className={styles.legendDot} style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                                    <span className={styles.legendName}>{src.name}</span>
                                    <span className={styles.legendPct}>{src.percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {stats.bestSourceInsight && (
                        <div className={styles.insightBox}>
                            <Zap size={14} />
                            <span><strong>Insight:</strong> {stats.bestSourceInsight.source} applications have a {stats.bestSourceInsight.rate}% response rate</span>
                        </div>
                    )}
                </div>

                {/* Average Time to Reply - Bar Chart */}
                <div className={styles.chartCard}>
                    <h3 className={styles.chartTitle}>Average Time to Reply</h3>
                    {stats.companyResponseTimes.length > 0 ? (
                        <>
                            <div className={styles.companyBars}>
                                {stats.companyResponseTimes.map((c, i) => (
                                    <div key={i} className={styles.companyBarRow}>
                                        <span className={styles.companyBarLabel}>{c.company}</span>
                                        <div className={styles.companyBarTrack}>
                                            <div
                                                className={styles.companyBarFill}
                                                style={{
                                                    width: `${(c.avgDays / companyBarMax) * 100}%`,
                                                    background: SOURCE_COLORS[i % SOURCE_COLORS.length],
                                                }}
                                            />
                                        </div>
                                        <span className={styles.companyBarVal}>{c.avgDays}d</span>
                                    </div>
                                ))}
                            </div>
                            {stats.fastestResponder && (
                                <div className={styles.insightBox}>
                                    <Zap size={14} />
                                    <span><strong>Fastest responder:</strong> {stats.fastestResponder.company} ({stats.fastestResponder.avgDays} days average)</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className={styles.emptyText}>No response data to show yet.</p>
                    )}
                </div>
            </div>

            {/* ---- KEY INSIGHTS ---- */}
            <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Key Insights</h3>
                <div className={styles.insightsList}>
                    {stats.responseRateDelta !== 0 && (
                        <div className={styles.insightItem}>
                            {stats.responseRateDelta > 0 ? <TrendingUp size={18} className={styles.insightUp} /> : <TrendingDown size={18} className={styles.insightDown} />}
                            <span>Your response rate has {stats.responseRateDelta > 0 ? 'improved' : 'decreased'} by {Math.abs(stats.responseRateDelta)}% in the last month</span>
                        </div>
                    )}
                    {stats.momentum !== 0 && (
                        <div className={styles.insightItem}>
                            {stats.momentum > 0 ? <TrendingUp size={18} className={styles.insightUp} /> : <TrendingDown size={18} className={styles.insightDown} />}
                            <span>Application momentum is {stats.momentum > 0 ? 'up' : 'down'} {Math.abs(stats.momentum)}% from last week ({stats.thisWeekApps} apps this week)</span>
                        </div>
                    )}
                    {stats.bestDay && (
                        <div className={styles.insightItem}>
                            <Target size={18} className={styles.insightNeutral} />
                            <span>Applications submitted on <strong>{stats.bestDay}</strong> have the highest success rate</span>
                        </div>
                    )}
                    {stats.interviewRate >= 20 && (
                        <div className={styles.insightItem}>
                            <Award size={18} className={styles.insightUp} />
                            <span>Your interview rate ({stats.interviewRate}%) is above the industry average of 20%</span>
                        </div>
                    )}
                    {stats.total > 0 && stats.total < 10 && (
                        <div className={styles.insightItem}>
                            <Zap size={18} className={styles.insightNeutral} />
                            <span>Apply to more positions to get more reliable analytics data</span>
                        </div>
                    )}
                    {stats.offers > 0 && (
                        <div className={styles.insightItem}>
                            <Award size={18} className={styles.insightUp} />
                            <span>Congratulations! You have {stats.offers} offer{stats.offers > 1 ? 's' : ''} 🎉</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

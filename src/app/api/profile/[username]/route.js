import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// GET: Fetch public profile + aggregated stats for a username
export async function GET(request, { params }) {
    try {
        const { username } = await params;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch profile
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('username', username)
            .eq('is_public', true)
            .single();

        if (error || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // 2. Fetch aggregated job stats (no sensitive data)
        const { data: jobs } = await supabase
            .from('job_applications')
            .select('status, date_applied, source, created_at')
            .eq('user_id', profile.user_id)
            .order('date_applied', { ascending: true });

        const allJobs = jobs || [];

        // Aggregate: status counts
        const statusCounts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
        allJobs.forEach(j => { statusCounts[j.status] = (statusCounts[j.status] || 0) + 1; });

        // Aggregate: source counts
        const sourceCounts = {};
        allJobs.forEach(j => {
            const src = j.source || 'manual';
            sourceCounts[src] = (sourceCounts[src] || 0) + 1;
        });

        // Aggregate: daily activity (for heatmap) - last 365 days
        const dailyActivity = {};
        allJobs.forEach(j => {
            if (j.date_applied) {
                const day = j.date_applied; // Already a date string
                dailyActivity[day] = (dailyActivity[day] || 0) + 1;
            }
        });

        // Aggregate: weekly application counts for streak
        const now = new Date();
        let streak = 0;
        for (let w = 0; w < 52; w++) {
            const wEnd = new Date(now);
            wEnd.setDate(wEnd.getDate() - (w * 7));
            const wStart = new Date(wEnd);
            wStart.setDate(wStart.getDate() - 7);
            const count = allJobs.filter(j => {
                if (!j.date_applied) return false;
                const d = new Date(j.date_applied);
                return d >= wStart && d < wEnd;
            }).length;
            if (count > 0) streak++;
            else break;
        }

        // Member since
        const memberSince = allJobs.length > 0
            ? allJobs[0].date_applied
            : profile.created_at;

        // Monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let m = 5; m >= 0; m--) {
            const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const count = allJobs.filter(j => {
                if (!j.date_applied) return false;
                const jd = new Date(j.date_applied);
                return jd >= d && jd <= monthEnd;
            }).length;
            monthlyTrend.push({
                month: d.toLocaleString('en-US', { month: 'short' }),
                count,
            });
        }

        return NextResponse.json({
            profile: {
                username: profile.username,
                display_name: profile.display_name,
                bio: profile.bio,
                target_role: profile.target_role,
                show_heatmap: profile.show_heatmap,
                show_funnel: profile.show_funnel,
                show_sources: profile.show_sources,
                show_streak: profile.show_streak,
                created_at: profile.created_at,
            },
            stats: {
                total: allJobs.length,
                statusCounts,
                sourceCounts,
                dailyActivity,
                streak,
                memberSince,
                monthlyTrend,
            }
        });
    } catch (err) {
        console.error('Public profile error:', err);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

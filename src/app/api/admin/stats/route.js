import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Admin emails (hardcoded for security)
const ADMIN_EMAILS = [
    'krushi.krishh@gmail.com',
    'nallandhigalsumanth@gmail.com'
];

// Check if request is from admin (via header set by client)
function isAdminRequest(request) {
    const adminEmail = request.headers.get('x-admin-email');
    return adminEmail && ADMIN_EMAILS.includes(adminEmail);
}

export async function GET(request) {
    // Check admin access via header
    if (!isAdminRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const now = new Date();

        // Get date ranges
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

        // Get unique users
        const { data: uniqueUsers } = await supabase
            .from('job_applications')
            .select('user_id')
            .limit(10000);

        const uniqueUserIds = [...new Set(uniqueUsers?.map(u => u.user_id) || [])];

        // Total Job Applications
        const { count: totalJobs } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true });

        // Gmail-sourced jobs
        const { count: gmailJobs } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('source', 'gmail');

        // Jobs by status
        const { data: statusData } = await supabase
            .from('job_applications')
            .select('status');

        const statusCounts = {};
        (statusData || []).forEach(job => {
            statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
        });

        // Recent activity (last 30 days)
        const { data: recentJobs } = await supabase
            .from('job_applications')
            .select('user_id, created_at')
            .gte('created_at', thirtyDaysAgo)
            .order('created_at', { ascending: true });

        // Group by day for chart
        const dailyActivity = {};
        (recentJobs || []).forEach(job => {
            const day = job.created_at.split('T')[0];
            if (!dailyActivity[day]) {
                dailyActivity[day] = { jobs: 0, users: new Set() };
            }
            dailyActivity[day].jobs++;
            dailyActivity[day].users.add(job.user_id);
        });

        const activityChart = Object.entries(dailyActivity).map(([date, data]) => ({
            date,
            jobs: data.jobs,
            activeUsers: data.users.size
        }));

        // Gmail tokens status
        const { data: tokenData } = await supabase
            .from('gmail_tokens')
            .select('user_id, expires_at');

        const validTokens = (tokenData || []).filter(t => new Date(t.expires_at) > now).length;
        const expiredTokens = (tokenData || []).length - validTokens;

        // Get scan logs if table exists
        let scanStats = { total: 0, avgFound: 0, mlClassified: 0, ruleClassified: 0 };
        try {
            const { data: scanLogs, count: scanCount } = await supabase
                .from('scan_logs')
                .select('*', { count: 'exact' })
                .limit(100);

            if (scanLogs && scanLogs.length > 0) {
                const totalFound = scanLogs.reduce((sum, log) => sum + (log.found_count || 0), 0);
                const totalMl = scanLogs.reduce((sum, log) => sum + (log.ml_classified || 0), 0);
                const totalRules = scanLogs.reduce((sum, log) => sum + (log.rule_classified || 0), 0);

                scanStats = {
                    total: scanCount || scanLogs.length,
                    avgFound: (totalFound / scanLogs.length).toFixed(1),
                    mlClassified: totalMl,
                    ruleClassified: totalRules
                };
            }
        } catch (e) {
            // Table might not exist yet
        }

        return NextResponse.json({
            overview: {
                totalUsers: uniqueUserIds.length,
                totalJobs: totalJobs || 0,
                gmailJobs: gmailJobs || 0,
                manualJobs: (totalJobs || 0) - (gmailJobs || 0),
            },
            statusBreakdown: statusCounts,
            gmailTokens: {
                total: tokenData?.length || 0,
                valid: validTokens,
                expired: expiredTokens
            },
            activityChart,
            scanStats,
            timestamp: now.toISOString()
        });
    } catch (err) {
        console.error('Admin stats error:', err);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

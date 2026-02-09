import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAILS = [
    'krushi.krishh@gmail.com',
    'nallandhigalsumanth@gmail.com'
];

async function isAdmin(cookieStore) {
    try {
        const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
        const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);
        if (!authCookie) return false;

        let authData;
        try {
            const cookieValue = decodeURIComponent(authCookie.value);
            authData = JSON.parse(cookieValue);
        } catch (e) {
            authData = JSON.parse(authCookie.value);
        }

        const userEmail = authData?.user?.email || authData?.email;
        return ADMIN_EMAILS.includes(userEmail);
    } catch (e) {
        return false;
    }
}

// GET user details
export async function GET(request, { params }) {
    const cookieStore = await cookies();
    if (!await isAdmin(cookieStore)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get user's jobs
        const { data: jobs, count: jobCount } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact' })
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .limit(100);

        // Get Gmail token status
        const { data: gmailToken } = await supabase
            .from('gmail_tokens')
            .select('*')
            .eq('user_id', id)
            .single();

        // Calculate stats
        const statusCounts = {};
        const sourceCounts = { gmail: 0, manual: 0 };

        (jobs || []).forEach(job => {
            statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
            if (job.source === 'gmail') sourceCounts.gmail++;
            else sourceCounts.manual++;
        });

        return NextResponse.json({
            user_id: id,
            stats: {
                totalJobs: jobCount || 0,
                statusBreakdown: statusCounts,
                sourceBreakdown: sourceCounts,
                firstActivity: jobs?.length > 0 ? jobs[jobs.length - 1].created_at : null,
                lastActivity: jobs?.length > 0 ? jobs[0].created_at : null
            },
            gmail: gmailToken ? {
                connected: true,
                expired: new Date(gmailToken.expires_at) < new Date(),
                expiresAt: gmailToken.expires_at
            } : { connected: false },
            recentJobs: (jobs || []).slice(0, 10)
        });
    } catch (err) {
        console.error('User details error:', err);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

// DELETE user data (for GDPR compliance)
export async function DELETE(request, { params }) {
    const cookieStore = await cookies();
    if (!await isAdmin(cookieStore)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Delete user's jobs
        const { error: jobsError } = await supabase
            .from('job_applications')
            .delete()
            .eq('user_id', id);

        if (jobsError) throw jobsError;

        // Delete Gmail token
        await supabase
            .from('gmail_tokens')
            .delete()
            .eq('user_id', id);

        return NextResponse.json({ success: true, message: 'User data deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

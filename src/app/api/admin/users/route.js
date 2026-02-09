import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAILS = [
    'krushi.krishh@gmail.com',
    'nallandhigalsumanth@gmail.com'
];

function isAdminRequest(request) {
    const adminEmail = request.headers.get('x-admin-email');
    return adminEmail && ADMIN_EMAILS.includes(adminEmail);
}

export async function GET(request) {
    if (!isAdminRequest(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get all unique users from job_applications
        const { data: jobData } = await supabase
            .from('job_applications')
            .select('user_id, created_at')
            .order('created_at', { ascending: false });

        // Group by user
        const userMap = new Map();
        (jobData || []).forEach(job => {
            if (!userMap.has(job.user_id)) {
                userMap.set(job.user_id, {
                    user_id: job.user_id,
                    first_job: job.created_at,
                    last_activity: job.created_at,
                    job_count: 1
                });
            } else {
                const user = userMap.get(job.user_id);
                user.job_count++;
                if (job.created_at > user.last_activity) {
                    user.last_activity = job.created_at;
                }
                if (job.created_at < user.first_job) {
                    user.first_job = job.created_at;
                }
            }
        });

        // Get Gmail connection status
        const { data: gmailTokens } = await supabase
            .from('gmail_tokens')
            .select('user_id, expires_at');

        const gmailMap = new Map();
        (gmailTokens || []).forEach(token => {
            gmailMap.set(token.user_id, {
                connected: true,
                expired: new Date(token.expires_at) < new Date()
            });
        });

        // Combine data
        let users = Array.from(userMap.values()).map(user => ({
            ...user,
            gmail_connected: gmailMap.has(user.user_id),
            gmail_expired: gmailMap.get(user.user_id)?.expired || false
        }));

        // Sort by last activity
        users.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));

        // Paginate
        const total = users.length;
        const startIndex = (page - 1) * limit;
        users = users.slice(startIndex, startIndex + limit);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Admin users error:', err);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

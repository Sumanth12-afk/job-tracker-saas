import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Get user ID from Supabase auth cookie
async function getUserIdFromCookie(cookieStore) {
    try {
        const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];
        const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);

        if (!authCookie) return null;

        const authData = JSON.parse(authCookie.value);
        return authData.user?.id || null;
    } catch (e) {
        return null;
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();

        // Check cookie first (fast path)
        const pendingTokens = cookieStore.get('gmail_pending_tokens')?.value;
        if (pendingTokens) {
            return NextResponse.json({ connected: true });
        }

        // Check database
        const userId = await getUserIdFromCookie(cookieStore);
        if (!userId) {
            return NextResponse.json({ connected: false });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error } = await supabase
            .from('gmail_tokens')
            .select('id')
            .eq('user_id', userId)
            .single();

        return NextResponse.json({ connected: !error && !!data });
    } catch (err) {
        return NextResponse.json({ connected: false });
    }
}

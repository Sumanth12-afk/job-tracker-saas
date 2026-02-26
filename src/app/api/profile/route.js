import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Get user ID from Supabase auth cookie (same pattern as gmail routes)
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

// GET: Fetch current user's profile
export async function GET() {
    try {
        const cookieStore = await cookies();
        const userId = await getUserIdFromCookie(cookieStore);

        if (!userId) {
            return NextResponse.json({ profile: null });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        return NextResponse.json({ profile: profile || null });
    } catch (err) {
        console.error('Profile GET error:', err);
        return NextResponse.json({ profile: null });
    }
}

// POST: Create or update profile
export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const userId = await getUserIdFromCookie(cookieStore);

        if (!userId) {
            return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
        }

        const body = await request.json();
        const { username, display_name, bio, target_role, is_public, show_heatmap, show_funnel, show_sources, show_streak } = body;

        // Validate username
        if (!username || !/^[a-z0-9_-]{3,30}$/.test(username)) {
            return NextResponse.json({ error: 'Username must be 3-30 chars, lowercase letters, numbers, hyphens, underscores only' }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check if username is taken by another user
        const { data: existing } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('username', username)
            .single();

        if (existing && existing.user_id !== userId) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        // Upsert profile
        const profileData = {
            user_id: userId,
            username,
            display_name: display_name || null,
            bio: bio || null,
            target_role: target_role || null,
            is_public: is_public ?? false,
            show_heatmap: show_heatmap ?? true,
            show_funnel: show_funnel ?? true,
            show_sources: show_sources ?? true,
            show_streak: show_streak ?? true,
        };

        const { data: profile, error } = await supabase
            .from('user_profiles')
            .upsert(profileData, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) {
            console.error('Profile upsert error:', error);
            return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
        }

        return NextResponse.json({ profile });
    } catch (err) {
        console.error('Profile POST error:', err);
        return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }
}

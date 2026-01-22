import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Gmail OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
    : 'http://localhost:3000/api/gmail/callback';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Gmail API scopes - read-only for job emails
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
];

// Get user ID from Supabase auth
async function getCurrentUserId() {
    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        // This won't work on server without proper auth setup
        // So we'll try to get from cookies
        return null;
    } catch (e) {
        return null;
    }
}

export async function GET(request) {
    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json(
            { error: 'Gmail integration not configured. Contact support.' },
            { status: 500 }
        );
    }

    // Get the user ID from the request (passed as query param from client)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    console.log('Gmail auth starting, user_id:', userId);

    // Store user ID in state param to retrieve in callback
    const state = Buffer.from(JSON.stringify({
        userId: userId || null,
        timestamp: Date.now(),
    })).toString('base64');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
}

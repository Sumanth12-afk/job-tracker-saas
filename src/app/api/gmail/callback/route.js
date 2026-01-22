import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
    : 'http://localhost:3000/api/gmail/callback';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
        console.log('Gmail auth error:', error);
        return NextResponse.redirect(new URL('/dashboard?gmail_error=access_denied', request.url));
    }

    if (!code) {
        console.log('No code received');
        return NextResponse.redirect(new URL('/dashboard?gmail_error=no_code', request.url));
    }

    // Parse state to get user ID
    let userId = null;
    try {
        if (state) {
            const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
            userId = stateData.userId;
            console.log('User ID from state:', userId);
        }
    } catch (e) {
        console.error('Failed to parse state:', e);
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
            }),
        });

        const tokens = await tokenResponse.json();
        console.log('Token response:', tokens.access_token ? 'success' : 'failed', tokens.error || '');

        if (tokens.error) {
            console.error('Token error:', tokens);
            return NextResponse.redirect(new URL('/dashboard?gmail_error=token_failed', request.url));
        }

        const cookieStore = await cookies();
        const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString();

        // Save to database if we have user ID and service key
        if (userId && supabaseServiceKey) {
            console.log('Saving tokens to database for user:', userId);

            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            const { error: dbError } = await supabase
                .from('gmail_tokens')
                .upsert({
                    user_id: userId,
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token || null,
                    expires_at: expiresAt,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id'
                });

            if (dbError) {
                console.error('DB error:', dbError);
            } else {
                console.log('✓ Tokens saved to database successfully!');
            }
        } else {
            console.log('Skipping DB save - userId:', userId, 'serviceKey:', !!supabaseServiceKey);
        }

        // Always store in cookie for immediate use
        const gmailData = {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || null,
            expires_at: expiresAt,
        };

        cookieStore.set('gmail_pending_tokens', JSON.stringify(gmailData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        console.log('Gmail connection successful!');
        return NextResponse.redirect(new URL('/dashboard?gmail_connected=true', request.url));
    } catch (err) {
        console.error('Gmail callback error:', err);
        return NextResponse.redirect(new URL('/dashboard?gmail_error=callback_failed', request.url));
    }
}

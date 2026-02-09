import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Debug endpoint to check what cookies are available
// DELETE THIS AFTER DEBUGGING
export async function GET(request) {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const projectRef = supabaseUrl?.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

    // Find auth cookie
    const authCookie = allCookies.find(c => c.name.includes('auth-token'));

    let parsed = null;
    let email = null;

    if (authCookie) {
        try {
            const decoded = decodeURIComponent(authCookie.value);
            parsed = JSON.parse(decoded);
            email = parsed?.user?.email || parsed?.email;
        } catch (e) {
            try {
                parsed = JSON.parse(authCookie.value);
                email = parsed?.user?.email || parsed?.email;
            } catch (e2) {
                parsed = { error: 'Could not parse', raw: authCookie.value.substring(0, 200) };
            }
        }
    }

    return NextResponse.json({
        projectRef,
        cookieNames: allCookies.map(c => c.name),
        authCookieName: authCookie?.name,
        email,
        parsedStructure: parsed ? Object.keys(parsed) : null,
        adminEmails: ['krushi.krishh@gmail.com', 'nallandhigalsumanth@gmail.com'],
        isAdmin: email && ['krushi.krishh@gmail.com', 'nallandhigalsumanth@gmail.com'].includes(email)
    });
}

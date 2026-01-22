import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('gmail_pending_tokens');
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Gmail disconnect error:', err);
        return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }
}

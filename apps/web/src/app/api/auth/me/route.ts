import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@vouch/auth';

export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
        return NextResponse.json(
            { authenticated: false, user: null },
            { status: 200 }
        );
    }

    const user = await validateSession(accessToken);

    if (!user) {
        return NextResponse.json(
            { authenticated: false, user: null },
            { status: 200 }
        );
    }

    return NextResponse.json({
        authenticated: true,
        user,
    });
}

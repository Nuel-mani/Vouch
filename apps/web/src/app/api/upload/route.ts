import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { getPresignedUploadUrl, getPresignedDownloadUrl } from '@vouch/storage';
import { db } from '@vouch/db';

// File upload API - generates presigned URLs for S3 uploads

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await validateSession(token);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { filename, contentType, purpose } = body;

        if (!filename || !contentType) {
            return NextResponse.json(
                { error: 'Missing filename or contentType' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'application/pdf',
        ];

        if (!allowedTypes.includes(contentType)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, PDF' },
                { status: 400 }
            );
        }

        // Generate unique key
        const ext = filename.split('.').pop() || 'bin';
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const folder = purpose || 'uploads';
        const key = `${user.id}/${folder}/${timestamp}-${randomId}.${ext}`;

        // Get presigned upload URL
        const uploadUrl = await getPresignedUploadUrl(key, contentType);

        return NextResponse.json({
            success: true,
            uploadUrl,
            key,
            publicUrl: `${process.env.S3_PUBLIC_URL || ''}/${key}`,
        });
    } catch (error) {
        console.error('Upload URL generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload URL' },
            { status: 500 }
        );
    }
}

// Get download URL for a file
export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await validateSession(token);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
        }

        // Verify the file belongs to this user
        if (!key.startsWith(`${user.id}/`)) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const downloadUrl = await getPresignedDownloadUrl(key);

        return NextResponse.json({
            success: true,
            downloadUrl,
        });
    } catch (error) {
        console.error('Download URL generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate download URL' },
            { status: 500 }
        );
    }
}

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
});

const BUCKET_NAME = process.env.S3_BUCKET || 'vouch-uploads';
const PUBLIC_URL = process.env.S3_PUBLIC_URL || '';

export interface UploadOptions {
    contentType?: string;
    isPublic?: boolean;
}

/**
 * Upload a file to S3 compatible storage
 */
export async function uploadFile(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    options: UploadOptions = {}
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: options.contentType,
        // ALFs like Cloudflare R2 might ignore ACLs, but S3 uses them
        ACL: options.isPublic ? 'public-read' : 'private',
    });

    await s3Client.send(command);

    if (options.isPublic && PUBLIC_URL) {
        return `${PUBLIC_URL}/${key}`;
    }

    return key;
}

/**
 * Get a signed URL for reading a file
 */
export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    // If we have a public URL and the key is just the path, return public URL
    // But usually we use signed URLs for private user data
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get a signed URL for uploading a file directly from client
 */
export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 300): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file
 */
export async function deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
}

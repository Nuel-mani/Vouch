/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@opcore/db', '@opcore/auth', '@opcore/types'],
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    // Expose env vars to Edge runtime (middleware)
    env: {
        JWT_SECRET: process.env.JWT_SECRET,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: '**.r2.cloudflarestorage.com',
            },
        ],
    },
};

export default nextConfig;

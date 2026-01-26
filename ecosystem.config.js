/**
 * PM2 Ecosystem Configuration
 * 
 * Usage:
 *   pm2 start ecosystem.config.js          # Start all apps
 *   pm2 start ecosystem.config.js --only vouch-web  # Start only web
 *   pm2 stop all                           # Stop all apps
 *   pm2 restart all                        # Restart all apps
 *   pm2 logs                               # View logs
 *   pm2 startup                            # Generate startup script
 *   pm2 save                               # Save current process list
 * 
 * IMPORTANT: Copy this file to ecosystem.config.local.js and fill in
 * your actual database credentials there. The .local version is gitignored.
 */

// Load environment variables from .env if needed
require('dotenv').config({ path: './packages/db/.env' });

module.exports = {
    apps: [
        {
            name: 'vouch-web',
            cwd: './apps/web',
            script: 'npm',
            args: 'start',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                // Database - loaded from packages/db/.env or set directly here
                DATABASE_URL: process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE',
                DIRECT_URL: process.env.DIRECT_URL || 'YOUR_DIRECT_URL_HERE',
            },
            error_file: './logs/web-error.log',
            out_file: './logs/web-out.log',
            merge_logs: true,
            time: true
        },
        {
            name: 'vouch-admin',
            cwd: './apps/admin',
            script: 'npm',
            args: 'start',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
                // Database - loaded from packages/db/.env or set directly here
                DATABASE_URL: process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE',
                DIRECT_URL: process.env.DIRECT_URL || 'YOUR_DIRECT_URL_HERE',
            },
            error_file: './logs/admin-error.log',
            out_file: './logs/admin-out.log',
            merge_logs: true,
            time: true
        }
    ]
};

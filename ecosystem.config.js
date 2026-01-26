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
 */

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
                PORT: 3000
            },
            env_file: '.env.local',
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
                PORT: 3001
            },
            env_file: '.env.local',
            error_file: './logs/admin-error.log',
            out_file: './logs/admin-out.log',
            merge_logs: true,
            time: true
        }
    ]
};

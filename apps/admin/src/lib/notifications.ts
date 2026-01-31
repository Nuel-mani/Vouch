
interface AlertOptions {
    level: 'info' | 'warning' | 'critical';
    details?: Record<string, any>;
}

export async function sendAdminAlert(message: string, options: AlertOptions) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
        console.warn('⚠️ SLACK_WEBHOOK_URL not set. Alert not sent:', message);
        return;
    }

    const { level, details } = options;

    const emoji = {
        info: '🔵',
        warning: '🟡',
        critical: '🔴'
    }[level];

    const payload = {
        text: `${emoji} *[${level.toUpperCase()}]* ${message}`,
        blocks: [
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `${emoji} *${message}*`
                }
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: `*Time:* ${new Date().toISOString()}\n*Source:* Admin Console`
                    }
                ]
            }
        ]
    };

    if (details) {
        payload.blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: '```' + JSON.stringify(details, null, 2) + '```'
            }
            // @ts-ignore - Block kit typing looseness
        } as any);
    }

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Failed to send admin alert:', error);
    }
}

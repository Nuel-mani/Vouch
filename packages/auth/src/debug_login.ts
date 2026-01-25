import { login } from './session';
import { db } from '@vouch/db';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
    try {
        console.log('Attempting login with demo user...');
        const result = await login('demo@vouch.ng', 'Test@123');
        console.log('✅ Login successful!');
        console.log('User ID:', result.user.id);
        console.log('User Email:', result.user.email);
        console.log('Role:', (result.user as any).role); // Check what roles comes back
        console.log('Access Token:', result.accessToken.substring(0, 20) + '...');
    } catch (e: any) {
        console.error('❌ Login failed:', e.message);
        if (e.code) console.error('Error Code:', e.code);
    } finally {
        await db.$disconnect();
    }
}

main();

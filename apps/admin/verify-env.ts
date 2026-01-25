import dotenv from 'dotenv';
import path from 'path';

// Load from root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('--- Environment Verification ---');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded ✅' : 'Missing ❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded ✅' : 'Missing ❌');

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is missing. Check if .env exists in the root directory.');
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error('Error: JWT_SECRET is missing.');
    process.exit(1);
}

console.log('Environment variables are correctly loaded.');

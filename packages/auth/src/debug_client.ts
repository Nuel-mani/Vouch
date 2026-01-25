import { db } from '@vouch/db';

async function main() {
    console.log('Inspecting db object keys:');
    console.log(Object.keys(db));

    if (!db.refreshToken) {
        console.log('❌ db.refreshToken is missing!');
    } else {
        console.log('✅ db.refreshToken is present.');
    }

    if (!db.auditLog) {
        console.log('❌ db.auditLog is missing!');
    } else {
        console.log('✅ db.auditLog is present.');
    }
}

main();

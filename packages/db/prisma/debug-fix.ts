import { PrismaClient } from '@prisma/client';
import { INITIAL_INSIGHTS } from '@vouch/services/src/insights/data';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Admin User...');

    // Check for user
    const user = await prisma.user.findUnique({
        where: { email: 'admin@fulrez.com' }
    });

    if (!user) {
        console.error('❌ Admin user not found in Users table!');
    } else {
        console.log('✅ User record found:', user.id);
    }

    // Check for admin_users entry
    const adminRole = await prisma.admin_users.findUnique({
        where: { email: 'admin@fulrez.com' }
    });

    if (!adminRole) {
        console.error('❌ Admin role NOT found in admin_users table. Attemping fix...');
        await prisma.admin_users.create({
            data: {
                email: 'admin@fulrez.com',
                role: 'admin'
            }
        });
        console.log('✅ Created missing admin_users record.');
    } else {
        console.log('✅ Admin role record found.');
    }

    console.log('\n🌱 Seeding Strategic Insights...');

    const count = await prisma.strategicInsight.count();
    if (count > 0) {
        console.log(`ℹ️ Table already has ${count} insights.`);
    } else {
        console.log(`Creating ${INITIAL_INSIGHTS.length} insights...`);
        // Batch create
        for (const insight of INITIAL_INSIGHTS) {
            await prisma.strategicInsight.create({
                data: {
                    ...insight,
                    isActive: true
                }
            });
        }
        console.log('✅ Insights seeded successfully!');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

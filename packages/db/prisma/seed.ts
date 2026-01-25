import { PrismaClient } from '@prisma/client';
console.log('Seed resolving client from:', require.resolve('@prisma/client'));
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Fallback to packages/db/.env if exists
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

async function main() {
    console.log('🌱 Starting database seed...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'));

    // ============================================
    // 1. Create Admin User
    // ============================================
    const adminPassword = await hashPassword('Admin@123');

    const admin = await prisma.user.upsert({
        where: { email: 'admin@fulrez.com' },
        update: {},
        create: {
            email: 'admin@fulrez.com',
            passwordHash: adminPassword, // Fixed: password -> passwordHash
            // role: 'admin', // Role column not present in users table
            businessName: 'Fulrez Technologies',
            accountType: 'business',
            sector: 'technology',
            turnoverBand: 'medium',
            taxIdentityNumber: 'TIN-0001-ADMIN',
            subscriptionTier: 'enterprise',
            brandColor: '#6366f1',
            // Removed: isEmailVerified (not in schema)
            isCitExempt: false,
            isVatExempt: false,
        },
    });

    console.log('✅ Admin user created:', admin.email);

    // Create Admin Role Entry
    await prisma.admin_users.upsert({
        where: { email: 'admin@fulrez.com' },
        update: {},
        create: {
            email: 'admin@fulrez.com',
            role: 'admin',
        },
    });
    console.log('✅ Admin privileges assigned to:', admin.email);

    // ============================================
    // 2. Create Test Users
    // ============================================
    const testPassword = await hashPassword('Test@123');

    const testUsers = [
        {
            email: 'john@testcompany.com',
            businessName: "John's Digital Agency",
            accountType: 'business',
            sector: 'creative',
            turnoverBand: 'small_upper',
            subscriptionTier: 'pro',
            tinNumber: 'TIN-1001-TEST',
        },
        {
            email: 'mary@freelancer.com',
            businessName: "Mary Consulting",
            accountType: 'personal',
            sector: 'professional',
            turnoverBand: 'micro',
            subscriptionTier: 'free',
            tinNumber: 'TIN-2002-FREE',
        },
        {
            email: 'tech@startup.io',
            businessName: "Tech Innovations Ltd",
            accountType: 'business',
            sector: 'technology',
            turnoverBand: 'large',
            subscriptionTier: 'enterprise',
            tinNumber: 'TIN-3003-CORP',
            isCitExempt: true,
        },
        {
            email: 'demo@vouch.ng',
            businessName: "Demo User",
            accountType: 'business',
            sector: 'general',
            turnoverBand: 'small',
            subscriptionTier: 'pro',
            tinNumber: 'TIN-DEMO-2025',
        },
    ];

    for (const userData of testUsers) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: {
                email: userData.email,
                passwordHash: testPassword, // Fixed: password -> passwordHash
                // role: 'user', // Role column not present
                businessName: userData.businessName,
                accountType: userData.accountType as any,
                sector: userData.sector,
                turnoverBand: userData.turnoverBand,
                subscriptionTier: userData.subscriptionTier,
                taxIdentityNumber: userData.tinNumber,
                brandColor: '#2252c9',
                // Removed: isEmailVerified
                isCitExempt: userData.isCitExempt ?? false,
                isVatExempt: false,
            },
        });
        console.log('✅ Test user created:', user.email);
    }

    // ============================================
    // 3. Create Transactions for Demo User
    // ============================================
    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@vouch.ng' },
    });

    if (demoUser) {
        const transactions = [
            {
                type: 'income',
                amount: 250000,
                vatAmount: 18750,
                categoryName: 'Consulting',
                description: 'Website redesign project',
                payee: 'ABC Corp',
                isDeductible: false,
                hasVatEvidence: true,
                weCompliant: true,
            },
            {
                type: 'expense',
                amount: 8500,
                vatAmount: 0,
                categoryName: 'Food & Drinks',
                description: 'Client entertainment',
                payee: 'Restaurant XYZ',
                isDeductible: false,
                hasVatEvidence: false,
                weCompliant: false,
            },
        ];

        for (let i = 0; i < transactions.length; i++) {
            const tx = transactions[i];
            const date = new Date();
            date.setDate(date.getDate() - (i * 3));

            await prisma.transaction.create({
                data: {
                    user: { connect: { id: demoUser.id } },
                    type: tx.type,
                    amount: tx.amount,
                    vatAmount: tx.vatAmount,
                    categoryName: tx.categoryName,
                    description: tx.description,
                    payee: tx.payee,
                    date: date,
                    isDeductible: tx.isDeductible,
                    hasVatEvidence: tx.hasVatEvidence,
                    weCompliant: tx.weCompliant,
                },
            });
        }
        console.log('✅ Sample transactions created for demo user');

        // ============================================
        // 4. Create Sample Invoice for Demo User
        // ============================================
        await prisma.invoice.create({
            data: {
                user: { connect: { id: demoUser.id } },
                serialId: 1,
                customerName: 'ABC Corporation',
                // customerEmail: 'accounts@abccorp.com',
                // customerAddress: '15 Marina Street, Lagos',
                amount: 350000,
                vatAmount: 26250,
                items: [
                    {
                        description: 'Web Development',
                        quantity: 1,
                        unitPrice: 250000
                    },
                    {
                        description: 'SEO Optimization',
                        quantity: 2,
                        unitPrice: 50000
                    }
                ],
                status: 'sent',
                dateIssued: new Date(),
                // dateDue: new Date(new Date().setDate(new Date().getDate() + 30)),
            },
        });
        console.log('✅ Sample invoice created for demo user');
    }

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import { NextRequest, NextResponse } from "next/server";
import { db } from "@vouch/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { changes, lastPulledAt } = body;

        // WatermelonDB sends { transactions: { created: [], updated: [], deleted: [] } }

        if (changes?.transactions) {
            const { created, updated, deleted } = changes.transactions;
            const upsertList = [...created, ...updated];

            await db.$transaction(async (tx) => {
                // Handle Upserts
                for (const item of upsertList) {
                    // Determine Tax Compliance Flags safely
                    const isDeductible = item.isDeductible === true || item.isDeductible === 'true';
                    const hasVatEvidence = item.hasVatEvidence === true || item.hasVatEvidence === 'true';

                    await tx.transaction.upsert({
                        where: { id: item.id },
                        update: {
                            amount: item.amount,
                            type: item.type,
                            date: new Date(item.date),
                            description: item.description,
                            categoryId: item.categoryId || null,
                            categoryName: item.categoryName || null,
                            payee: item.payee || null,
                            paymentMethod: item.paymentMethod || null,
                            refId: item.refId || null,
                            invoiceId: item.invoiceId || null,

                            // Tax & Compliance
                            isDeductible,
                            hasVatEvidence,
                            vendorTin: item.vendorTin || null,
                            isCapitalAsset: item.isCapitalAsset === true,
                            assetClass: item.assetClass || null,
                            receiptUrls: item.receiptUrls ? item.receiptUrls : [], // JSON field

                            syncStatus: 'synced',
                            updatedAt: new Date()
                        },
                        create: {
                            id: item.id,
                            userId: item.userId || "user_placeholder", // TODO: Auth Context
                            amount: item.amount,
                            type: item.type,
                            date: new Date(item.date),
                            description: item.description,
                            categoryId: item.categoryId || null,
                            categoryName: item.categoryName || null,
                            payee: item.payee || null,
                            paymentMethod: item.paymentMethod || null,
                            refId: item.refId || null,
                            invoiceId: item.invoiceId || null,

                            isDeductible,
                            hasVatEvidence,
                            vendorTin: item.vendorTin || null,
                            isCapitalAsset: item.isCapitalAsset === true,
                            assetClass: item.assetClass || null,
                            receiptUrls: item.receiptUrls ? item.receiptUrls : [],

                            syncStatus: 'synced',
                            createdAt: new Date(item.createdAt || Date.now()),
                            updatedAt: new Date()
                        }
                    });
                }

                // Handle Deletes
                if (deleted.length > 0) {
                    await tx.transaction.deleteMany({
                        where: { id: { in: deleted } }
                    });
                }
            });
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Transaction Push Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

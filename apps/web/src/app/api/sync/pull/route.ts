import { NextRequest, NextResponse } from "next/server";
import { db } from "@vouch/db";
import { z } from "zod";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const lastPulledAt = searchParams.get('last_pulled_at');
        const tenantIdPromise = searchParams.get('last_pulled_at') ? Promise.resolve("user_id_placeholder") : Promise.resolve(null); // Auth Placeholder

        // TODO: Integrate actual Auth (e.g. Session)
        // For now we assume the client sends the right queries, but in prod we need req.auth

        const timestamp = lastPulledAt && lastPulledAt !== 'null' ? new Date(parseInt(lastPulledAt)) : new Date(0);

        const changes = {
            transactions: { created: [], updated: [], deleted: [] },
            invoices: { created: [], updated: [], deleted: [] },
            tenants: { created: [], updated: [], deleted: [] },
        };

        // 1. Pull Transactions
        const transactions = await db.transaction.findMany({
            where: {
                updatedAt: { gt: timestamp },
                syncStatus: 'synced'
            }
        });

        // 2. Pull Invoices
        const invoices = await db.invoice.findMany({
            where: {
                updatedAt: { gt: timestamp },
                syncStatus: 'synced'
            }
        });

        // Format for WatermelonDB (Simplified Pull)
        // In a full implementation, we distinguish created vs updated based on created_at vs updated_at logic
        // But for basic sync, sending everything as 'updated' often works if ID matches

        return NextResponse.json({
            changes: {
                transactions: {
                    created: transactions.filter(t => t.createdAt > timestamp),
                    updated: transactions.filter(t => t.createdAt <= timestamp && t.updatedAt > timestamp),
                    deleted: [], // Soft deletes would go here if implemented
                },
                invoices: {
                    created: invoices.filter(t => t.createdAt > timestamp),
                    updated: invoices.filter(t => t.createdAt <= timestamp && t.updatedAt > timestamp),
                    deleted: [],
                }
            },
            timestamp: Date.now(),
        });

    } catch (error) {
        console.error("Pull Sync Error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}

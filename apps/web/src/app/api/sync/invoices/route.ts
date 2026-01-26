import { NextRequest, NextResponse } from "next/server";
import { db } from "@vouch/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { changes } = body;

        if (changes?.invoices) {
            const { created, updated, deleted } = changes.invoices;
            const upsertList = [...created, ...updated];

            await db.$transaction(async (tx) => {
                for (const item of upsertList) {
                    // Ensure items is JSON (WatermelonDB might send it as string or object depending on config)
                    let itemsJson = [];
                    try {
                        itemsJson = typeof item.items === 'string' ? JSON.parse(item.items) : item.items;
                    } catch (e) { itemsJson = [] }

                    await tx.invoice.upsert({
                        where: { id: item.id },
                        update: {
                            serialId: item.serialId,
                            status: item.status,
                            customerName: item.customerName,
                            customerEmail: item.customerEmail || null,
                            customerAddress: item.customerAddress || null,
                            amount: item.amount,
                            vatAmount: item.vatAmount || 0,
                            dateIssued: new Date(item.dateIssued),
                            dateDue: item.dateDue ? new Date(item.dateDue) : null,
                            items: itemsJson,
                            notes: item.notes || null,
                            syncStatus: 'synced',
                            updatedAt: new Date()
                        },
                        create: {
                            id: item.id,
                            userId: item.userId || "user_placeholder", // TODO: Auth Context
                            serialId: item.serialId,
                            status: item.status,
                            customerName: item.customerName,
                            customerEmail: item.customerEmail || null,
                            customerAddress: item.customerAddress || null,
                            amount: item.amount,
                            vatAmount: item.vatAmount || 0,
                            dateIssued: new Date(item.dateIssued),
                            dateDue: item.dateDue ? new Date(item.dateDue) : null,
                            items: itemsJson,
                            notes: item.notes || null,
                            syncStatus: 'synced',
                            createdAt: new Date(item.createdAt || Date.now()),
                            updatedAt: new Date()
                        }
                    });
                }

                if (deleted.length > 0) {
                    await tx.invoice.deleteMany({
                        where: { id: { in: deleted } }
                    });
                }
            });
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Invoice Push Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

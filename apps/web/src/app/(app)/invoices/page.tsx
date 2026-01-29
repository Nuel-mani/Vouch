import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import Link from 'next/link';
import { Plus, Download, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { InvoiceList } from './_components/InvoiceList';
import { ExportButton } from '../_components/ExportButton';
import { exportInvoices } from './_actions';

interface PageProps {
    searchParams: Promise<{
        search?: string;
        status?: string;
    }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);
    const params = await searchParams;

    if (!user) return null;

    // Build filters
    const where: any = { userId: user.id };

    if (params.status && params.status !== 'all') {
        where.status = params.status;
    }

    if (params.search) {
        const isNumeric = !isNaN(Number(params.search));
        if (isNumeric) {
            where.OR = [
                { serialId: Number(params.search) },
                { customerName: { contains: params.search, mode: 'insensitive' } }
            ];
        } else {
            where.OR = [
                { customerName: { contains: params.search, mode: 'insensitive' } },
                { customerEmail: { contains: params.search, mode: 'insensitive' } }
            ];
        }
    }

    // Fetch invoices
    const invoicesData = await db.invoice.findMany({
        where,
        orderBy: { dateIssued: 'desc' },
    });

    const invoices = invoicesData.map((inv) => {
        let parsedItems = [];
        try {
            if (Array.isArray(inv.items)) {
                parsedItems = inv.items;
            } else if (typeof inv.items === 'string') {
                parsedItems = JSON.parse(inv.items);
            }
        } catch (e) {
            console.error('Failed to parse invoice items:', e);
        }

        return {
            id: inv.id,
            serialId: inv.serialId,
            customerName: inv.customerName,
            customerEmail: inv.customerEmail,
            customerAddress: inv.customerAddress,
            customerPhone: inv.customerPhone,
            amount: Number(inv.amount),
            vatAmount: Number(inv.vatAmount),
            status: inv.status,
            dateIssued: inv.dateIssued,
            dateDue: inv.dateDue,
            datePaid: inv.datePaid,
            notes: inv.notes,
            proofUrl: inv.proofUrl,
            items: Array.isArray(parsedItems) ? parsedItems : [],
        };
    });

    // Calculate stats
    const stats = {
        total: invoices.length,
        draft: 0,
        pending: 0,
        paid: 0,
        overdue: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
    };

    const now = new Date();

    invoices.forEach((inv) => {
        const amount = Number(inv.amount);
        stats.totalAmount += amount;

        switch (inv.status) {
            case 'draft':
                stats.draft++;
                break;
            case 'sent':
            case 'pending':
                if (inv.dateDue && new Date(inv.dateDue) < now) {
                    stats.overdue++;
                } else {
                    stats.pending++;
                }
                stats.pendingAmount += amount;
                break;
            case 'paid':
                stats.paid++;
                stats.paidAmount += amount;
                break;
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Invoices</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        Manage and track your customer invoices
                    </p>
                </div>
                <div className="flex gap-3">
                    <ExportButton
                        model="invoice"
                        filters={params}
                        exportAction={exportInvoices}
                    />
                    <Link
                        href="/invoices/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                        <Plus size={16} />
                        New Invoice
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border)] flex items-center gap-4">
                    <div className="p-3 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-lg">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.total}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">Total Invoices</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border)] flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 rounded-lg">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.pending}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">Pending</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border)] flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-500/10 text-green-600 rounded-lg">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.paid}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">Paid</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border)] flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[var(--foreground)]">{stats.overdue}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">Overdue</p>
                    </div>
                </div>
            </div>

            {/* Revenue Summary */}
            <div className="rounded-2xl p-6 text-white" style={{ background: 'var(--gradient-primary)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <p className="text-white/70 text-sm">Total Invoiced</p>
                        <p className="text-3xl font-bold mt-1">₦{stats.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-white/70 text-sm">Collected</p>
                        <p className="text-3xl font-bold mt-1">₦{stats.paidAmount.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-white/70 text-sm">Outstanding</p>
                        <p className="text-3xl font-bold mt-1">₦{stats.pendingAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Invoice List */}
            <InvoiceList invoices={invoices} />
        </div>
    );
}

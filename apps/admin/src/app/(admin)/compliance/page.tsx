import { db } from '@vouch/db';
import { FileCheck, Clock, CheckCircle, XCircle, Eye, Image as ImageIcon } from 'lucide-react';
import { ApproveButton, RejectButton, ViewDocumentButton } from './components/ComplianceActions';
import Link from 'next/link';

const REQUEST_TYPE_LABELS: Record<string, string> = {
    nin_verification: 'NIN Verification',
    bvn_verification: 'BVN Verification',
    cac_verification: 'CAC Certificate',
    tin_verification: 'TIN Verification',
    director_id: 'Director ID',
    kyc: 'KYC Verification',
    tax_exemption: 'Tax Exemption',
    rent_relief: 'Rent Relief Claim',
    sme_status: 'SME Status',
    business_registration: 'Business Registration',
};

interface PageProps {
    searchParams: Promise<{ status?: string; type?: string }>;
}

export default async function CompliancePage({ searchParams }: PageProps) {
    const params = await searchParams;

    // Build filter
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.type) where.requestType = params.type;

    const requests = await db.complianceRequest.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    businessName: true,
                    nin: true,
                    bvn: true,
                    taxIdentityNumber: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    });

    // Calculate stats (unfiltered)
    const allRequests = await db.complianceRequest.findMany({ select: { status: true } });
    const stats = {
        total: allRequests.length,
        pending: allRequests.filter((r) => r.status === 'pending').length,
        approved: allRequests.filter((r) => r.status === 'approved').length,
        rejected: allRequests.filter((r) => r.status === 'rejected').length,
    };

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-500/10 text-yellow-400',
        approved: 'bg-green-500/10 text-green-400',
        rejected: 'bg-red-500/10 text-red-400',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Compliance Queue</h1>
                <p className="text-slate-400">Review and approve compliance requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Link href="/compliance" className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                            <FileCheck size={20} />
                        </div>
                        <span className="text-sm text-slate-400">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                </Link>
                <Link href="/compliance?status=pending" className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-amber-500/30 transition">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <span className="text-sm text-slate-400">Pending</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.pending}</p>
                </Link>
                <Link href="/compliance?status=approved" className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-green-500/30 transition">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-sm text-slate-400">Approved</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.approved}</p>
                </Link>
                <Link href="/compliance?status=rejected" className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-red-500/30 transition">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                            <XCircle size={20} />
                        </div>
                        <span className="text-sm text-slate-400">Rejected</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                </Link>
            </div>

            {/* All Requests Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                        {params.status ? `${params.status.charAt(0).toUpperCase() + params.status.slice(1)} Requests` : 'All Requests'}
                    </h2>
                    {(params.status || params.type) && (
                        <Link href="/compliance" className="text-sm text-red-400 hover:text-red-300">
                            Clear Filters
                        </Link>
                    )}
                </div>
                {requests.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileCheck size={48} className="mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-400">No compliance requests {params.status ? `with status "${params.status}"` : 'yet'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Profile Data</th>
                                    <th className="px-6 py-4">Document</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Submitted</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {requests.map((req) => {
                                    // Get relevant profile data based on request type
                                    let profileData = '-';
                                    if (req.requestType === 'nin_verification' && req.user.nin) {
                                        profileData = `NIN: ${req.user.nin}`;
                                    } else if (req.requestType === 'bvn_verification' && req.user.bvn) {
                                        profileData = `BVN: ${req.user.bvn}`;
                                    } else if ((req.requestType === 'tin_verification' || req.requestType === 'cac_verification') && req.user.taxIdentityNumber) {
                                        profileData = `TIN: ${req.user.taxIdentityNumber}`;
                                    }

                                    return (
                                        <tr key={req.id} className="hover:bg-slate-800 transition">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-white">{req.user.businessName || 'N/A'}</p>
                                                <p className="text-xs text-slate-500">{req.user.email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {REQUEST_TYPE_LABELS[req.requestType] || req.requestType}
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                                                    {profileData}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4">
                                                {req.documentUrl ? (
                                                    <ViewDocumentButton
                                                        documentUrl={req.documentUrl}
                                                        documentName={req.documentName || 'Document'}
                                                        userName={req.user.businessName || req.user.email || 'User'}
                                                        requestType={REQUEST_TYPE_LABELS[req.requestType] || req.requestType}
                                                    />
                                                ) : (
                                                    <span className="text-slate-500">No document</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[req.status]}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status === 'pending' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <ApproveButton requestId={req.id} />
                                                        <RejectButton requestId={req.id} />
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-xs">Resolved</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

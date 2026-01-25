'use server';

import { db } from '@vouch/db';
import { getAdminUser } from '../../../lib/permissions';
import { revalidatePath } from 'next/cache';

export async function approveComplianceRequest(requestId: string) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        const request = await db.complianceRequest.findUnique({
            where: { id: requestId },
            select: { userId: true }
        });

        if (!request) return { success: false, error: 'Request not found' };

        await db.$transaction(async (tx) => {
            // Approve request
            await tx.complianceRequest.update({
                where: { id: requestId },
                data: {
                    status: 'approved',
                    reviewedBy: admin.userId,
                    reviewedAt: new Date(),
                }
            });

            // Auto-unsuspend user if they were suspended
            await tx.user.update({
                where: { id: request.userId },
                data: { complianceSuspended: false }
            });

            // Log audit
            await tx.auditLog.create({
                data: {
                    userId: admin.userId,
                    action: 'APPROVE_COMPLIANCE',
                    resource: 'compliance_request',
                    resourceId: requestId,
                }
            });
        });

        revalidatePath('/compliance');
        return { success: true };
    } catch (error) {
        console.error('Approval failed:', error);
        return { success: false, error: 'Operation failed' };
    }
}

export async function rejectComplianceRequest(requestId: string, reason: string) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        const request = await db.complianceRequest.findUnique({
            where: { id: requestId },
            select: { userId: true, requestType: true }
        });

        if (!request) return { success: false, error: 'Request not found' };

        await db.$transaction(async (tx) => {
            // Reject request
            await tx.complianceRequest.update({
                where: { id: requestId },
                data: {
                    status: 'rejected',
                    reviewedBy: admin.userId,
                    reviewedAt: new Date(),
                    adminNotes: reason,
                }
            });

            // Check rejection count (excluding this one as we just updated it or count it now)
            // It's safer to count all rejected requests for this user
            const rejectedCount = await tx.complianceRequest.count({
                where: {
                    userId: request.userId,
                    status: 'rejected'
                }
            });

            // Suspend if 5 or more rejections
            if (rejectedCount >= 5) {
                await tx.user.update({
                    where: { id: request.userId },
                    data: { complianceSuspended: true }
                });
            }

            // Log audit
            await tx.auditLog.create({
                data: {
                    userId: admin.userId,
                    action: 'REJECT_COMPLIANCE',
                    resource: 'compliance_request',
                    resourceId: requestId,
                    details: { reason, totalRejections: rejectedCount }
                }
            });
        });

        revalidatePath('/compliance');
        return { success: true };
    } catch (error) {
        console.error('Rejection failed:', error);
        return { success: false, error: 'Operation failed' };
    }
}

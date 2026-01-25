import { NextRequest, NextResponse } from 'next/server';
import { db } from '@vouch/db';
import crypto from 'crypto';

// Paystack Webhook Handler
// Receives payment notifications from Paystack

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-paystack-signature');

        // Verify webhook signature
        if (PAYSTACK_SECRET_KEY && signature) {
            const hash = crypto
                .createHmac('sha512', PAYSTACK_SECRET_KEY)
                .update(body)
                .digest('hex');

            if (hash !== signature) {
                console.error('Invalid Paystack webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        }

        const event = JSON.parse(body);
        console.log('Paystack webhook event:', event.event);

        switch (event.event) {
            case 'charge.success': {
                const { reference, amount, metadata, customer } = event.data;
                const userId = metadata?.userId;

                if (!userId) {
                    console.error('No userId in payment metadata');
                    break;
                }

                // Record the payment
                await db.auditLog.create({
                    data: {
                        userId,
                        action: 'payment_received',
                        resource: 'payment',
                        resourceId: reference,
                        details: {
                            amount: amount / 100,
                            reference,
                            email: customer.email,
                            plan: metadata?.plan,
                        },
                    },
                });

                // If this is a subscription payment, update the subscription
                if (metadata?.plan) {
                    const subscription = await db.subscription.findFirst({
                        where: { userId },
                        orderBy: { createdAt: 'desc' },
                    });

                    if (subscription) {
                        const now = new Date();
                        const endDate = new Date(now);
                        endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription

                        await db.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                status: 'active',
                                planType: metadata.plan,
                                currentPeriodStart: now,
                                currentPeriodEnd: endDate,
                                paystackSubscriptionCode: event.data.subscription_code || null,
                            },
                        });

                        // Update user tier
                        await db.user.update({
                            where: { id: userId },
                            data: {
                                subscriptionTier: metadata.plan,
                            },
                        });
                    } else {
                        // Create new subscription
                        const now = new Date();
                        const endDate = new Date(now);
                        endDate.setMonth(endDate.getMonth() + 1);

                        await db.subscription.create({
                            data: {
                                userId,
                                planType: metadata.plan,
                                billingCycle: 'monthly',
                                status: 'active',
                                currentPeriodStart: now,
                                currentPeriodEnd: endDate,
                                paystackCustomerId: customer.customer_code,
                            },
                        });

                        await db.user.update({
                            where: { id: userId },
                            data: {
                                subscriptionTier: metadata.plan,
                            },
                        });
                    }
                }

                break;
            }

            case 'subscription.disable':
            case 'subscription.not_renew': {
                const { customer, subscription_code } = event.data;

                // Find and update the subscription
                const subscription = await db.subscription.findFirst({
                    where: { paystackSubscriptionCode: subscription_code },
                });

                if (subscription) {
                    await db.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            status: 'cancelled',
                            cancelledAt: new Date(),
                        },
                    });

                    // Downgrade user to free tier
                    await db.user.update({
                        where: { id: subscription.userId },
                        data: {
                            subscriptionTier: 'free',
                        },
                    });
                }

                break;
            }

            case 'invoice.payment_failed': {
                const { customer, subscription_code } = event.data;

                // Log failed payment
                const subscription = await db.subscription.findFirst({
                    where: { paystackSubscriptionCode: subscription_code },
                });

                if (subscription) {
                    await db.auditLog.create({
                        data: {
                            userId: subscription.userId,
                            action: 'payment_failed',
                            resource: 'subscription',
                            resourceId: subscription.id,
                            details: event.data,
                        },
                    });
                }

                break;
            }

            default:
                console.log('Unhandled Paystack event:', event.event);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

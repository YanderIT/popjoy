import { desc, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { order, subscription } from '@/config/db/schema';
import { StripeProvider } from '@/extensions/payment';
import { respErr, respOk } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import { getUserInfo } from '@/shared/models/user';

/**
 * Get Stripe customer ID for a user from their orders or subscriptions
 */
async function getStripeCustomerId(userId: string): Promise<string | null> {
  // First check subscriptions
  const [sub] = await db()
    .select({ paymentUserId: subscription.paymentUserId })
    .from(subscription)
    .where(eq(subscription.userId, userId))
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  if (sub?.paymentUserId) {
    return sub.paymentUserId;
  }

  // Then check orders
  const [ord] = await db()
    .select({ paymentUserId: order.paymentUserId })
    .from(order)
    .where(eq(order.userId, userId))
    .orderBy(desc(order.createdAt))
    .limit(1);

  return ord?.paymentUserId || null;
}

/**
 * Create Stripe provider instance
 */
async function getStripeProvider(): Promise<StripeProvider | null> {
  const configs = await getAllConfigs();

  if (configs.stripe_enabled !== 'true') {
    return null;
  }

  return new StripeProvider({
    secretKey: configs.stripe_secret_key,
    publishableKey: configs.stripe_publishable_key,
  });
}

// PUT - Set default payment method
export async function PUT(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Please sign in');
    }

    const body = await req.json();
    const { paymentMethodId } = body;

    if (!paymentMethodId) {
      return respErr('Payment method ID is required');
    }

    const stripeProvider = await getStripeProvider();
    if (!stripeProvider) {
      return respErr('Payment provider not configured');
    }

    const customerId = await getStripeCustomerId(user.id);
    if (!customerId) {
      return respErr('No customer account found');
    }

    await stripeProvider.setDefaultPaymentMethod({
      customerId,
      paymentMethodId,
    });

    return respOk();
  } catch (e: any) {
    console.log('set default payment method failed:', e);
    return respErr('Failed to set default payment method');
  }
}

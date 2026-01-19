import { desc, eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { order, subscription } from '@/config/db/schema';
import { StripeProvider } from '@/extensions/payment';
import { respData, respErr } from '@/shared/lib/resp';
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

// POST - Create a SetupIntent for adding a new payment method
export async function POST() {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Please sign in');
    }

    const stripeProvider = await getStripeProvider();
    if (!stripeProvider) {
      return respErr('Payment provider not configured');
    }

    const customerId = await getStripeCustomerId(user.id);
    if (!customerId) {
      return respErr('Please make a purchase first to save payment methods');
    }

    const setupIntent = await stripeProvider.createSetupIntent({ customerId });

    // Also return the publishable key for the frontend
    const configs = await getAllConfigs();

    return respData({
      clientSecret: setupIntent.clientSecret,
      publishableKey: configs.stripe_publishable_key,
    });
  } catch (e: any) {
    console.log('create setup intent failed:', e);
    return respErr('Failed to create setup intent');
  }
}

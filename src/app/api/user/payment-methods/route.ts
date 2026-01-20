import { desc, eq, or, isNotNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { order, shopOrder, subscription } from '@/config/db/schema';
import { StripeProvider } from '@/extensions/payment';
import { respData, respErr, respOk } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import { getUserInfo } from '@/shared/models/user';

/**
 * Get Stripe customer ID for a user from their orders or subscriptions
 */
async function getStripeCustomerId(userId: string): Promise<string | null> {
  // First check subscriptions (more likely to have payment methods)
  const [sub] = await db()
    .select({ paymentUserId: subscription.paymentUserId })
    .from(subscription)
    .where(
      eq(subscription.userId, userId)
    )
    .orderBy(desc(subscription.createdAt))
    .limit(1);

  if (sub?.paymentUserId) {
    return sub.paymentUserId;
  }

  // Then check orders
  const [ord] = await db()
    .select({ paymentUserId: order.paymentUserId })
    .from(order)
    .where(
      eq(order.userId, userId)
    )
    .orderBy(desc(order.createdAt))
    .limit(1);

  if (ord?.paymentUserId) {
    return ord.paymentUserId;
  }

  // Then check shop orders
  const [shopOrd] = await db()
    .select({ paymentUserId: shopOrder.paymentUserId })
    .from(shopOrder)
    .where(eq(shopOrder.userId, userId))
    .orderBy(desc(shopOrder.createdAt))
    .limit(1);

  return shopOrd?.paymentUserId || null;
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

// GET - Get user's saved payment methods
export async function GET() {
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
      // No customer ID means user hasn't made a payment yet
      return respData({ paymentMethods: [], noCustomer: true });
    }

    const paymentMethods = await stripeProvider.getPaymentMethods({
      customerId,
    });

    return respData({ paymentMethods });
  } catch (e: any) {
    console.log('get payment methods failed:', e);
    return respErr('Failed to get payment methods');
  }
}

// DELETE - Remove a payment method
export async function DELETE(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('Please sign in');
    }

    const { searchParams } = new URL(req.url);
    const paymentMethodId = searchParams.get('id');

    if (!paymentMethodId) {
      return respErr('Payment method ID is required');
    }

    const stripeProvider = await getStripeProvider();
    if (!stripeProvider) {
      return respErr('Payment provider not configured');
    }

    await stripeProvider.detachPaymentMethod({ paymentMethodId });

    return respOk();
  } catch (e: any) {
    console.log('delete payment method failed:', e);
    return respErr('Failed to remove payment method');
  }
}

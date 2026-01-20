import {
  PaymentEventType,
  SubscriptionCycleType,
} from '@/extensions/payment/types';
import { findOrderByOrderNo } from '@/shared/models/order';
import {
  findShopOrderByOrderNo,
  ShopOrderStatus,
  updateShopOrder,
} from '@/shared/models/shopOrder';
import { findSubscriptionByProviderSubscriptionId } from '@/shared/models/subscription';
import {
  getPaymentService,
  handleCheckoutSuccess,
  handleSubscriptionCanceled,
  handleSubscriptionRenewal,
  handleSubscriptionUpdated,
} from '@/shared/services/payment';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const startTime = Date.now();
  const log = (msg: string) => console.log(`[webhook] ${msg} (+${Date.now() - startTime}ms)`);

  try {
    log('start');
    const { provider } = await params;

    if (!provider) {
      throw new Error('provider is required');
    }

    const paymentService = await getPaymentService();
    log('got payment service');

    const paymentProvider = paymentService.getProvider(provider);
    if (!paymentProvider) {
      throw new Error('payment provider not found');
    }

    // get payment event from webhook notification
    const event = await paymentProvider.getPaymentEvent({ req });
    log('parsed event: ' + event?.eventType);

    if (!event) {
      throw new Error('payment event not found');
    }

    const eventType = event.eventType;
    if (!eventType) {
      throw new Error('event type not found');
    }

    // Skip ignored events
    if (eventType === PaymentEventType.IGNORED) {
      log('ignored event, returning');
      return Response.json({ message: 'ignored' });
    }

    // payment session
    const session = event.paymentSession;
    if (!session) {
      throw new Error('payment session not found');
    }

    if (eventType === PaymentEventType.CHECKOUT_SUCCESS) {
      // one-time payment or subscription first payment
      const orderNo = session.metadata.order_no;
      const orderType = session.metadata.order_type;
      log(`checkout success: orderNo=${orderNo}, orderType=${orderType}`);

      if (!orderNo) {
        throw new Error('order no not found');
      }

      // Handle shop orders separately
      if (orderType === 'shop_order') {
        const shopOrderRecord = await findShopOrderByOrderNo(orderNo);
        log('found shop order');

        if (!shopOrderRecord) {
          throw new Error('shop order not found');
        }

        // Update shop order status to pending_shipment (paid)
        await updateShopOrder(shopOrderRecord.id, {
          status: ShopOrderStatus.PENDING_SHIPMENT,
          paidAt: new Date(),
          paymentUserId: session.paymentInfo?.paymentUserId,
        });
        log('updated shop order status');
      } else {
        // Handle regular orders (subscriptions, credits, etc.)
        const order = await findOrderByOrderNo(orderNo);
        log('found regular order');

        if (!order) {
          throw new Error('order not found');
        }

        await handleCheckoutSuccess({
          order,
          session,
        });
        log('handled checkout success');
      }
    } else if (eventType === PaymentEventType.PAYMENT_SUCCESS) {
      // only handle subscription payment
      if (session.subscriptionId && session.subscriptionInfo) {
        if (
          session.paymentInfo?.subscriptionCycleType ===
          SubscriptionCycleType.RENEWAL
        ) {
          // only handle subscription renewal payment
          const existingSubscription =
            await findSubscriptionByProviderSubscriptionId({
              provider: provider,
              subscriptionId: session.subscriptionId,
            });
          if (!existingSubscription) {
            throw new Error('subscription not found');
          }

          // handle subscription renewal payment
          await handleSubscriptionRenewal({
            subscription: existingSubscription,
            session,
          });
        } else {
          console.log('not handle subscription first payment');
        }
      } else {
        console.log('not handle one-time payment');
      }
    } else if (eventType === PaymentEventType.SUBSCRIBE_UPDATED) {
      // only handle subscription update
      if (!session.subscriptionId || !session.subscriptionInfo) {
        throw new Error('subscription id or subscription info not found');
      }

      const existingSubscription =
        await findSubscriptionByProviderSubscriptionId({
          provider: provider,
          subscriptionId: session.subscriptionId,
        });
      if (!existingSubscription) {
        throw new Error('subscription not found');
      }

      await handleSubscriptionUpdated({
        subscription: existingSubscription,
        session,
      });
    } else if (eventType === PaymentEventType.SUBSCRIBE_CANCELED) {
      // only handle subscription cancellation
      if (!session.subscriptionId || !session.subscriptionInfo) {
        throw new Error('subscription id or subscription info not found');
      }

      const existingSubscription =
        await findSubscriptionByProviderSubscriptionId({
          provider: provider,
          subscriptionId: session.subscriptionId,
        });
      if (!existingSubscription) {
        throw new Error('subscription not found');
      }

      await handleSubscriptionCanceled({
        subscription: existingSubscription,
        session,
      });
    } else {
      log('not handling event type: ' + eventType);
    }

    log('done, returning success');
    return Response.json({
      message: 'success',
    });
  } catch (err: any) {
    console.log(`[webhook] error after ${Date.now() - startTime}ms:`, err.message);
    return Response.json(
      {
        message: `handle payment notify failed: ${err.message}`,
      },
      {
        status: 500,
      }
    );
  }
}

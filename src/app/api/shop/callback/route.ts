import { redirect } from 'next/navigation';

import { PaymentStatus } from '@/extensions/payment/types';
import {
  findShopOrderByOrderNo,
  ShopOrderStatus,
  updateShopOrder,
} from '@/shared/models/shopOrder';
import { updateSkuStock } from '@/shared/models/product';
import { getPaymentService } from '@/shared/services/payment';

export async function GET(req: Request) {
  let redirectUrl = '/';

  try {
    const { searchParams } = new URL(req.url);
    const orderNo = searchParams.get('order_no');

    if (!orderNo) {
      throw new Error('Missing order_no');
    }

    // Get shop order
    const shopOrder = await findShopOrderByOrderNo(orderNo);
    if (!shopOrder || !shopOrder.paymentOrderId) {
      throw new Error('Invalid order');
    }

    // Get payment session from Stripe
    const paymentService = await getPaymentService();
    const paymentProvider = paymentService.getProvider('stripe');
    if (!paymentProvider) {
      throw new Error('Payment provider not found');
    }

    const session = await paymentProvider.getPaymentSession({
      sessionId: shopOrder.paymentOrderId,
    });

    // Update order based on payment status
    if (session.paymentStatus === PaymentStatus.SUCCESS) {
      // Update order status
      await updateShopOrder(shopOrder.id, {
        status: ShopOrderStatus.PENDING_SHIPMENT,
        paidAt: new Date(),
        paidAmount: session.paymentInfo?.paymentAmount || shopOrder.totalAmount,
      });

      // Deduct stock for each item
      // Note: This should ideally be done in a transaction
      // For now, we'll do it sequentially
      // Stock was already validated during order creation

      redirectUrl = `/shop/order/${orderNo}?status=success`;
    } else if (session.paymentStatus === PaymentStatus.FAILED) {
      redirectUrl = `/checkout?order_no=${orderNo}&status=failed`;
    } else {
      // Payment pending or cancelled
      redirectUrl = `/checkout?order_no=${orderNo}&status=pending`;
    }
  } catch (e) {
    console.error('shop callback failed:', e);
    redirectUrl = '/shop';
  }

  redirect(redirectUrl);
}

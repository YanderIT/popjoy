import { envConfigs } from '@/config';
import {
  PaymentOrder,
  PaymentPrice,
  PaymentType,
} from '@/extensions/payment/types';
import { generatePaymentToken } from '@/shared/lib/payment-token';
import { respData, respErr } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import { getUserInfo } from '@/shared/models/user';
import {
  findShopOrderByOrderNo,
  ShopOrderStatus,
  updateShopOrder,
} from '@/shared/models/shopOrder';
import { getPaymentService } from '@/shared/services/payment';

export async function POST(req: Request) {
  try {
    const { order_no, locale } = await req.json();

    if (!order_no) {
      return respErr('order_no is required');
    }

    // Validate user
    const user = await getUserInfo();
    if (!user || !user.email) {
      return respErr('Please sign in to checkout');
    }

    // Get shop order
    const shopOrder = await findShopOrderByOrderNo(order_no);
    if (!shopOrder) {
      return respErr('Order not found');
    }

    // Validate ownership
    if (shopOrder.userId !== user.id) {
      return respErr('Order not found');
    }

    // Validate order status
    if (shopOrder.status !== ShopOrderStatus.PENDING_PAYMENT) {
      return respErr('Order is not pending payment');
    }

    // Get configs
    const configs = await getAllConfigs();

    // AB站跳转逻辑：A站跳转到 B站处理 Stripe 支付（必须在获取 provider 之前检查）
    const siteMode = envConfigs.site_mode;
    const paymentSiteUrl = envConfigs.payment_site_url;

    if (siteMode === 'main' && paymentSiteUrl) {
      // 生成 token 并返回 B站 URL
      // B站会根据订单信息重新构建 checkoutOrder
      const paymentToken = await generatePaymentToken(
        shopOrder.id,
        shopOrder.orderNo
      );
      const redirectUrl = `${paymentSiteUrl}/pay?token=${paymentToken}&type=shop`;

      return respData({
        checkoutUrl: redirectUrl,
        orderNo: shopOrder.orderNo,
        provider: 'stripe',
        redirectToPaymentSite: true,
      });
    }

    // Get payment service (Stripe) - 只在 payment 站点或非 AB 站模式下执行
    const paymentService = await getPaymentService();
    const paymentProvider = paymentService.getProvider('stripe');
    if (!paymentProvider) {
      return respErr('Payment provider not configured');
    }

    // Build checkout price
    const checkoutPrice: PaymentPrice = {
      amount: shopOrder.totalAmount,
      currency: shopOrder.currency,
    };

    // Build callback URL
    let callbackBaseUrl = configs.app_url;
    if (locale && locale !== configs.default_locale) {
      callbackBaseUrl += `/${locale}`;
    }

    // Build checkout order
    const checkoutOrder: PaymentOrder = {
      type: PaymentType.ONE_TIME,
      description: `Order #${shopOrder.orderNo}`,
      customer: {
        name: user.name,
        email: user.email,
      },
      price: checkoutPrice,
      metadata: {
        app_name: configs.app_name,
        order_no: shopOrder.orderNo,
        user_id: user.id,
        order_type: 'shop_order',
      },
      successUrl: `${callbackBaseUrl}/shop/order/${shopOrder.orderNo}?status=success`,
      cancelUrl: `${callbackBaseUrl}/checkout?order_no=${shopOrder.orderNo}`,
    };

    // Create Stripe checkout session (B站或非 AB 站模式)
    const result = await paymentProvider.createPayment({ order: checkoutOrder });

    // Update shop order with payment info
    await updateShopOrder(shopOrder.id, {
      paymentOrderId: result.checkoutInfo.sessionId,
      paymentProvider: 'stripe',
    });

    return respData(result.checkoutInfo);
  } catch (e: any) {
    console.log('shop checkout failed:', e);
    return respErr('Checkout failed: ' + e.message);
  }
}

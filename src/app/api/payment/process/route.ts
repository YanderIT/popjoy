import { envConfigs } from '@/config';
import { PaymentOrder } from '@/extensions/payment/types';
import { verifyPaymentToken } from '@/shared/lib/payment-token';
import { respData, respErr } from '@/shared/lib/resp';
import { getAllConfigs } from '@/shared/models/config';
import {
  findOrderById,
  OrderStatus,
  updateOrderByOrderNo,
} from '@/shared/models/order';
import {
  findShopOrderById,
  ShopOrderStatus,
  updateShopOrder,
} from '@/shared/models/shopOrder';
import { getPaymentService } from '@/shared/services/payment';

export async function POST(req: Request) {
  try {
    // 检查站点模式：此 API 只在 B站 (payment) 可用
    const siteMode = envConfigs.site_mode;
    if (siteMode !== 'payment') {
      return respErr('This endpoint is only available on payment site');
    }

    const { token, type } = await req.json();
    if (!token) {
      return respErr('Token is required');
    }

    // 验证 token
    const payload = await verifyPaymentToken(token);
    if (!payload) {
      return respErr('Invalid or expired token');
    }

    const { orderId, orderNo } = payload;

    // 获取配置
    const configs = await getAllConfigs();
    const mainSiteUrl = envConfigs.main_site_url || configs.app_url;

    // 获取支付服务（B站会加载 Stripe）
    const paymentService = await getPaymentService();
    const paymentProvider = paymentService.getProvider('stripe');

    if (!paymentProvider) {
      return respErr('Stripe payment provider not available');
    }

    // 根据订单类型处理
    if (type === 'shop') {
      return await processShopOrder(
        orderId,
        orderNo,
        mainSiteUrl,
        paymentProvider
      );
    } else {
      return await processPaymentOrder(
        orderId,
        orderNo,
        mainSiteUrl,
        paymentProvider
      );
    }
  } catch (e: any) {
    console.error('Payment process failed:', e);
    return respErr('Payment process failed: ' + e.message);
  }
}

// 处理普通支付订单
async function processPaymentOrder(
  orderId: string,
  orderNo: string,
  mainSiteUrl: string,
  paymentProvider: any
) {
  // 查询订单
  const order = await findOrderById(orderId);
  if (!order) {
    return respErr('Order not found');
  }

  // 验证订单号匹配
  if (order.orderNo !== orderNo) {
    return respErr('Order mismatch');
  }

  // 检查订单状态：只处理 pending 状态的订单
  if (order.status !== OrderStatus.PENDING) {
    // 如果订单已经创建了 checkout session，返回已有的 URL
    if (order.status === OrderStatus.CREATED && order.checkoutUrl) {
      return respData({
        checkoutUrl: order.checkoutUrl,
        orderNo: order.orderNo,
        provider: order.paymentProvider,
      });
    }
    return respErr(`Order status is ${order.status}, cannot process`);
  }

  // 解析原始 checkout 信息
  let checkoutOrder: PaymentOrder;
  try {
    checkoutOrder = JSON.parse(order.checkoutInfo || '{}');
  } catch {
    return respErr('Invalid checkout info');
  }

  // 修改回调 URL 指向 A站
  checkoutOrder.successUrl = `${mainSiteUrl}/api/payment/callback?order_no=${orderNo}`;
  checkoutOrder.cancelUrl = `${mainSiteUrl}/pricing`;

  // 如果有 callbackUrl，也指向 A站
  if (order.callbackUrl) {
    try {
      const callbackPath = new URL(order.callbackUrl).pathname;
      checkoutOrder.cancelUrl = `${mainSiteUrl}${callbackPath}`;
    } catch {
      // 如果 callbackUrl 不是有效 URL，使用默认值
    }
  }

  try {
    // 创建 Stripe Checkout Session
    const result = await paymentProvider.createPayment({
      order: checkoutOrder,
    });

    // 更新订单状态
    await updateOrderByOrderNo(orderNo, {
      status: OrderStatus.CREATED,
      checkoutInfo: JSON.stringify(result.checkoutParams),
      checkoutResult: JSON.stringify(result.checkoutResult),
      checkoutUrl: result.checkoutInfo.checkoutUrl,
      paymentSessionId: result.checkoutInfo.sessionId,
      paymentProvider: result.provider,
    });

    return respData({
      checkoutUrl: result.checkoutInfo.checkoutUrl,
      orderNo: orderNo,
      provider: result.provider,
    });
  } catch (e: any) {
    // 更新订单状态为失败
    await updateOrderByOrderNo(orderNo, {
      status: OrderStatus.COMPLETED,
      checkoutInfo: JSON.stringify(checkoutOrder),
    });

    return respErr('Stripe checkout creation failed: ' + e.message);
  }
}

// 处理 Shop 订单
async function processShopOrder(
  orderId: string,
  orderNo: string,
  mainSiteUrl: string,
  paymentProvider: any
) {
  // 查询 Shop 订单
  const shopOrder = await findShopOrderById(orderId);
  if (!shopOrder) {
    return respErr('Shop order not found');
  }

  // 验证订单号匹配
  if (shopOrder.orderNo !== orderNo) {
    return respErr('Order mismatch');
  }

  // 检查订单状态
  if (shopOrder.status !== ShopOrderStatus.PENDING_PAYMENT) {
    return respErr(`Order status is ${shopOrder.status}, cannot process`);
  }

  // 直接从订单数据构建 checkoutOrder（不依赖 checkoutInfo 字段）
  const configs = await getAllConfigs();
  const checkoutOrder: PaymentOrder = {
    type: 'one_time' as any,
    description: `Order #${shopOrder.orderNo}`,
    customer: {
      email: shopOrder.userEmail || '',
    },
    price: {
      amount: shopOrder.totalAmount,
      currency: shopOrder.currency,
    },
    metadata: {
      app_name: configs.app_name,
      order_no: shopOrder.orderNo,
      user_id: shopOrder.userId,
      order_type: 'shop_order',
    },
    successUrl: `${mainSiteUrl}/shop/order/${orderNo}?status=success`,
    cancelUrl: `${mainSiteUrl}/checkout?order_no=${orderNo}`,
  };

  try {
    // 创建 Stripe Checkout Session
    const result = await paymentProvider.createPayment({
      order: checkoutOrder,
    });

    // 更新 Shop 订单
    await updateShopOrder(shopOrder.id, {
      paymentOrderId: result.checkoutInfo.sessionId,
      paymentProvider: 'stripe',
    });

    return respData({
      checkoutUrl: result.checkoutInfo.checkoutUrl,
      orderNo: orderNo,
      provider: result.provider,
    });
  } catch (e: any) {
    return respErr('Stripe checkout creation failed: ' + e.message);
  }
}

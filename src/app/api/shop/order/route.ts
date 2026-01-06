import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import {
  createShopOrderWithItems,
  ShopOrderStatus,
} from '@/shared/models/shopOrder';
import { findSkuById } from '@/shared/models/product';

interface OrderItemInput {
  skuId: string;
  productId: string;
  quantity: number;
  productName: string;
  productImage: string | null;
}

interface ShippingAddress {
  recipientName: string;
  phone: string;
  country: string;
  state?: string;
  city: string;
  street: string;
  postalCode?: string;
}

export async function POST(req: Request) {
  try {
    const { items, shippingAddress, buyerNote } = (await req.json()) as {
      items: OrderItemInput[];
      shippingAddress: ShippingAddress;
      buyerNote?: string;
    };

    // Validate user
    const user = await getUserInfo();
    if (!user || !user.email) {
      return respErr('Please sign in to place an order');
    }

    // Validate items
    if (!items || items.length === 0) {
      return respErr('No items in order');
    }

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.recipientName ||
      !shippingAddress.phone ||
      !shippingAddress.country ||
      !shippingAddress.city ||
      !shippingAddress.street
    ) {
      return respErr('Invalid shipping address');
    }

    // Validate items and calculate totals (server-side validation)
    let subtotalAmount = 0;
    let currency = 'USD';
    const orderItems: {
      productId: string;
      productSku: string;
      productName: string;
      productImage: string | null;
      unitPrice: number;
      quantity: number;
      totalPrice: number;
      currency: string;
    }[] = [];

    for (const item of items) {
      const sku = await findSkuById(item.skuId);
      if (!sku) {
        return respErr(`SKU not found: ${item.skuId}`);
      }

      if (sku.status !== 'active') {
        return respErr(`SKU is not available: ${item.skuId}`);
      }

      if (sku.stock < item.quantity) {
        return respErr(`Insufficient stock for ${item.productName}`);
      }

      const totalPrice = sku.price * item.quantity;
      subtotalAmount += totalPrice;

      orderItems.push({
        productId: item.productId,
        productSku: sku.sku,
        productName: item.productName,
        productImage: item.productImage,
        unitPrice: sku.price,
        quantity: item.quantity,
        totalPrice,
        currency,
      });
    }

    // Create order with items
    const order = await createShopOrderWithItems(
      {
        userId: user.id,
        userEmail: user.email,
        status: ShopOrderStatus.PENDING_PAYMENT,
        subtotalAmount,
        shippingAmount: 0, // TODO: Calculate shipping
        discountAmount: 0,
        totalAmount: subtotalAmount,
        currency,
        shippingAddress: JSON.stringify(shippingAddress),
        buyerNote,
      },
      orderItems
    );

    return respData({
      orderNo: order.orderNo,
      totalAmount: order.totalAmount,
      currency: order.currency,
    });
  } catch (e: any) {
    console.log('create shop order failed:', e);
    return respErr('Failed to create order: ' + e.message);
  }
}

import { and, count, desc, eq, isNull, like } from 'drizzle-orm';

import { db } from '@/core/db';
import { shopOrder, shopOrderItem, user } from '@/config/db/schema';
import { getUuid } from '@/shared/lib/hash';

// Types
export type ShopOrder = typeof shopOrder.$inferSelect;
export type NewShopOrder = typeof shopOrder.$inferInsert;
export type ShopOrderItem = typeof shopOrderItem.$inferSelect;
export type NewShopOrderItem = typeof shopOrderItem.$inferInsert;

export enum ShopOrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_SHIPMENT = 'pending_shipment',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

// Full order with items
export type ShopOrderWithItems = ShopOrder & {
  items: ShopOrderItem[];
};

// ============================================
// Shop Order Operations
// ============================================

export async function createShopOrder(order: NewShopOrder): Promise<ShopOrder> {
  const [result] = await db().insert(shopOrder).values(order).returning();
  return result;
}

export async function createShopOrderWithItems(
  order: Omit<NewShopOrder, 'id' | 'orderNo'>,
  items: Omit<NewShopOrderItem, 'id' | 'orderId'>[]
): Promise<ShopOrderWithItems> {
  const orderId = getUuid();
  const orderNo = `SO${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const orderData: NewShopOrder = {
    ...order,
    id: orderId,
    orderNo,
  };

  const [createdOrder] = await db().insert(shopOrder).values(orderData).returning();

  const orderItems: NewShopOrderItem[] = items.map((item) => ({
    ...item,
    id: getUuid(),
    orderId,
  }));

  const createdItems = await db().insert(shopOrderItem).values(orderItems).returning();

  return {
    ...createdOrder,
    items: createdItems,
  };
}

export async function findShopOrderById(id: string): Promise<ShopOrder | undefined> {
  const [result] = await db()
    .select()
    .from(shopOrder)
    .where(eq(shopOrder.id, id));
  return result;
}

export async function findShopOrderByOrderNo(orderNo: string): Promise<ShopOrder | undefined> {
  const [result] = await db()
    .select()
    .from(shopOrder)
    .where(eq(shopOrder.orderNo, orderNo));
  return result;
}

export async function findShopOrderByOrderNoWithItems(orderNo: string): Promise<ShopOrderWithItems | undefined> {
  const order = await findShopOrderByOrderNo(orderNo);
  if (!order) return undefined;

  const items = await getShopOrderItems(order.id);
  return { ...order, items };
}

export async function getShopOrderItems(orderId: string): Promise<ShopOrderItem[]> {
  return db()
    .select()
    .from(shopOrderItem)
    .where(eq(shopOrderItem.orderId, orderId));
}

export async function getShopOrdersByUserId(
  userId: string,
  options?: { page?: number; limit?: number; status?: ShopOrderStatus }
): Promise<ShopOrder[]> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const offset = (page - 1) * limit;

  return db()
    .select()
    .from(shopOrder)
    .where(
      and(
        eq(shopOrder.userId, userId),
        options?.status ? eq(shopOrder.status, options.status) : undefined,
        isNull(shopOrder.deletedAt)
      )
    )
    .orderBy(desc(shopOrder.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateShopOrder(
  id: string,
  data: Partial<NewShopOrder>
): Promise<ShopOrder> {
  const [result] = await db()
    .update(shopOrder)
    .set(data)
    .where(eq(shopOrder.id, id))
    .returning();
  return result;
}

export async function updateShopOrderByOrderNo(
  orderNo: string,
  data: Partial<NewShopOrder>
): Promise<ShopOrder> {
  const [result] = await db()
    .update(shopOrder)
    .set(data)
    .where(eq(shopOrder.orderNo, orderNo))
    .returning();
  return result;
}

export async function cancelShopOrder(
  id: string,
  reason?: string
): Promise<ShopOrder> {
  return updateShopOrder(id, {
    status: ShopOrderStatus.CANCELED,
    canceledAt: new Date(),
    cancelReason: reason,
  });
}

// ============================================
// Admin Operations
// ============================================

export type ShopOrderWithUser = ShopOrder & {
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
};

export async function getShopOrders(options?: {
  page?: number;
  limit?: number;
  status?: ShopOrderStatus;
  orderNo?: string;
  getUser?: boolean;
}): Promise<ShopOrderWithUser[]> {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 30;
  const offset = (page - 1) * limit;

  const conditions = [isNull(shopOrder.deletedAt)];

  if (options?.status) {
    conditions.push(eq(shopOrder.status, options.status));
  }

  if (options?.orderNo) {
    conditions.push(like(shopOrder.orderNo, `%${options.orderNo}%`));
  }

  if (options?.getUser) {
    const results = await db()
      .select({
        order: shopOrder,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(shopOrder)
      .leftJoin(user, eq(shopOrder.userId, user.id))
      .where(and(...conditions))
      .orderBy(desc(shopOrder.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((r: { order: ShopOrder; user: ShopOrderWithUser['user'] }) => ({
      ...r.order,
      user: r.user,
    }));
  }

  return db()
    .select()
    .from(shopOrder)
    .where(and(...conditions))
    .orderBy(desc(shopOrder.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getShopOrdersCount(options?: {
  status?: ShopOrderStatus;
  orderNo?: string;
}): Promise<number> {
  const conditions = [isNull(shopOrder.deletedAt)];

  if (options?.status) {
    conditions.push(eq(shopOrder.status, options.status));
  }

  if (options?.orderNo) {
    conditions.push(like(shopOrder.orderNo, `%${options.orderNo}%`));
  }

  const [result] = await db()
    .select({ count: count() })
    .from(shopOrder)
    .where(and(...conditions));

  return result?.count ?? 0;
}

export async function shipOrder(
  orderNo: string,
  data: {
    shippingCarrier: string;
    trackingNumber: string;
  }
): Promise<ShopOrder> {
  return updateShopOrderByOrderNo(orderNo, {
    shippingCarrier: data.shippingCarrier,
    trackingNumber: data.trackingNumber,
    status: ShopOrderStatus.SHIPPED,
    shippedAt: new Date(),
  });
}

export async function getShopOrdersByUserIdWithItems(
  userId: string
): Promise<ShopOrderWithItems[]> {
  const orders = await getShopOrdersByUserId(userId);

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await getShopOrderItems(order.id);
      return { ...order, items };
    })
  );

  return ordersWithItems;
}

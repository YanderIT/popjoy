import { and, desc, eq, isNull } from 'drizzle-orm';

import { db } from '@/core/db';
import { shopOrder, shopOrderItem } from '@/config/db/schema';
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

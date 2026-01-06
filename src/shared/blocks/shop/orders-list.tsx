import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';

import { getShopOrdersByUserId } from '@/shared/models/shopOrder';
import { getUserInfo } from '@/shared/models/user';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-yellow-600 bg-yellow-50' },
  pending_shipment: { label: 'Processing', color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'Shipped', color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50' },
  completed: { label: 'Completed', color: 'text-green-600 bg-green-50' },
  canceled: { label: 'Canceled', color: 'text-red-600 bg-red-50' },
  refunded: { label: 'Refunded', color: 'text-gray-600 bg-gray-50' },
};

export async function OrdersList() {
  const user = await getUserInfo();
  if (!user) {
    redirect('/auth/sign-in?redirect=/shop/orders');
  }

  const orders = await getShopOrdersByUserId(user.id);

  const formatPrice = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">No orders yet</p>
        <p className="mt-1 text-muted-foreground">
          When you place an order, it will appear here.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const statusInfo = STATUS_LABELS[order.status] || {
          label: order.status,
          color: 'text-gray-600 bg-gray-50',
        };

        return (
          <Link
            key={order.id}
            href={`/shop/order/${order.orderNo}`}
            className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">Order #{order.orderNo}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
                <p className="mt-2 font-semibold">
                  {formatPrice(order.totalAmount, order.currency)}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

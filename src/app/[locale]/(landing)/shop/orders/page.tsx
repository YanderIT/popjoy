import { Suspense } from 'react';
import { OrdersList } from '@/shared/blocks/shop/orders-list';

export default function OrdersPage() {
  return (
    <div className="container pt-24 pb-8 md:pt-28 md:pb-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">My Orders</h1>
        <Suspense fallback={<OrdersLoading />}>
          <OrdersList />
        </Suspense>
      </div>
    </div>
  );
}

function OrdersLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-lg border p-4">
          <div className="flex justify-between">
            <div>
              <div className="h-5 w-48 rounded bg-muted" />
              <div className="mt-2 h-4 w-24 rounded bg-muted" />
            </div>
            <div className="text-right">
              <div className="h-5 w-20 rounded bg-muted" />
              <div className="mt-2 h-5 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function generateMetadata() {
  return {
    title: 'My Orders',
    description: 'View your order history',
  };
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import {
  getShopOrdersByUserIdWithItems,
  ShopOrderWithItems,
} from '@/shared/models/shopOrder';
import { getUserInfo } from '@/shared/models/user';

import { OrdersListClient } from './orders-list-client';

export async function OrdersList() {
  const t = await getTranslations('shop');
  const user = await getUserInfo();
  if (!user) {
    redirect('/auth/sign-in?redirect=/shop/orders');
  }

  const orders = await getShopOrdersByUserIdWithItems(user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border py-16 text-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground opacity-50" />
        <p className="text-lg font-medium">{t('order.no_orders')}</p>
        <p className="mt-1 text-muted-foreground">
          {t('order.no_orders_desc')}
        </p>
        <Link
          href="/"
          className="mt-6 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t('order.start_shopping')}
        </Link>
      </div>
    );
  }

  return <OrdersListClient orders={orders} />;
}

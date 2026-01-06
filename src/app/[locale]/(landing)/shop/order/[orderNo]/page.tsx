import { notFound, redirect } from 'next/navigation';

import { findShopOrderByOrderNoWithItems } from '@/shared/models/shopOrder';
import { getUserInfo } from '@/shared/models/user';
import { OrderConfirmation } from '@/shared/blocks/shop/order-confirmation';

interface PageProps {
  params: Promise<{ orderNo: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { orderNo } = await params;
  const { status } = await searchParams;

  // Check authentication
  const user = await getUserInfo();
  if (!user) {
    redirect(`/auth/sign-in?redirect=/shop/order/${orderNo}`);
  }

  // Get order
  const order = await findShopOrderByOrderNoWithItems(orderNo);
  if (!order) {
    notFound();
  }

  // Verify ownership
  if (order.userId !== user.id) {
    notFound();
  }

  const isSuccess = status === 'success';

  return <OrderConfirmation order={order as any} isSuccess={isSuccess} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { orderNo } = await params;

  return {
    title: `Order #${orderNo}`,
    description: 'View your order details',
  };
}

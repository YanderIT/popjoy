'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Package, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';

interface ShopOrderItem {
  id: string;
  productName: string;
  productImage: string | null;
  productSku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  currency: string;
}

interface ShopOrder {
  orderNo: string;
  status: string;
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number | null;
  currency: string;
  shippingAddress: string;
  shippingMethod: string | null;
  trackingNumber: string | null;
  createdAt: string;
  paidAt: string | null;
  items: ShopOrderItem[];
}

interface OrderConfirmationProps {
  order: ShopOrder;
  isSuccess?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'text-yellow-600',
  pending_shipment: 'text-blue-600',
  shipped: 'text-purple-600',
  delivered: 'text-green-600',
  completed: 'text-green-600',
  canceled: 'text-red-600',
  refunded: 'text-gray-600',
};

const STATUS_KEYS: Record<string, string> = {
  pending_payment: 'pending',
  pending_shipment: 'processing',
  shipped: 'shipped',
  delivered: 'delivered',
  completed: 'completed',
  canceled: 'canceled',
  refunded: 'refunded',
};

export function OrderConfirmation({ order, isSuccess }: OrderConfirmationProps) {
  const t = useTranslations('shop');
  const formatPrice = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseAddress = (addressStr: string) => {
    try {
      return JSON.parse(addressStr);
    } catch {
      return null;
    }
  };

  const shippingAddress = parseAddress(order.shippingAddress);
  const statusKey = STATUS_KEYS[order.status] || order.status;
  const statusColor = STATUS_COLORS[order.status] || 'text-gray-600';
  const statusLabel = t(`order.status.${statusKey}`);

  return (
    <div className="container pt-24 pb-8 md:pt-28 md:pb-12">
      {isSuccess && (
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">{t('order.order_placed')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('order.thank_you')}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border">
          {/* Order Header */}
          <div className="border-b p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{t('order.order_number', { orderNo: order.orderNo })}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('order.placed_on', { date: formatDate(order.createdAt) })}
                </p>
              </div>
              <div className="text-right">
                <span className={`font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
                {order.trackingNumber && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('order.tracking', { number: order.trackingNumber })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-b p-6">
            <h3 className="mb-4 flex items-center gap-2 font-medium">
              <Package className="h-5 w-5" />
              {t('order.items_count', { count: order.items.length })}
            </h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.productImage || '/imgs/cases/1.png'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.productName}</h4>
                    <p className="text-sm text-muted-foreground">{t('order.sku', { sku: item.productSku })}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.unitPrice, item.currency)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right font-medium">
                    {formatPrice(item.totalPrice, item.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="border-b p-6">
              <h3 className="mb-4 flex items-center gap-2 font-medium">
                <Truck className="h-5 w-5" />
                {t('order.shipping_address')}
              </h3>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{shippingAddress.recipientName}</p>
                <p>{shippingAddress.phone}</p>
                <p>{shippingAddress.street}</p>
                <p>
                  {shippingAddress.city}
                  {shippingAddress.state && `, ${shippingAddress.state}`}
                  {shippingAddress.postalCode && ` ${shippingAddress.postalCode}`}
                </p>
                <p>{shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="p-6">
            <h3 className="mb-4 font-medium">{t('checkout.order_summary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('order.subtotal')}</span>
                <span>{formatPrice(order.subtotalAmount, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('order.shipping')}</span>
                <span>
                  {order.shippingAmount === 0
                    ? t('checkout.free')
                    : formatPrice(order.shippingAmount, order.currency)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('order.discount')}</span>
                  <span>-{formatPrice(order.discountAmount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>{t('order.total')}</span>
                <span>{formatPrice(order.totalAmount, order.currency)}</span>
              </div>
              {order.paidAmount && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('order.paid')}</span>
                  <span>{formatPrice(order.paidAmount, order.currency)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">{t('order.continue_shopping')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Package, Truck } from 'lucide-react';

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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'text-yellow-600' },
  pending_shipment: { label: 'Processing', color: 'text-blue-600' },
  shipped: { label: 'Shipped', color: 'text-purple-600' },
  delivered: { label: 'Delivered', color: 'text-green-600' },
  completed: { label: 'Completed', color: 'text-green-600' },
  canceled: { label: 'Canceled', color: 'text-red-600' },
  refunded: { label: 'Refunded', color: 'text-gray-600' },
};

export function OrderConfirmation({ order, isSuccess }: OrderConfirmationProps) {
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
  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'text-gray-600' };

  return (
    <div className="container pt-24 pb-8 md:pt-28 md:pb-12">
      {isSuccess && (
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-green-100 p-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">Order Placed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order. You will receive an email confirmation shortly.
          </p>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border">
          {/* Order Header */}
          <div className="border-b p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Order #{order.orderNo}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <span className={`font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                {order.trackingNumber && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tracking: {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-b p-6">
            <h3 className="mb-4 flex items-center gap-2 font-medium">
              <Package className="h-5 w-5" />
              Items ({order.items.length})
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
                    <p className="text-sm text-muted-foreground">SKU: {item.productSku}</p>
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
                Shipping Address
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
            <h3 className="mb-4 font-medium">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotalAmount, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {order.shippingAmount === 0
                    ? 'Free'
                    : formatPrice(order.shippingAmount, order.currency)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount, order.currency)}</span>
              </div>
              {order.paidAmount && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Paid</span>
                  <span>{formatPrice(order.paidAmount, order.currency)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

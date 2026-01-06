'use client';

import { Copy, MapPin, Package, Truck } from 'lucide-react';
import { toast } from 'sonner';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Button } from '@/shared/components/ui/button';
import { ShopOrderWithItems } from '@/shared/models/shopOrder';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: {
    label: 'Pending Payment',
    color: 'text-yellow-600 bg-yellow-50',
  },
  pending_shipment: { label: 'Processing', color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'Shipped', color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50' },
  completed: { label: 'Completed', color: 'text-green-600 bg-green-50' },
  canceled: { label: 'Canceled', color: 'text-red-600 bg-red-50' },
  refunded: { label: 'Refunded', color: 'text-gray-600 bg-gray-50' },
};

interface OrdersListClientProps {
  orders: ShopOrderWithItems[];
}

export function OrdersListClient({ orders }: OrdersListClientProps) {
  const formatPrice = (cents: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const parseAddress = (addressJson: string | null) => {
    if (!addressJson) return null;
    try {
      return JSON.parse(addressJson);
    } catch {
      return null;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {orders.map((order) => {
        const statusInfo = STATUS_LABELS[order.status] || {
          label: order.status,
          color: 'text-gray-600 bg-gray-50',
        };
        const address = parseAddress(order.shippingAddress);

        return (
          <AccordionItem
            key={order.id}
            value={order.id}
            className="rounded-lg border px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex w-full flex-wrap items-center justify-between gap-4 pr-4">
                <div className="text-left">
                  <p className="font-medium">Order #{order.orderNo}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                  <p className="font-semibold">
                    {formatPrice(order.totalAmount, order.currency)}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {/* Order Items */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    Items
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-md bg-muted/50 p-2"
                      >
                        {item.productImage && (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(item.unitPrice, item.currency)} x{' '}
                            {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.totalPrice, item.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                {(order.shippingCarrier || order.trackingNumber) && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Truck className="h-4 w-4" />
                      Shipping
                    </h4>
                    <div className="rounded-md bg-muted/50 p-3">
                      <div className="flex flex-wrap items-center gap-4">
                        {order.shippingCarrier && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Carrier
                            </p>
                            <p className="text-sm font-medium">
                              {order.shippingCarrier}
                            </p>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Tracking Number
                              </p>
                              <p className="text-sm font-medium">
                                {order.trackingNumber}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                copyToClipboard(order.trackingNumber!)
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                        {order.shippedAt && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Shipped
                            </p>
                            <p className="text-sm font-medium">
                              {formatDate(order.shippedAt)}
                            </p>
                          </div>
                        )}
                        {order.deliveredAt && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Delivered
                            </p>
                            <p className="text-sm font-medium">
                              {formatDate(order.deliveredAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {address && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      Shipping Address
                    </h4>
                    <div className="rounded-md bg-muted/50 p-3 text-sm">
                      <p className="font-medium">{address.recipientName}</p>
                      <p className="text-muted-foreground">{address.phone}</p>
                      <p className="mt-1 text-muted-foreground">
                        {address.street}
                        {address.city && `, ${address.city}`}
                        {address.state && `, ${address.state}`}
                        {address.postalCode && ` ${address.postalCode}`}
                        {address.country && `, ${address.country}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {formatPrice(order.subtotalAmount, order.currency)}
                    </span>
                  </div>
                  {order.shippingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {formatPrice(order.shippingAmount, order.currency)}
                      </span>
                    </div>
                  )}
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>
                        -{formatPrice(order.discountAmount, order.currency)}
                      </span>
                    </div>
                  )}
                  <div className="mt-1 flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      {formatPrice(order.totalAmount, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

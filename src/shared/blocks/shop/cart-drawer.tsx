'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { useCart } from '@/shared/contexts/cart';
import { usePrice } from '@/shared/hooks/use-price';
import { CartIcon } from './cart-icon';

export function CartDrawer() {
  const t = useTranslations('shop');
  const { items, isLoading, removeItem, updateQuantity, getSubtotal, getCurrency, isDrawerOpen, setDrawerOpen } = useCart();
  const { formatPrice } = usePrice();

  const subtotal = getSubtotal();
  const currency = getCurrency();

  return (
    <>
      <CartIcon onClick={() => setDrawerOpen(true)} />

      <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('cart.title')}
            </SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 opacity-50" />
              <p>{t('cart.empty')}</p>
              <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                {t('cart.continue_shopping')}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.skuId}
                      className="flex gap-4 rounded-lg border p-3"
                    >
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={item.productImage || '/imgs/cases/1.png'}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium line-clamp-1">
                              {item.productName}
                            </h4>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {Object.values(item.skuAttributes).join(' / ')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.skuId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.skuId, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.skuId, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity, item.currency)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {t('cart.each', { price: formatPrice(item.price, item.currency) })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <SheetFooter className="border-t pt-4">
                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between text-base font-medium">
                    <span>{t('cart.subtotal')}</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('cart.shipping_note')}
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    asChild
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Link href="/checkout">{t('cart.checkout')}</Link>
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

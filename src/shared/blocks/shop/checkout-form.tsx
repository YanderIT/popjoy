'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useCart } from '@/shared/contexts/cart';
import { useAppContext } from '@/shared/contexts/app';
import { usePrice } from '@/shared/hooks/use-price';

interface ShippingAddress {
  recipientName: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  street: string;
  postalCode: string;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'SG', name: 'Singapore' },
];

export function CheckoutForm() {
  const router = useRouter();
  const { user, setIsShowSignModal } = useAppContext();
  const { items, getSubtotal, getCurrency, clearCart, isLoading: cartLoading } = useCart();
  const { formatPrice } = usePrice();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState<ShippingAddress>({
    recipientName: '',
    phone: '',
    country: 'US',
    state: '',
    city: '',
    street: '',
    postalCode: '',
  });

  const subtotal = getSubtotal();
  const shipping = 0; // Free shipping for now
  const total = subtotal + shipping;
  const currency = getCurrency();

  // Redirect if no items
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      router.push('/');
    }
  }, [cartLoading, items.length, router]);

  // Pre-fill name from user
  useEffect(() => {
    if (user?.name && !address.recipientName) {
      setAddress((prev) => ({ ...prev, recipientName: user.name }));
    }
  }, [user?.name]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): boolean => {
    if (!address.recipientName.trim()) {
      toast.error('Please enter recipient name');
      return false;
    }
    if (!address.phone.trim()) {
      toast.error('Please enter phone number');
      return false;
    }
    if (!address.country) {
      toast.error('Please select country');
      return false;
    }
    if (!address.city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!address.street.trim()) {
      toast.error('Please enter street address');
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (!validateAddress()) return;

    setIsSubmitting(true);

    try {
      // Step 1: Create shop order
      const orderRes = await fetch('/api/shop/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            skuId: item.skuId,
            productId: item.productId,
            quantity: item.quantity,
            productName: item.productName,
            productImage: item.productImage,
          })),
          shippingAddress: address,
        }),
      });

      const orderData = await orderRes.json();
      if (orderData.code !== 0) {
        throw new Error(orderData.message);
      }

      const { orderNo } = orderData.data;

      // Step 2: Create Stripe checkout session
      const checkoutRes = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_no: orderNo,
          locale: 'en',
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (checkoutData.code !== 0) {
        throw new Error(checkoutData.message);
      }

      // Clear cart after successful order creation
      clearCart();

      // Redirect to Stripe checkout
      if (checkoutData.data.checkoutUrl) {
        window.location.href = checkoutData.data.checkoutUrl;
      }
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container pt-24 pb-8 md:pt-28 md:pb-12">
      <h1 className="mb-8 text-2xl font-bold md:text-3xl">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Shipping Address Form */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
            <div className="space-y-4 rounded-lg border p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    value={address.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={address.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={address.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State or province"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder="Street address, apartment, suite, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={address.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="Postal code"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
          <div className="rounded-lg border p-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.skuId} className="flex gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={item.productImage || '/imgs/cases/1.png'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{item.productName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {Object.values(item.skuAttributes).join(' / ')}
                    </p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : user ? (
                'Place Order'
              ) : (
                'Sign in to Checkout'
              )}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

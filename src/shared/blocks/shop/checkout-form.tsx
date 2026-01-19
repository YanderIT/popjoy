'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
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

interface SavedAddress {
  id: string;
  recipientName: string;
  phone: string;
  country: string;
  state: string | null;
  city: string;
  district: string | null;
  street: string;
  postalCode: string | null;
  label: string | null;
  isDefault: boolean;
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
  const t = useTranslations('shop');
  const router = useRouter();
  const { user, setIsShowSignModal } = useAppContext();
  const { items, getSubtotal, getCurrency, clearCart, isLoading: cartLoading } = useCart();
  const { formatPrice } = usePrice();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [addressLoading, setAddressLoading] = useState(true);
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

  // Load saved addresses when user is logged in
  useEffect(() => {
    if (user) {
      setAddressLoading(true);
      fetch('/api/user/address')
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 0 && data.data.addresses.length > 0) {
            setSavedAddresses(data.data.addresses);
            // Auto-select default address
            const defaultAddr = data.data.addresses.find((a: SavedAddress) => a.isDefault);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setAddress({
                recipientName: defaultAddr.recipientName,
                phone: defaultAddr.phone,
                country: defaultAddr.country,
                state: defaultAddr.state || '',
                city: defaultAddr.city,
                street: defaultAddr.street,
                postalCode: defaultAddr.postalCode || '',
              });
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load addresses:', err);
        })
        .finally(() => setAddressLoading(false));
    } else {
      setAddressLoading(false);
    }
  }, [user]);

  // Pre-fill name from user (only when entering new address)
  useEffect(() => {
    if (user?.name && !address.recipientName && selectedAddressId === 'new') {
      setAddress((prev) => ({ ...prev, recipientName: user.name }));
    }
  }, [user?.name, selectedAddressId]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === 'new') {
      // Clear form for new address entry
      setAddress({
        recipientName: user?.name || '',
        phone: '',
        country: 'US',
        state: '',
        city: '',
        street: '',
        postalCode: '',
      });
    } else {
      // Fill form with selected saved address
      const addr = savedAddresses.find((a) => a.id === addressId);
      if (addr) {
        setAddress({
          recipientName: addr.recipientName,
          phone: addr.phone,
          country: addr.country,
          state: addr.state || '',
          city: addr.city,
          street: addr.street,
          postalCode: addr.postalCode || '',
        });
      }
    }
  };

  const validateAddress = (): boolean => {
    if (!address.recipientName.trim()) {
      toast.error(t('checkout.validation.name_required'));
      return false;
    }
    if (!address.phone.trim()) {
      toast.error(t('checkout.validation.phone_required'));
      return false;
    }
    if (!address.country) {
      toast.error(t('checkout.validation.country_required'));
      return false;
    }
    if (!address.city.trim()) {
      toast.error(t('checkout.validation.city_required'));
      return false;
    }
    if (!address.street.trim()) {
      toast.error(t('checkout.validation.street_required'));
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
      toast.error(error.message || t('checkout.failed'));
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
      <h1 className="mb-8 text-2xl font-bold md:text-3xl">{t('checkout.title')}</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Shipping Address Form */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">{t('checkout.shipping_address')}</h2>

            {/* Saved Address Selector */}
            {user && addressLoading && (
              <div className="mb-4 flex items-center justify-center rounded-lg border p-6">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">{t('checkout.loading_addresses')}</span>
              </div>
            )}

            {user && !addressLoading && savedAddresses.length > 0 && (
              <div className="mb-4">
                <RadioGroup value={selectedAddressId} onValueChange={handleAddressSelect}>
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                        selectedAddressId === addr.id ? 'border-primary bg-muted/30' : ''
                      }`}
                      onClick={() => handleAddressSelect(addr.id)}
                    >
                      <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{addr.recipientName}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-muted-foreground">{addr.phone}</span>
                          {addr.isDefault && (
                            <Badge variant="secondary" className="ml-1">
                              {t('checkout.default_badge')}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {addr.street}, {addr.city}
                          {addr.state ? `, ${addr.state}` : ''}, {addr.country}
                          {addr.postalCode ? ` ${addr.postalCode}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div
                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                      selectedAddressId === 'new' ? 'border-primary bg-muted/30' : ''
                    }`}
                    onClick={() => handleAddressSelect('new')}
                  >
                    <RadioGroupItem value="new" id="new-address" />
                    <Label htmlFor="new-address" className="cursor-pointer font-medium">
                      {t('checkout.enter_new_address')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Address Form - shown when entering new address or no saved addresses */}
            {(selectedAddressId === 'new' || savedAddresses.length === 0) && !addressLoading && (
            <div className="space-y-4 rounded-lg border p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">{t('checkout.recipient_name')} *</Label>
                  <Input
                    id="recipientName"
                    value={address.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    placeholder={t('checkout.placeholders.name')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('checkout.phone')} *</Label>
                  <Input
                    id="phone"
                    value={address.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('checkout.placeholders.phone')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">{t('checkout.country')} *</Label>
                <Select
                  value={address.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('checkout.select_country')} />
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
                  <Label htmlFor="state">{t('checkout.state')}</Label>
                  <Input
                    id="state"
                    value={address.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder={t('checkout.placeholders.state')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t('checkout.city')} *</Label>
                  <Input
                    id="city"
                    value={address.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder={t('checkout.placeholders.city')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">{t('checkout.street')} *</Label>
                <Input
                  id="street"
                  value={address.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  placeholder={t('checkout.street_placeholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('checkout.postal_code')}</Label>
                <Input
                  id="postalCode"
                  value={address.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder={t('checkout.placeholders.postal_code')}
                />
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t('checkout.order_summary')}</h2>
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
                    <p className="text-xs text-muted-foreground">{t('checkout.qty', { quantity: item.quantity })}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>{t('checkout.subtotal')}</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('checkout.shipping')}</span>
                <span>{shipping === 0 ? t('checkout.free') : formatPrice(shipping, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>{t('checkout.total')}</span>
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
                  {t('checkout.processing')}
                </>
              ) : user ? (
                t('checkout.place_order')
              ) : (
                t('checkout.sign_in_to_checkout')
              )}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              {t('checkout.terms_notice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

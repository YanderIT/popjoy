'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Trash2, Star, Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';

interface PaymentMethodCard {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

interface PaymentMethod {
  id: string;
  type: string;
  card: PaymentMethodCard;
  isDefault: boolean;
  createdAt: string;
}

const cardBrandIcons: Record<string, string> = {
  visa: '💳 Visa',
  mastercard: '💳 Mastercard',
  amex: '💳 American Express',
  discover: '💳 Discover',
  diners: '💳 Diners Club',
  jcb: '💳 JCB',
  unionpay: '💳 UnionPay',
};

export default function PaymentMethodsPage() {
  const t = useTranslations('settings.payment-methods');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [noCustomer, setNoCustomer] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/payment-methods');
      const data = await response.json();

      if (data.code === 0) {
        setPaymentMethods(data.data.paymentMethods || []);
        setNoCustomer(data.data.noCustomer || false);
      } else {
        toast.error(data.message || 'Failed to load payment methods');
      }
    } catch (error) {
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/user/payment-methods?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.code === 0) {
        toast.success(t('messages.delete_success'));
        await fetchPaymentMethods();
      } else {
        toast.error(data.message || t('messages.delete_error'));
      }
    } catch (error) {
      toast.error(t('messages.delete_error'));
    } finally {
      setActionLoading(null);
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/user/payment-methods/default', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId: id }),
      });
      const data = await response.json();

      if (data.code === 0) {
        toast.success(t('messages.set_default_success'));
        await fetchPaymentMethods();
      } else {
        toast.error(data.message || t('messages.set_default_error'));
      }
    } catch (error) {
      toast.error(t('messages.set_default_error'));
    } finally {
      setActionLoading(null);
    }
  };

  const formatExpiry = (month: number, year: number) => {
    return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
  };

  const getCardBrandDisplay = (brand: string) => {
    return cardBrandIcons[brand.toLowerCase()] || `💳 ${brand}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {noCustomer ? (
            <div className="py-8 text-center text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t('messages.no_customer')}</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CreditCard className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t('empty_message')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getCardBrandDisplay(pm.card.brand).split(' ')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getCardBrandDisplay(pm.card.brand).split(' ').slice(1).join(' ')}
                        </span>
                        <span className="text-muted-foreground">
                          {t('card_ending')} {pm.card.last4}
                        </span>
                        {pm.isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            <Star className="h-3 w-3" />
                            {t('default_badge')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('expires')} {formatExpiry(pm.card.expMonth, pm.card.expYear)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!pm.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(pm.id)}
                        disabled={actionLoading === pm.id}
                      >
                        {actionLoading === pm.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('buttons.set_default')
                        )}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(pm.id)}
                      disabled={actionLoading === pm.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {actionLoading === pm.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('buttons.delete')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.title')}</DialogTitle>
            <DialogDescription>
              {t('delete.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t('delete.buttons.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              {t('delete.buttons.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

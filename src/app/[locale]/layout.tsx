import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/core/i18n/config';
import { ThemeProvider } from '@/core/theme/provider';
import { AutoSignModal } from '@/shared/blocks/sign/auto-sign-modal';
import { Toaster } from '@/shared/components/ui/sonner';
import { AppContextProvider } from '@/shared/contexts/app';
import { CartProvider } from '@/shared/contexts/cart';
import { CurrencyProvider } from '@/shared/contexts/currency';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata();

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <ThemeProvider>
        <AppContextProvider>
          <CurrencyProvider>
            <CartProvider>
              {children}
              <AutoSignModal />
              <Toaster position="top-center" richColors />
            </CartProvider>
          </CurrencyProvider>
        </AppContextProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}

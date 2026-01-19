'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/core/i18n/navigation';
import { localeDetails } from '@/config/locale';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cacheSet } from '@/shared/lib/cache';

export function LocaleSelector() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwitchLanguage = (value: string) => {
    if (value !== currentLocale) {
      // Update localStorage to sync with locale detector
      cacheSet('locale', value);
      const query = searchParams?.toString?.() ?? '';
      const href = query ? `${pathname}?${query}` : pathname;
      router.push(href, {
        locale: value,
      });
    }
  };

  const currentDetails = localeDetails[currentLocale] || localeDetails.en;
  const displayText = `${currentDetails.country} | ${currentDetails.currency} ${currentDetails.symbol}`;

  // Return a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-auto gap-1 px-2 py-1 text-sm font-normal"
        disabled
      >
        <span>{displayText}</span>
        <ChevronDown size={14} />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto gap-1 px-2 py-1 text-sm font-normal"
        >
          <span>{displayText}</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.keys(localeDetails).map((locale) => {
          const details = localeDetails[locale];
          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleSwitchLanguage(locale)}
            >
              <span>
                {details.country} | {details.currency} {details.symbol}
              </span>
              {locale === currentLocale && (
                <Check size={16} className="text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

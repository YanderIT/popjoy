'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Globe, ChevronDown, Check } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useRouter, usePathname } from '@/core/i18n/navigation';
import { localeNames, locales } from '@/config/locale';
import {
  getCurrencyByLocale,
  currencyConfig,
  supportedCurrencies,
  localeCurrencyMap,
} from '@/config/currency';
import { useCurrency } from '@/shared/contexts/currency';
import { cn } from '@/shared/lib/utils';

interface LocaleCurrencySwitcherProps {
  /** 显示模式 */
  mode?: 'full' | 'compact' | 'icon-only';
  /** 是否显示货币选择 */
  showCurrency?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function LocaleCurrencySwitcher({
  mode = 'compact',
  showCurrency = true,
  className,
}: LocaleCurrencySwitcherProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { currency, setCurrency } = useCurrency();

  // 当前语言和货币显示
  const currentLocaleName = localeNames[locale] || locale;
  const currentCurrencyInfo = currencyConfig[currency];

  // 切换语言
  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      // 同时更新货币到新语言的默认货币（除非用户之前手动选择过）
      const defaultCurrencyForLocale = getCurrencyByLocale(newLocale);
      if (currency === getCurrencyByLocale(locale)) {
        setCurrency(defaultCurrencyForLocale);
      }
    });
  };

  // 切换货币
  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  // 常用货币列表（根据当前语言排序）
  const popularCurrencies = [
    'USD',
    'EUR',
    'CNY',
    'JPY',
    'GBP',
    'KRW',
    'AUD',
    'CAD',
  ].filter((c) => supportedCurrencies.includes(c));

  // 获取货币显示文本
  const getCurrencyDisplay = (code: string) => {
    const info = currencyConfig[code];
    if (!info) return code;
    return `${info.symbol} ${code}`;
  };

  if (mode === 'icon-only') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-9 w-9', className)}
            disabled={isPending}
          >
            <Globe className="h-4 w-4" />
            <span className="sr-only">Switch language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className="flex items-center justify-between"
            >
              <span>{localeNames[loc]}</span>
              {loc === locale && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}

          {showCurrency && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Currency</DropdownMenuLabel>
              {popularCurrencies.map((cur) => (
                <DropdownMenuItem
                  key={cur}
                  onClick={() => handleCurrencyChange(cur)}
                  className="flex items-center justify-between"
                >
                  <span>{getCurrencyDisplay(cur)}</span>
                  {cur === currency && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* 语言选择器 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2"
            disabled={isPending}
          >
            <Globe className="h-4 w-4" />
            {mode === 'full' && (
              <span className="hidden sm:inline">{currentLocaleName}</span>
            )}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-80 w-48 overflow-y-auto">
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className="flex items-center justify-between"
            >
              <span>{localeNames[loc]}</span>
              {loc === locale && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 货币选择器 */}
      {showCurrency && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
            >
              <span className="text-sm font-medium">
                {currentCurrencyInfo?.symbol || currency}
              </span>
              {mode === 'full' && (
                <span className="hidden sm:inline">{currency}</span>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 w-48 overflow-y-auto">
            <DropdownMenuLabel>Currency</DropdownMenuLabel>
            {/* 常用货币 */}
            {popularCurrencies.map((cur) => (
              <DropdownMenuItem
                key={cur}
                onClick={() => handleCurrencyChange(cur)}
                className="flex items-center justify-between"
              >
                <span>{getCurrencyDisplay(cur)}</span>
                {cur === currency && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              All Currencies
            </DropdownMenuLabel>
            {/* 所有货币 */}
            {supportedCurrencies
              .filter((cur) => !popularCurrencies.includes(cur))
              .sort()
              .map((cur) => (
                <DropdownMenuItem
                  key={cur}
                  onClick={() => handleCurrencyChange(cur)}
                  className="flex items-center justify-between"
                >
                  <span>{getCurrencyDisplay(cur)}</span>
                  {cur === currency && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/**
 * 简化版语言切换器（不包含货币）
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  return (
    <LocaleCurrencySwitcher
      mode="compact"
      showCurrency={false}
      className={className}
    />
  );
}

/**
 * 简化版货币切换器（不包含语言）
 */
export function CurrencySwitcher({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const currentCurrencyInfo = currencyConfig[currency];

  const popularCurrencies = [
    'USD',
    'EUR',
    'CNY',
    'JPY',
    'GBP',
    'KRW',
  ].filter((c) => supportedCurrencies.includes(c));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 gap-1 px-2', className)}
        >
          <span className="text-sm font-medium">
            {currentCurrencyInfo?.symbol} {currency}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {popularCurrencies.map((cur) => {
          const info = currencyConfig[cur];
          return (
            <DropdownMenuItem
              key={cur}
              onClick={() => setCurrency(cur)}
              className="flex items-center justify-between"
            >
              <span>
                {info?.symbol} {cur}
              </span>
              {cur === currency && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { useCallback, useMemo } from 'react';
import { useLocale } from 'next-intl';

import { useCurrency, useCurrencyOptional } from '@/shared/contexts/currency';
import {
  formatPrice as formatPriceUtil,
  formatConvertedPrice,
  formatPriceRange as formatPriceRangeUtil,
  calculateDiscount,
  formatDiscountBadge,
  centsToUnit,
} from '@/shared/lib/price';
import { getCurrencyByLocale, defaultCurrency } from '@/config/currency';

/**
 * 价格格式化 Hook
 * 自动使用当前语言和货币设置
 */
export function usePrice() {
  const locale = useLocale();
  const currencyContext = useCurrencyOptional();

  // 当前货币（从 context 或根据语言推断）
  const currency = currencyContext?.currency || getCurrencyByLocale(locale);
  const rates = currencyContext?.rates || null;

  /**
   * 格式化价格（自动转换货币）
   * @param cents - 以分为单位的价格
   * @param baseCurrency - 原始货币（默认 USD）
   */
  const formatPrice = useCallback(
    (cents: number, baseCurrency: string = 'USD') => {
      return formatConvertedPrice(cents, baseCurrency, currency, locale, rates);
    },
    [currency, locale, rates]
  );

  /**
   * 格式化原始价格（不转换货币）
   * @param cents - 以分为单位的价格
   * @param priceCurrency - 价格货币
   */
  const formatOriginalPrice = useCallback(
    (cents: number, priceCurrency: string = 'USD') => {
      return formatPriceUtil(cents, priceCurrency, locale);
    },
    [locale]
  );

  /**
   * 格式化价格范围
   * @param minCents - 最小价格（以分为单位）
   * @param maxCents - 最大价格（以分为单位）
   * @param baseCurrency - 原始货币（默认 USD）
   */
  const formatPriceRange = useCallback(
    (minCents: number, maxCents: number, baseCurrency: string = 'USD') => {
      if (minCents === maxCents) {
        return formatPrice(minCents, baseCurrency);
      }

      const minFormatted = formatConvertedPrice(minCents, baseCurrency, currency, locale, rates);
      const maxFormatted = formatConvertedPrice(maxCents, baseCurrency, currency, locale, rates);

      return `${minFormatted} - ${maxFormatted}`;
    },
    [currency, locale, rates, formatPrice]
  );

  /**
   * 获取折扣百分比
   */
  const getDiscount = useCallback(
    (originalCents: number, currentCents: number) => {
      return calculateDiscount(originalCents, currentCents);
    },
    []
  );

  /**
   * 格式化折扣标签
   */
  const getDiscountBadge = useCallback(
    (originalCents: number, currentCents: number) => {
      return formatDiscountBadge(originalCents, currentCents);
    },
    []
  );

  /**
   * 分转换为基本单位
   */
  const toUnit = useCallback(
    (cents: number, priceCurrency: string = currency) => {
      return centsToUnit(cents, priceCurrency);
    },
    [currency]
  );

  return {
    /** 当前货币 */
    currency,
    /** 当前语言 */
    locale,
    /** 汇率数据 */
    rates,
    /** 是否正在加载 */
    isLoading: currencyContext?.isLoading ?? false,
    /** 格式化价格（自动转换货币） */
    formatPrice,
    /** 格式化原始价格（不转换货币） */
    formatOriginalPrice,
    /** 格式化价格范围 */
    formatPriceRange,
    /** 获取折扣百分比 */
    getDiscount,
    /** 获取折扣标签 */
    getDiscountBadge,
    /** 分转换为基本单位 */
    toUnit,
  };
}

/**
 * 简化的价格格式化 Hook（仅用于显示，不需要 context）
 */
export function usePriceFormatter() {
  const locale = useLocale();
  const currency = getCurrencyByLocale(locale);

  const formatPrice = useCallback(
    (cents: number, priceCurrency: string = 'USD') => {
      return formatPriceUtil(cents, priceCurrency, locale);
    },
    [locale]
  );

  return { formatPrice, locale, currency };
}

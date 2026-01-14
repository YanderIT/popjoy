/**
 * Price Formatting Utilities
 * 价格格式化工具 - 统一的价格显示和货币转换
 */

import {
  currencyConfig,
  getCurrencyDecimals,
  getIntlLocale,
  baseCurrency,
} from '@/config/currency';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: Date;
}

/**
 * 格式化价格（基础函数）
 * @param cents - 以分为单位的价格
 * @param currency - 货币代码 (如 'USD', 'CNY')
 * @param locale - 语言代码 (如 'en', 'zh')
 * @returns 格式化后的价格字符串
 */
export function formatPrice(
  cents: number,
  currency: string = 'USD',
  locale: string = 'en'
): string {
  const decimals = getCurrencyDecimals(currency);
  const amount = decimals === 0 ? Math.round(cents / 100) : cents / 100;
  const intlLocale = getIntlLocale(locale);

  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    // Fallback for unsupported currencies
    const symbol = currencyConfig[currency]?.symbol || currency;
    return `${symbol}${amount.toFixed(decimals)}`;
  }
}

/**
 * 转换价格（从一种货币到另一种）
 * @param amountInCents - 原始价格（以分为单位）
 * @param fromCurrency - 原始货币
 * @param toCurrency - 目标货币
 * @param rates - 汇率数据
 * @returns 转换后的金额（以目标货币的基本单位，非分）
 */
export function convertPrice(
  amountInCents: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) {
    return amountInCents / 100;
  }

  const amount = amountInCents / 100;

  // 如果原始货币是基础货币
  if (fromCurrency === rates.base) {
    const rate = rates.rates[toCurrency];
    if (!rate) return amount;
    return amount * rate;
  }

  // 如果目标货币是基础货币
  if (toCurrency === rates.base) {
    const rate = rates.rates[fromCurrency];
    if (!rate) return amount;
    return amount / rate;
  }

  // 需要通过基础货币转换
  const fromRate = rates.rates[fromCurrency];
  const toRate = rates.rates[toCurrency];
  if (!fromRate || !toRate) return amount;

  // 先转换到基础货币，再转换到目标货币
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
}

/**
 * 格式化转换后的价格
 * @param cents - 原始价格（以分为单位）
 * @param baseCurrency - 原始货币
 * @param targetCurrency - 目标货币
 * @param locale - 语言代码
 * @param rates - 汇率数据
 * @returns 格式化后的转换价格字符串
 */
export function formatConvertedPrice(
  cents: number,
  fromCurrency: string,
  targetCurrency: string,
  locale: string,
  rates: ExchangeRates | null
): string {
  if (!rates || fromCurrency === targetCurrency) {
    return formatPrice(cents, fromCurrency, locale);
  }

  const convertedAmount = convertPrice(cents, fromCurrency, targetCurrency, rates);
  const decimals = getCurrencyDecimals(targetCurrency);
  const finalCents = decimals === 0
    ? Math.round(convertedAmount) * 100
    : Math.round(convertedAmount * 100);

  return formatPrice(finalCents, targetCurrency, locale);
}

/**
 * 获取价格范围显示
 * @param minCents - 最小价格（以分为单位）
 * @param maxCents - 最大价格（以分为单位）
 * @param currency - 货币代码
 * @param locale - 语言代码
 * @returns 价格范围字符串
 */
export function formatPriceRange(
  minCents: number,
  maxCents: number,
  currency: string = 'USD',
  locale: string = 'en'
): string {
  if (minCents === maxCents) {
    return formatPrice(minCents, currency, locale);
  }
  return `${formatPrice(minCents, currency, locale)} - ${formatPrice(maxCents, currency, locale)}`;
}

/**
 * 计算折扣百分比
 * @param originalCents - 原价（以分为单位）
 * @param currentCents - 现价（以分为单位）
 * @returns 折扣百分比
 */
export function calculateDiscount(originalCents: number, currentCents: number): number {
  if (originalCents <= 0 || currentCents >= originalCents) {
    return 0;
  }
  return Math.round(((originalCents - currentCents) / originalCents) * 100);
}

/**
 * 格式化折扣标签
 * @param originalCents - 原价（以分为单位）
 * @param currentCents - 现价（以分为单位）
 * @returns 折扣标签字符串（如 "-20%"）
 */
export function formatDiscountBadge(originalCents: number, currentCents: number): string {
  const discount = calculateDiscount(originalCents, currentCents);
  return discount > 0 ? `-${discount}%` : '';
}

/**
 * 分转换为基本单位
 * @param cents - 以分为单位的金额
 * @param currency - 货币代码
 * @returns 基本单位金额
 */
export function centsToUnit(cents: number, currency: string = 'USD'): number {
  const decimals = getCurrencyDecimals(currency);
  return decimals === 0 ? Math.round(cents / 100) : cents / 100;
}

/**
 * 基本单位转换为分
 * @param amount - 基本单位金额
 * @param currency - 货币代码
 * @returns 以分为单位的金额
 */
export function unitToCents(amount: number, currency: string = 'USD'): number {
  return Math.round(amount * 100);
}

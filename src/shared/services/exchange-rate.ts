/**
 * Exchange Rate Service
 * 汇率服务 - 获取和缓存汇率数据
 */

import { baseCurrency, supportedCurrencies } from '@/config/currency';

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: Date;
}

// 缓存配置
const CACHE_KEY = 'exchange_rates';
const CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

// 内存缓存
let memoryCache: ExchangeRates | null = null;
let memoryCacheTime: number = 0;

// 备用汇率（当 API 不可用时使用）
// 这些是大致汇率，用于降级处理
const fallbackRates: Record<string, number> = {
  USD: 1,
  CNY: 7.24,
  JPY: 149.5,
  KRW: 1320,
  EUR: 0.92,
  GBP: 0.79,
  BRL: 4.97,
  RUB: 92.5,
  AED: 3.67,
  INR: 83.2,
  THB: 35.5,
  VND: 24500,
  IDR: 15700,
  TRY: 32.1,
  PLN: 4.02,
  MYR: 4.72,
  SGD: 1.34,
  HKD: 7.82,
  TWD: 31.8,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  SEK: 10.5,
  NOK: 10.7,
  DKK: 6.87,
  MXN: 17.2,
  ZAR: 18.9,
  PHP: 56.1,
  NZD: 1.64,
  SAR: 3.75,
};

/**
 * 从 API 获取汇率
 */
async function fetchRatesFromAPI(): Promise<ExchangeRates | null> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://v6.exchangerate-api.com/v6';

  // 如果没有配置 API key，使用免费的开放 API
  const url = apiKey
    ? `${apiUrl}/${apiKey}/latest/${baseCurrency}`
    : `https://open.er-api.com/v6/latest/${baseCurrency}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Next.js cache for 1 hour
    });

    if (!response.ok) {
      console.error('Exchange rate API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.result === 'success' || data.rates) {
      return {
        base: baseCurrency,
        rates: data.conversion_rates || data.rates,
        updatedAt: new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return null;
  }
}

/**
 * 从 localStorage 获取缓存的汇率（仅客户端）
 */
function getLocalStorageCache(): ExchangeRates | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const cacheTime = new Date(data.updatedAt).getTime();

    // 检查缓存是否过期
    if (Date.now() - cacheTime > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return {
      ...data,
      updatedAt: new Date(data.updatedAt),
    };
  } catch {
    return null;
  }
}

/**
 * 保存汇率到 localStorage（仅客户端）
 */
function setLocalStorageCache(rates: ExchangeRates): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * 获取汇率数据（带缓存）
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // 1. 检查内存缓存
  if (memoryCache && Date.now() - memoryCacheTime < CACHE_TTL) {
    return memoryCache;
  }

  // 2. 检查 localStorage 缓存（客户端）
  const localCache = getLocalStorageCache();
  if (localCache) {
    memoryCache = localCache;
    memoryCacheTime = Date.now();
    return localCache;
  }

  // 3. 从 API 获取
  const apiRates = await fetchRatesFromAPI();
  if (apiRates) {
    memoryCache = apiRates;
    memoryCacheTime = Date.now();
    setLocalStorageCache(apiRates);
    return apiRates;
  }

  // 4. 使用备用汇率
  const fallback: ExchangeRates = {
    base: baseCurrency,
    rates: fallbackRates,
    updatedAt: new Date(),
  };

  memoryCache = fallback;
  memoryCacheTime = Date.now();
  return fallback;
}

/**
 * 获取单个货币的汇率
 */
export async function getExchangeRate(currency: string): Promise<number> {
  if (currency === baseCurrency) return 1;

  const rates = await getExchangeRates();
  return rates.rates[currency] || 1;
}

/**
 * 强制刷新汇率缓存
 */
export async function refreshExchangeRates(): Promise<ExchangeRates> {
  memoryCache = null;
  memoryCacheTime = 0;

  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }

  return getExchangeRates();
}

/**
 * 检查汇率是否过期
 */
export function isRatesExpired(rates: ExchangeRates): boolean {
  return Date.now() - rates.updatedAt.getTime() > CACHE_TTL;
}

/**
 * 获取汇率更新时间的格式化字符串
 */
export function formatRatesUpdateTime(rates: ExchangeRates, locale: string = 'en'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(rates.updatedAt);
}

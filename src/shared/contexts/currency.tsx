'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocale } from 'next-intl';

import {
  getCurrencyByLocale,
  defaultCurrency,
  supportedCurrencies,
  currencyConfig,
  type CurrencyInfo,
} from '@/config/currency';
import {
  getExchangeRates,
  type ExchangeRates,
} from '@/shared/services/exchange-rate';
import {
  formatPrice as formatPriceUtil,
  formatConvertedPrice,
  formatPriceRange as formatPriceRangeUtil,
} from '@/shared/lib/price';

// Cookie 和 localStorage 键名
const CURRENCY_COOKIE_KEY = 'NEXT_CURRENCY';
const CURRENCY_STORAGE_KEY = 'user_currency_preference';

interface CurrencyContextValue {
  /** 当前选择的货币代码 */
  currency: string;
  /** 设置货币 */
  setCurrency: (currency: string) => void;
  /** 汇率数据 */
  rates: ExchangeRates | null;
  /** 是否正在加载汇率 */
  isLoading: boolean;
  /** 当前货币信息 */
  currencyInfo: CurrencyInfo | undefined;
  /** 支持的货币列表 */
  supportedCurrencies: string[];
  /** 格式化价格（自动使用当前货币和语言） */
  formatPrice: (cents: number, baseCurrency?: string) => string;
  /** 格式化价格范围 */
  formatPriceRange: (minCents: number, maxCents: number, baseCurrency?: string) => string;
  /** 刷新汇率 */
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

// 从 cookie 获取货币
function getCurrencyFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CURRENCY_COOKIE_KEY) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// 设置 cookie
function setCurrencyCookie(currency: string): void {
  if (typeof document === 'undefined') return;

  const maxAge = 365 * 24 * 60 * 60; // 1 year
  document.cookie = `${CURRENCY_COOKIE_KEY}=${encodeURIComponent(currency)};path=/;max-age=${maxAge};SameSite=Lax`;
}

// 从 localStorage 获取货币
function getCurrencyFromStorage(): string | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    return localStorage.getItem(CURRENCY_STORAGE_KEY);
  } catch {
    return null;
  }
}

// 设置 localStorage
function setCurrencyToStorage(currency: string): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  } catch {
    // Ignore errors
  }
}

interface CurrencyProviderProps {
  children: ReactNode;
  /** 初始货币（可从服务端传入） */
  initialCurrency?: string;
}

export function CurrencyProvider({
  children,
  initialCurrency,
}: CurrencyProviderProps) {
  const locale = useLocale();

  // 确定初始货币
  const getInitialCurrency = useCallback(() => {
    // 1. 使用传入的初始值
    if (initialCurrency && supportedCurrencies.includes(initialCurrency)) {
      return initialCurrency;
    }

    // 2. 从 cookie 获取
    const cookieCurrency = getCurrencyFromCookie();
    if (cookieCurrency && supportedCurrencies.includes(cookieCurrency)) {
      return cookieCurrency;
    }

    // 3. 从 localStorage 获取
    const storageCurrency = getCurrencyFromStorage();
    if (storageCurrency && supportedCurrencies.includes(storageCurrency)) {
      return storageCurrency;
    }

    // 4. 根据语言推断货币
    return getCurrencyByLocale(locale);
  }, [initialCurrency, locale]);

  const [currency, setCurrencyState] = useState<string>(getInitialCurrency);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载汇率
  useEffect(() => {
    let mounted = true;

    async function loadRates() {
      setIsLoading(true);
      try {
        const exchangeRates = await getExchangeRates();
        if (mounted) {
          setRates(exchangeRates);
        }
      } catch (error) {
        console.error('Failed to load exchange rates:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadRates();

    return () => {
      mounted = false;
    };
  }, []);

  // 设置货币并保存
  const setCurrency = useCallback((newCurrency: string) => {
    if (!supportedCurrencies.includes(newCurrency)) {
      console.warn(`Unsupported currency: ${newCurrency}`);
      return;
    }

    setCurrencyState(newCurrency);
    setCurrencyCookie(newCurrency);
    setCurrencyToStorage(newCurrency);
  }, []);

  // 刷新汇率
  const refreshRates = useCallback(async () => {
    setIsLoading(true);
    try {
      const exchangeRates = await getExchangeRates();
      setRates(exchangeRates);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 格式化价格
  const formatPrice = useCallback(
    (cents: number, baseCurrency: string = 'USD') => {
      return formatConvertedPrice(cents, baseCurrency, currency, locale, rates);
    },
    [currency, locale, rates]
  );

  // 格式化价格范围
  const formatPriceRange = useCallback(
    (minCents: number, maxCents: number, baseCurrency: string = 'USD') => {
      const minFormatted = formatConvertedPrice(minCents, baseCurrency, currency, locale, rates);
      const maxFormatted = formatConvertedPrice(maxCents, baseCurrency, currency, locale, rates);

      if (minCents === maxCents) {
        return minFormatted;
      }

      return `${minFormatted} - ${maxFormatted}`;
    },
    [currency, locale, rates]
  );

  // 当前货币信息
  const currencyInfo = useMemo(() => currencyConfig[currency], [currency]);

  const value: CurrencyContextValue = useMemo(
    () => ({
      currency,
      setCurrency,
      rates,
      isLoading,
      currencyInfo,
      supportedCurrencies,
      formatPrice,
      formatPriceRange,
      refreshRates,
    }),
    [
      currency,
      setCurrency,
      rates,
      isLoading,
      currencyInfo,
      formatPrice,
      formatPriceRange,
      refreshRates,
    ]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

/**
 * 使用货币 Context
 */
export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }

  return context;
}

/**
 * 可选的 useCurrency（在 Provider 外部使用时返回默认值）
 */
export function useCurrencyOptional(): CurrencyContextValue | null {
  return useContext(CurrencyContext) || null;
}

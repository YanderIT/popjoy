/**
 * Currency Configuration
 * 货币配置 - 支持多货币显示和汇率转换
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  nameLocal: string;
  decimals: number;
}

// 语言到默认货币的映射
export const localeCurrencyMap: Record<string, string> = {
  en: 'USD',
  zh: 'CNY',
  ja: 'JPY',
  ko: 'KRW',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
  pt: 'BRL',
  it: 'EUR',
  ru: 'RUB',
  ar: 'AED',
  hi: 'INR',
  th: 'THB',
  vi: 'VND',
  id: 'IDR',
  tr: 'TRY',
  pl: 'PLN',
  nl: 'EUR',
};

// 支持的货币配置
export const currencyConfig: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameLocal: 'US Dollar',
    decimals: 2,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    nameLocal: '人民币',
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    nameLocal: '日本円',
    decimals: 0,
  },
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: 'South Korean Won',
    nameLocal: '원',
    decimals: 0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    nameLocal: 'Euro',
    decimals: 2,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    nameLocal: 'British Pound',
    decimals: 2,
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    nameLocal: 'Real',
    decimals: 2,
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Ruble',
    nameLocal: 'Рубль',
    decimals: 2,
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    nameLocal: 'درهم',
    decimals: 2,
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    nameLocal: 'रुपया',
    decimals: 2,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    nameLocal: 'บาท',
    decimals: 2,
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    nameLocal: 'Đồng',
    decimals: 0,
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    nameLocal: 'Rupiah',
    decimals: 0,
  },
  TRY: {
    code: 'TRY',
    symbol: '₺',
    name: 'Turkish Lira',
    nameLocal: 'Lira',
    decimals: 2,
  },
  PLN: {
    code: 'PLN',
    symbol: 'zł',
    name: 'Polish Zloty',
    nameLocal: 'Złoty',
    decimals: 2,
  },
  MYR: {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    nameLocal: 'Ringgit',
    decimals: 2,
  },
  SGD: {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    nameLocal: 'Singapore Dollar',
    decimals: 2,
  },
  HKD: {
    code: 'HKD',
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    nameLocal: '港幣',
    decimals: 2,
  },
  TWD: {
    code: 'TWD',
    symbol: 'NT$',
    name: 'Taiwan Dollar',
    nameLocal: '新台幣',
    decimals: 0,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    nameLocal: 'Australian Dollar',
    decimals: 2,
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    nameLocal: 'Canadian Dollar',
    decimals: 2,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    nameLocal: 'Franken',
    decimals: 2,
  },
  SEK: {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    nameLocal: 'Krona',
    decimals: 2,
  },
  NOK: {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    nameLocal: 'Krone',
    decimals: 2,
  },
  DKK: {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    nameLocal: 'Krone',
    decimals: 2,
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    nameLocal: 'Peso',
    decimals: 2,
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    nameLocal: 'Rand',
    decimals: 2,
  },
  PHP: {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    nameLocal: 'Peso',
    decimals: 2,
  },
  NZD: {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    nameLocal: 'New Zealand Dollar',
    decimals: 2,
  },
  SAR: {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    nameLocal: 'ريال',
    decimals: 2,
  },
};

// 获取所有支持的货币代码
export const supportedCurrencies = Object.keys(currencyConfig);

// 默认货币
export const defaultCurrency = 'USD';

// 基础货币（用于汇率转换）
export const baseCurrency = 'USD';

// 根据语言获取默认货币
export function getCurrencyByLocale(locale: string): string {
  return localeCurrencyMap[locale] || defaultCurrency;
}

// 获取货币信息
export function getCurrencyInfo(currencyCode: string): CurrencyInfo | undefined {
  return currencyConfig[currencyCode];
}

// 获取货币小数位数
export function getCurrencyDecimals(currencyCode: string): number {
  return currencyConfig[currencyCode]?.decimals ?? 2;
}

// 语言代码到 Intl locale 的映射（用于数字格式化）
export const localeToIntlMap: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-BR',
  it: 'it-IT',
  ru: 'ru-RU',
  ar: 'ar-AE',
  hi: 'hi-IN',
  th: 'th-TH',
  vi: 'vi-VN',
  id: 'id-ID',
  tr: 'tr-TR',
  pl: 'pl-PL',
  nl: 'nl-NL',
};

// 获取 Intl locale
export function getIntlLocale(locale: string): string {
  return localeToIntlMap[locale] || 'en-US';
}

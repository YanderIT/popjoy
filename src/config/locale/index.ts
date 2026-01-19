import { envConfigs } from '..';

// 支持的语言列表 (18种全球主要语言)
export const localeNames: Record<string, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  tr: 'Türkçe',
  pl: 'Polski',
  nl: 'Nederlands',
};

// 语言详情（国家和货币信息）
export const localeDetails: Record<
  string,
  {
    name: string;
    country: string;
    currency: string;
    symbol: string;
  }
> = {
  en: { name: 'English', country: 'United States', currency: 'USD', symbol: '$' },
  zh: { name: '中文', country: '中国', currency: 'CNY', symbol: '¥' },
  ja: { name: '日本語', country: '日本', currency: 'JPY', symbol: '¥' },
  ko: { name: '한국어', country: '한국', currency: 'KRW', symbol: '₩' },
  de: { name: 'Deutsch', country: 'Deutschland', currency: 'EUR', symbol: '€' },
  fr: { name: 'Français', country: 'France', currency: 'EUR', symbol: '€' },
  es: { name: 'Español', country: 'España', currency: 'EUR', symbol: '€' },
  pt: { name: 'Português', country: 'Brasil', currency: 'BRL', symbol: 'R$' },
  it: { name: 'Italiano', country: 'Italia', currency: 'EUR', symbol: '€' },
  ru: { name: 'Русский', country: 'Россия', currency: 'RUB', symbol: '₽' },
  ar: { name: 'العربية', country: 'السعودية', currency: 'SAR', symbol: 'ر.س' },
  hi: { name: 'हिन्दी', country: 'भारत', currency: 'INR', symbol: '₹' },
  th: { name: 'ไทย', country: 'ประเทศไทย', currency: 'THB', symbol: '฿' },
  vi: { name: 'Tiếng Việt', country: 'Việt Nam', currency: 'VND', symbol: '₫' },
  id: { name: 'Bahasa Indonesia', country: 'Indonesia', currency: 'IDR', symbol: 'Rp' },
  tr: { name: 'Türkçe', country: 'Türkiye', currency: 'TRY', symbol: '₺' },
  pl: { name: 'Polski', country: 'Polska', currency: 'PLN', symbol: 'zł' },
  nl: { name: 'Nederlands', country: 'Nederland', currency: 'EUR', symbol: '€' },
};

export const locales = Object.keys(localeNames);

export const defaultLocale = envConfigs.locale;

export const localePrefix = 'as-needed';

export const localeDetection = false;

export const localeMessagesRootPath = '@/config/locale/messages';

export const localeMessagesPaths = [
  'common',
  'landing',
  'showcases',
  'blog',
  'updates',
  'pricing',
  'settings/sidebar',
  'settings/profile',
  'settings/security',
  'settings/billing',
  'settings/payments',
  'settings/credits',
  'settings/apikeys',
  'settings/addresses',
  'settings/payment-methods',
  'admin/sidebar',
  'admin/users',
  'admin/roles',
  'admin/permissions',
  'admin/categories',
  'admin/posts',
  'admin/payments',
  'admin/orders',
  'admin/products',
  'admin/subscriptions',
  'admin/credits',
  'admin/settings',
  'activity/sidebar',
  'pages/index',
  'pages/pricing',
  'pages/showcases',
  'pages/blog',
  'pages/updates',
  'pages/shop',
  'shop',
];

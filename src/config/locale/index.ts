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
];

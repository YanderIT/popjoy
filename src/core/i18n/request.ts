import { getRequestConfig } from 'next-intl/server';

import {
  defaultLocale,
  localeMessagesPaths,
  localeMessagesRootPath,
} from '@/config/locale';

import { routing } from './config';

export async function loadMessages(
  path: string,
  locale: string = defaultLocale
) {
  try {
    // try to load locale messages
    const messages = await import(
      `@/config/locale/messages/${locale}/${path}.json`
    );
    return messages.default;
  } catch (e) {
    try {
      // try to load default locale messages
      const messages = await import(
        `@/config/locale/messages/${defaultLocale}/${path}.json`
      );
      return messages.default;
    } catch (err) {
      // if default locale is not found, return empty object
      return {};
    }
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as string)) {
    locale = routing.defaultLocale;
  }

  // 处理语言变体，映射到支持的语言代码
  const localeMapping: Record<string, string> = {
    'zh-CN': 'zh',
    'zh-TW': 'zh',
    'zh-HK': 'zh',
    'ja-JP': 'ja',
    'ko-KR': 'ko',
    'de-DE': 'de',
    'de-AT': 'de',
    'de-CH': 'de',
    'fr-FR': 'fr',
    'fr-CA': 'fr',
    'fr-BE': 'fr',
    'es-ES': 'es',
    'es-MX': 'es',
    'es-AR': 'es',
    'pt-BR': 'pt',
    'pt-PT': 'pt',
    'it-IT': 'it',
    'ru-RU': 'ru',
    'ar-SA': 'ar',
    'ar-AE': 'ar',
    'ar-EG': 'ar',
    'hi-IN': 'hi',
    'th-TH': 'th',
    'vi-VN': 'vi',
    'id-ID': 'id',
    'tr-TR': 'tr',
    'pl-PL': 'pl',
    'nl-NL': 'nl',
    'nl-BE': 'nl',
  };

  if (localeMapping[locale]) {
    locale = localeMapping[locale];
  }

  try {
    // load all local messages
    const allMessages = await Promise.all(
      localeMessagesPaths.map((path) => loadMessages(path, locale))
    );

    // merge all local messages
    const messages: any = {};

    localeMessagesPaths.forEach((path, index) => {
      const localMessages = allMessages[index];

      const keys = path.split('/');
      let current = messages;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = localMessages;
    });

    return {
      locale,
      messages,
    };
  } catch (e) {
    return {
      locale: defaultLocale,
      messages: await loadMessages(localeMessagesRootPath, defaultLocale),
    };
  }
});

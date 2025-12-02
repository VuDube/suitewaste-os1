import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
const LanguageDetector: any = {
  type: 'languageDetector',
  init(services: any, detectorOptions: any = {}, i18nextOptions: any = {}) {
    this.services = services;
    this.options = detectorOptions || {};
    this.i18nextOptions = i18nextOptions || {};
  },
  detect() {
    const order = (this.options && this.options.order) || ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'];
    for (const detector of order) {
      try {
        if (detector === 'queryString') {
          if (typeof window === 'undefined' || !window.location) continue;
          const params = new URLSearchParams(window.location.search);
          const v = params.get('lng') || params.get('language') || params.get('lang');
          if (v) return v;
        } else if (detector === 'cookie') {
          if (typeof document === 'undefined' || !document.cookie) continue;
          // try common cookie keys used for language
          const cookieMatch = document.cookie.match(/(?:^|;)\s*(?:i18next|lng|language)=([^;]+)/);
          if (cookieMatch && cookieMatch[1]) return decodeURIComponent(cookieMatch[1]);
        } else if (detector === 'localStorage') {
          if (typeof window === 'undefined' || !window.localStorage) continue;
          const v = window.localStorage.getItem('i18nextLng') || window.localStorage.getItem('lng') || window.localStorage.getItem('language');
          if (v) return v;
        } else if (detector === 'sessionStorage') {
          if (typeof window === 'undefined' || !window.sessionStorage) continue;
          const v = window.sessionStorage.getItem('i18nextLng') || window.sessionStorage.getItem('lng') || window.sessionStorage.getItem('language');
          if (v) return v;
        } else if (detector === 'navigator') {
          if (typeof navigator === 'undefined') continue;
          const nav = (Array.isArray((navigator as any).languages) && (navigator as any).languages[0]) || (navigator as any).language || (navigator as any).userLanguage;
          if (nav) return nav;
        } else if (detector === 'htmlTag') {
          if (typeof document === 'undefined' || !document.documentElement) continue;
          const v = document.documentElement.lang;
          if (v) return v;
        }
      } catch (e) {
        // ignore individual detector errors and continue to next
        // eslint-disable-next-line no-console
        console.error('i18n language detector error for', detector, e);
      }
    }
    return undefined;
  },
  cacheUserLanguage(lng: string) {
    const caches = (this.options && this.options.caches) || ['localStorage', 'cookie'];
    for (const cache of caches) {
      try {
        if (cache === 'localStorage' && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('i18nextLng', lng);
        } else if (cache === 'cookie' && typeof document !== 'undefined') {
          // set a simple cookie; path=/ to be broadly available
          document.cookie = `i18next=${encodeURIComponent(lng)};path=/`;
        }
      } catch (e) {
        // ignore failures to write caches
        // eslint-disable-next-line no-console
        console.error('i18n cacheUserLanguage error for', cache, e);
      }
    }
  },
};
const resources = {};

// List of locales to load from /locales/<lng>/translation.json at runtime
const _i18n_locales = ['en', 'zu', 'af'];

/**
 * Load a locale file from the public folder and add it to i18next resource bundles.
 * This is intentionally non-blocking for app startup; errors are caught and logged.
 */
function loadLocale(lng: string): void {
  // eslint-disable-next-line no-void
  void (async () => {
    try {
      const resp = await fetch(`/locales/${lng}/translation.json`);
      if (!resp.ok) {
        throw new Error(`Failed to fetch locale "${lng}": ${resp.status} ${resp.statusText}`);
      }
      const data = await resp.json();
      // addResourceBundle(namespace='translation'), overwrite true to ensure updates replace any placeholder
      i18n.addResourceBundle(lng, 'translation', data, true, true);
    } catch (err) {
      // Don't block startup on missing locale files; log for debugging
      // eslint-disable-next-line no-console
      console.error('i18n: error loading locale', lng, err);
    }
  })();
}

// Kick off non-blocking loads for all configured locales
_i18n_locales.forEach((lng) => loadLocale(lng));
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'zu', 'af'],
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    react: {
      useSuspense: true,
    },
  } as any);
export default i18n;
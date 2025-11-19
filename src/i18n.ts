import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
const resources = {};
const _i18n_locales = ['en', 'zu', 'af', 'xh'];
function loadLocale(lng: string): void {
  void (async () => {
    try {
      const resp = await fetch(`/locales/${lng}/translation.json`);
      if (!resp.ok) {
        throw new Error(`Failed to fetch locale "${lng}": ${resp.status} ${resp.statusText}`);
      }
      const data = await resp.json();
      i18n.addResourceBundle(lng, 'translation', data, true, true);
    } catch (err) {
      console.error('i18n: error loading locale', lng, err);
    }
  })();
}
_i18n_locales.forEach((lng) => loadLocale(lng));
// Inline polyfill for LanguageDetector to avoid import issues
const LanguageDetector = {
  type: 'languageDetector' as const,
  async: false, // sync detection
  detect: () => {
    if (typeof window === 'undefined') return 'en';
    // Order: localStorage -> cookie -> navigator
    let lng = localStorage.getItem('i18nextLng');
    if (lng) return lng.split('-')[0];
    const cookie = document.cookie.split('; ').find(row => row.startsWith('i18next='))?.split('=')[1];
    if (cookie) return cookie.split('-')[0];
    if (navigator.language) return navigator.language.split('-')[0];
    return 'en';
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('i18nextLng', lng);
    document.cookie = `i18next=${lng}; path=/; max-age=31536000`;
  },
};
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'en-US', 'zu', 'af', 'xh'],
    fallbackLng: {
      'en-US': ['en'],
      'default': ['en']
    },
    debug: import.meta.env.DEV,
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    react: {
      useSuspense: true,
    },
    interpolation: {
      escapeValue: false,
    },
  });
if (typeof window !== 'undefined') {
  (window as any).i18nInstance = i18n;
}
export default i18n;
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../public/locales/en/translation.json';
import zu from '../public/locales/zu/translation.json';
import af from '../public/locales/af/translation.json';
const resources = {
  en: {
    translation: en,
  },
  zu: {
    translation: zu,
  },
  af: {
    translation: af,
  },
};
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
  });
export default i18n;
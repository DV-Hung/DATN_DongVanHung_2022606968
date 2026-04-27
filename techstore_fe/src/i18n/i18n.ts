import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enLocale from '../locales/en.json';
import viLocale from '../locales/vi.json';

const resources = {
  en: {
    translation: enLocale,
  },
  vi: {
    translation: viLocale,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'vi', // Default to Vietnamese
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

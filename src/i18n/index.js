import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '../locales/en/common.json';
import enSettings from '../locales/en/settings.json';
import enMarketplace from '../locales/en/marketplace.json';
import enNav from '../locales/en/nav.json';

import frCommon from '../locales/fr/common.json';
import frSettings from '../locales/fr/settings.json';
import frMarketplace from '../locales/fr/marketplace.json';
import frNav from '../locales/fr/nav.json';

import esCommon from '../locales/es/common.json';
import esSettings from '../locales/es/settings.json';
import esMarketplace from '../locales/es/marketplace.json';
import esNav from '../locales/es/nav.json';

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
];

const STORAGE_KEY = 'adesia-ui-locale';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        settings: enSettings,
        marketplace: enMarketplace,
        nav: enNav,
      },
      fr: {
        common: frCommon,
        settings: frSettings,
        marketplace: frMarketplace,
        nav: frNav,
      },
      es: {
        common: esCommon,
        settings: esSettings,
        marketplace: esMarketplace,
        nav: esNav,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'settings', 'marketplace', 'nav'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

export const setAppLocale = (code) => {
  i18n.changeLanguage(code);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
  }
};

export default i18n;

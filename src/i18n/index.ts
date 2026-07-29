import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslation from './es.json';
import enTranslation from './en.json';

const savedLang = localStorage.getItem('cyber_app_lang') || 'es';

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: esTranslation },
    en: { translation: enTranslation }
  },
  lng: savedLang,
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false
  }
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('cyber_app_lang', lng);
});

export default i18n;

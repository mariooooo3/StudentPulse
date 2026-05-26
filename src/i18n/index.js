import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ro from './locales/ro'
import en from './locales/en'
import es from './locales/es'
import it from './locales/it'

const savedLang = (() => {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('sc_settings_'))
    for (const key of keys) {
      const s = JSON.parse(localStorage.getItem(key) || '{}')
      if (s.language) return s.language
    }
  } catch {}
  return 'ro'
})()

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ro: { translation: ro },
      en: { translation: en },
      es: { translation: es },
      it: { translation: it },
    },
    lng: savedLang,
    fallbackLng: 'ro',
    interpolation: { escapeValue: false },
  })

export default i18n

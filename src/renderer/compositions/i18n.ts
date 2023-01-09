import { watchEffect } from 'vue'
import { injectIPC } from '../utils/compositions'

const language = $(injectIPC<string | undefined>('language', undefined))

export function useLanguage() {
  return $$(language)
}

export function getAddonManifest(original: any) {
  let manifest = { ...original }
  const i18nMap: Record<string, any> | undefined = original?.['commas:i18n']
  if (i18nMap && language) {
    const locales = Object.keys(i18nMap)
    let locale = locales.find(item => item === language)
    if (!locale) {
      const sepIndex = language.indexOf('-')
      const lang = sepIndex !== -1 ? language.slice(0, sepIndex) : language
      locale = locales.find(item => item.startsWith(`${lang}-`))
    }
    if (locale) {
      manifest = {
        ...manifest,
        ...i18nMap[locale],
      }
    }
  }
  return manifest
}

export function handleI18NMessages() {
  watchEffect(() => {
    if (language) {
      document.documentElement.lang = language
    } else {
      document.documentElement.removeAttribute('lang')
    }
  })
}

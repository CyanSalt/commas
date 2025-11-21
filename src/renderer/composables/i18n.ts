import { watchEffect } from 'vue'
import { resolveManifest } from '../../shared/i18n'
import { injectIPC } from '../utils/composables'

const language = $(injectIPC('language', navigator.language))

export function useLanguage() {
  return $$(language)
}

export function getI18nManifest(original: any) {
  return resolveManifest(original, language)
}

export function handleI18nMessages() {
  watchEffect(() => {
    if (language) {
      document.documentElement.lang = language
    } else {
      document.documentElement.removeAttribute('lang')
    }
  })
}

import { memoize } from 'lodash'
import { injectIPC } from '../utils/compositions'

export const useLanguage = memoize(() => {
  return injectIPC<string | undefined>('language', undefined)
})

const language = $(useLanguage())

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

export function resolveManifest(original: any, language?: string) {
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

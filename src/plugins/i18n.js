import {remote} from 'electron'
import {readFileSync} from 'fs'
import {resolve} from 'path'
import {FileStorage} from './storage'

const translations = [
  {
    file: 'zh-CN.json',
    locales: ['zh', 'zh-CN'],
  },
]

function load(file) {
  const path = resolve(__dirname, 'assets/locales', file)
  try {
    return JSON.parse(readFileSync(path))
  } catch (e) {
    return null
  }
}

function getTranslationFile(locale) {
  const translation = translations
    .find(({locales}) => locales.includes(locale))
  return translation ? translation.file : null
}

function getDictionary() {
  let locale = remote.app.getLocale()
  const custom = FileStorage.loadSync('translation.json') || {}
  if (custom['@use']) locale = custom['@use']
  // Load translation data
  const file = getTranslationFile(locale)
  const dictionary = (file && load(file)) || {}
  // Merge user defined translation data
  for (const [key, value] of Object.entries(custom)) {
    if (value) dictionary[key] = value
  }
  return dictionary
}

const dictionary = getDictionary()

export function translate(message) {
  return dictionary[message] || message.split('#!')[0]
}

export default {
  install(Vue, options) {
    Vue.prototype.i18n = translate
  },
}

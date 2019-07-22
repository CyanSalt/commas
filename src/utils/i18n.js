import {remote} from 'electron'
import {readFileSync} from 'fs'
import {resolve} from 'path'
import FileStorage from './storage'

const translations = [
  {
    file: 'zh-CN.json',
    locales: ['zh', 'zh-CN'],
  },
]

const comment = '#!'

function load(file) {
  const path = resolve(__dirname, 'assets/locales', file)
  try {
    return JSON.parse(readFileSync(path))
  } catch (err) {
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
    if (typeof value === 'string') dictionary[key] = value
  }
  return dictionary
}

const unabridged = getDictionary()
const dictionary = Object.entries(unabridged)
  .reduce((collection, [key, value]) => {
    const identity = key.substring(0, key.indexOf(comment))
    if (identity) collection[identity] = value
    return collection
  }, {})

export function translate(message) {
  if (unabridged[message]) return unabridged[message]
  const identity = message.substring(0, message.indexOf(comment))
  if (dictionary[identity]) return dictionary[identity]
  return message.split(comment)[0]
}

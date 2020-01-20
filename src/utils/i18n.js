import {userStorage, assetsStorage} from './storage'
import {app, onAppReady} from './electron'

const translations = [
  {
    file: 'zh-CN.json',
    locales: ['zh', 'zh-CN'],
  },
]

const comment = '#!'

function getTranslationFile(locale) {
  const translation = translations
    .find(({locales}) => locales.includes(locale))
  return translation ? translation.file : null
}

function getDictionary() {
  let locale = app.getLocale()
  const custom = userStorage.loadSync('translation.json') || {}
  if (custom['@use']) locale = custom['@use']
  // Load translation data
  let dictionary = {}
  const file = getTranslationFile(locale)
  if (file) {
    const result = assetsStorage.loadSync(`locales/${file}`)
    if (result) dictionary = result
  }
  // Merge user defined translation data
  for (const [key, value] of Object.entries(custom)) {
    if (typeof value === 'string') dictionary[key] = value
  }
  return dictionary
}

let unabridged = {}
let dictionary = {}
onAppReady(() => {
  unabridged = getDictionary()
  dictionary = Object.entries(unabridged)
    .reduce((collection, [key, value]) => {
      const identity = key.substring(0, key.indexOf(comment))
      if (identity) collection[identity] = value
      return collection
    }, {})
})

function translateText(message) {
  if (!message) return message
  if (unabridged[message]) return unabridged[message]
  const identity = message.substring(0, message.indexOf(comment))
  if (dictionary[identity]) return dictionary[identity]
  return message.split(comment)[0]
}

export function translate(message, variables) {
  let text = translateText(message)
  if (variables && typeof variables === 'object') {
    for (const [key, replacer] of Object.entries(variables)) {
      text = text.replace('%' + key, replacer)
    }
  }
  return text
}

export function translateElement(el, {value}) {
  if (['INPUT', 'TEXTAREA'].includes(el.tagName)) {
    el.placeholder = translate(el.placeholder, value)
  } else {
    el.textContent = translate(el.textContent, value)
  }
}

import {userStorage, assetsStorage} from './storage'
import {app, onAppReady} from './electron'

const registry = [
  {
    file: 'zh-CN.json',
    locales: ['zh', 'zh-CN'],
  },
]

const comment = '#!'

const Priority = {
  custom: 0,
  addon: 1,
  builtin: 2,
}

function addDictionary(translation, dictionary, priority) {
  if (!translation.data) translation.data = []
  let filtered = {}
  for (const [key, value] of Object.entries(dictionary)) {
    if (typeof value === 'string') filtered[key] = value
  }
  translation.data.push({dictionary: filtered, priority})
  translation.data.sort((a, b) => a.priority - b.priority)
  // Generate mapping
  translation.unabridged = translation.data
    .reduce((dictionary, item) => {
      return Object.assign(dictionary, item.dictionary)
    }, {})
  translation.dictionary = Object.entries(translation.unabridged)
    .reduce((dictionary, [key, value]) => {
      const identity = key.substring(key.indexOf(comment))
      if (identity) dictionary[identity] = value
      return dictionary
    }, {})
}

function loadDictionary(translation) {
  if (translation.loaded || !translation.file) return
  const result = assetsStorage.loadSync(`locales/${translation.file}`)
  translation.loaded = true
  addDictionary(translation, result, Priority.builtin)
}

function getTranslation(locale) {
  let translation = registry
    .find(({locales}) => locales.includes(locale))
  if (!translation) {
    translation = {locales: [locale]}
    registry.push(translation)
  }
  return translation
}

let current
onAppReady(() => {
  let locale = app.getLocale()
  const custom = userStorage.loadSync('translation.json') || {}
  if (custom['@use']) locale = custom['@use']
  const translation = getTranslation(locale)
  loadDictionary(translation)
  addDictionary(translation, custom, Priority.custom)
  current = translation
})

function translateText(message) {
  if (!message || !current) return message
  const {unabridged, dictionary} = current
  if (unabridged[message]) return unabridged[message]
  const identity = message.substring(message.indexOf(comment))
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

export function addTranslations(data) {
  for (const [locale, dictionary] of Object.entries(data)) {
    const translation = getTranslation(locale)
    addDictionary(translation, dictionary, Priority.addon)
  }
}

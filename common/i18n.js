import { userStorage, assetsStorage } from './storage'

/**
 * @typedef {{[placeholder: string]: string}} Dictionary
 *
 * @typedef Translation
 * @property {string} file
 * @property {string[]} locales
 * @property {{dictionary: Dictionary[], priority: Priority}[]} [data]
 * @property {boolean} [loaded]
 */

/**
 * @type {Translation[]}
 */
const registry = [
  {
    file: 'zh-CN.json',
    locales: ['zh', 'zh-CN'],
  },
]

const comment = '#!'

/**
 * @enum {number}
 */
const Priority = {
  custom: 0,
  addon: 1,
  builtin: 2,
}

/**
 * @param {Translation} translation
 * @param {Dictionary} dictionary
 * @param {Priority} priority
 */
function addDictionary(translation, dictionary, priority) {
  if (!translation.data) translation.data = []
  let filtered = {}
  for (const [key, value] of Object.entries(dictionary)) {
    if (typeof value === 'string') filtered[key] = value
  }
  translation.data.push({ dictionary: filtered, priority })
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

/**
 * @param {Translation} translation
 */
function loadDictionary(translation) {
  if (translation.loaded || !translation.file) return
  const result = assetsStorage.loadSync(`locales/${translation.file}`)
  translation.loaded = true
  addDictionary(translation, result, Priority.builtin)
}

/**
 * @param {string} locale
 */
function getTranslation(locale) {
  let translation = registry
    .find(({ locales }) => locales.includes(locale))
  if (!translation) {
    translation = { locales: [locale] }
    registry.push(translation)
  }
  return translation
}

/**
 * @type {Translation}
 */
let current

/**
 * @param {string} locale
 */
export function loadTranslation(locale) {
  const custom = userStorage.loadSync('translation.json') || {}
  if (custom['@use']) locale = custom['@use']
  const translation = getTranslation(locale)
  loadDictionary(translation)
  addDictionary(translation, custom, Priority.custom)
  current = translation
}

/**
 * @param {string} message
 * @returns {string}
 */
function translateText(message) {
  if (!message || !current) return message
  const { unabridged, dictionary } = current
  if (unabridged[message]) return unabridged[message]
  const identity = message.substring(message.indexOf(comment))
  if (dictionary[identity]) return dictionary[identity]
  return message.split(comment)[0]
}

/**
 * @typedef {{[key: string]: string}} TranslateContext
 *
 * @param {string} message
 * @param {TranslateContext} [variables]
 */
export function translate(message, variables) {
  let text = translateText(message)
  if (variables && typeof variables === 'object') {
    for (const [key, replacer] of Object.entries(variables)) {
      text = text.replace('%' + key, replacer)
    }
  }
  return text
}

/**
 * @param {HTMLElement} el
 * @param {{value: TranslateContext}} binding
 */
export function translateElement(el, { value }) {
  if (['INPUT', 'TEXTAREA'].includes(el.tagName)) {
    el.placeholder = translate(el.placeholder, value)
  } else {
    el.textContent = translate(el.textContent, value)
  }
}

/**
 * @param {{[locale: string]: Dictionary}} data
 */
export function addTranslations(data) {
  for (const [locale, dictionary] of Object.entries(data)) {
    const translation = getTranslation(locale)
    addDictionary(translation, dictionary, Priority.addon)
  }
}

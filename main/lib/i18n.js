const { app, ipcMain } = require('electron')
const findIndex = require('lodash/findIndex')
const memoize = require('lodash/memoize')
const localeEntries = require('../../resources/locales/index.json')
const { userData, resources } = require('../utils/directory')
const { broadcast } = require('./frame')

/**
 * @typedef {Record<string, string>} Dictionary
 *
 * @typedef Translation
 * @property {string[]} locales
 * @property {Dictionary} dictionary
 * @property {Priority} priority
 */

/**
 * @enum {number}
 */
const Priority = {
  custom: 0,
  addon: 1,
  builtin: 2,
}

const DELIMITER = '#!'

let language = ''

/**
 * @type {Translation[]}
 */
const translations = []

const getDictionary = memoize(() => {
  const availableTranslations = translations.filter(
    item => item.locales.includes(language)
  )
  availableTranslations.sort((a, b) => a.priority - b.priority)
  const sources = availableTranslations.map(item => item.dictionary)
  /** @type {Dictionary} */
  const dictionary = Object.assign({}, ...sources)
  return dictionary
})

function updateTranslation() {
  getDictionary.cache.clear()
  broadcast('dictionary-updated', getDictionary())
}

/**
 * @param {Translation['locales']} locales
 * @param {Translation['dictionary']} dictionary
 * @param {Translation['priority']} priority
 */
function addTranslation(locales, dictionary, priority = Priority.custom) {
  translations.push({ locales, dictionary, priority })
  updateTranslation()
}

/**
 * @param {Translation['locales']} locales
 * @param {Translation['dictionary']} dictionary
 * @param {Translation['priority']} priority
 */
function removeTranslation(locales, dictionary, priority = Priority.custom) {
  const index = findIndex(translations, { locales, dictionary, priority })
  if (index !== -1) {
    translations.splice(index, 1)
    updateTranslation()
  }
}

/**
 * @param {string} locale
 */
function loadBuiltinTranslation(locale) {
  const entry = localeEntries.find(item => item.locales.includes(locale))
  if (!entry) return
  const data = resources.require(`locales/${entry.file}`)
  addTranslation(entry.locales, data, Priority.builtin)
}

async function loadTranslation() {
  const custom = await userData.load('translation.json') || {}
  if (custom['@use']) language = custom['@use']
  else language = app.getLocale()
  loadBuiltinTranslation(language)
  addTranslation(language, custom, Priority.custom)
}

/**
 * @param {string} text
 */
function translateText(text) {
  if (!text) return text
  const dictionary = getDictionary()
  if (dictionary[text]) return dictionary[text]
  return text.split(DELIMITER)[0]
}

/**
 * @param {string} text
 * @param {Record<string, string>} [variables]
 */
function translate(text, variables) {
  let translatedText = translateText(text)
  if (!variables) return translatedText
  return translatedText.replace(/%([A-Z]+)/g, (original, key) => {
    return typeof variables[key] === 'string' ? variables[key] : original
  })
}

function handleI18NMessages() {
  ipcMain.handle('get-dictionary', () => {
    return getDictionary()
  })
}

module.exports = {
  loadTranslation,
  translate,
  addTranslation,
  removeTranslation,
  handleI18NMessages,
}

import { EventEmitter } from 'events'
import { app, ipcMain } from 'electron'
import findIndex from 'lodash/findIndex'
import memoize from 'lodash/memoize'
import type { Dictionary, TranslationVariables } from '../../typings/i18n'
import { userData, resources } from '../utils/directory'
import { broadcast } from './frame'

const localeEntries: LocaleEntry[] = require('../../resources/locales/index.json')

interface LocaleEntry {
  locales: string[],
  file: string,
}

interface Translation {
  locales: string[],
  dictionary: Dictionary,
  priority: Priority,
}

const getI18NEvents = memoize(() => {
  return new EventEmitter()
})

enum Priority {
  custom = 0,
  addon = 1,
  builtin = 2
}

const DELIMITER = '#!'

let language = ''

const translations: Translation[] = []

const getDictionary = memoize(() => {
  const availableTranslations = translations.filter(
    item => item.locales.includes(language)
  )
  availableTranslations.sort((a, b) => a.priority - b.priority)
  const sources = availableTranslations.map(item => item.dictionary)
  const dictionary: Dictionary = Object.assign({}, ...sources)
  return dictionary
})

function updateTranslation() {
  getDictionary.cache.clear?.()
  const dictionary = getDictionary()
  broadcast('dictionary-updated', dictionary)
  const events = getI18NEvents()
  events.emit('updated', dictionary)
}

function addTranslation(locales: string[], dictionary: Dictionary, priority = Priority.custom) {
  translations.push({ locales, dictionary, priority })
  updateTranslation()
}

function removeTranslation(locales: string[], dictionary: Dictionary, priority = Priority.custom) {
  const index = findIndex(translations, { locales, dictionary, priority })
  if (index !== -1) {
    translations.splice(index, 1)
    updateTranslation()
  }
}

function loadBuiltinTranslation(locale: string) {
  const entry = localeEntries.find(item => item.locales.includes(locale))
  if (!entry) return
  const data = resources.require<Dictionary>(`locales/${entry.file}`)!
  addTranslation(entry.locales, data, Priority.builtin)
}

async function loadTranslation() {
  const custom = (await userData.load<Dictionary>('translation.json')) ?? {}
  if (custom['@use']) language = custom['@use']
  else language = app.getLocale()
  loadBuiltinTranslation(language)
  addTranslation([language], custom, Priority.custom)
}

function translateText(text: string) {
  if (!text) return text
  const dictionary = getDictionary()
  if (dictionary[text]) return dictionary[text]
  return text.split(DELIMITER)[0]
}

function translate(text: string, variables?: TranslationVariables) {
  const translatedText = translateText(text)
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

export {
  loadTranslation,
  translate,
  addTranslation,
  removeTranslation,
  handleI18NMessages,
  getI18NEvents,
}

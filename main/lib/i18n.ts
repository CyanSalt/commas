import { EventEmitter } from 'events'
import * as path from 'path'
import { app, ipcMain } from 'electron'
import memoize from 'lodash/memoize'
import type { Dictionary, TranslationVariables } from '../../typings/i18n'
import { userData, resources } from '../utils/directory'
import { broadcast } from './frame'

export interface TranslationFileEntry {
  locale: string,
  file: string,
}

export enum Priority {
  custom = 0,
  addon = 1,
  builtin = 2
}

interface Translation {
  file: string,
  dictionary: Dictionary,
  priority: Priority,
}

const getI18NEvents = memoize(() => {
  return new EventEmitter()
})

const DELIMITER = '#!'

let resolveLanguage: (value: string) => void

const languagePromise = new Promise<string>((resolve) => {
  resolveLanguage = resolve
})

function getLanguage() {
  return languagePromise
}

const translations: Translation[] = []

const getDictionary = memoize(() => {
  const sources = [...translations]
    .sort((a, b) => a.priority - b.priority)
    .map(item => item.dictionary)
  const dictionary: Dictionary = Object.assign({}, ...sources)
  return dictionary
})

function updateDictionary() {
  getDictionary.cache.clear?.()
  const dictionary = getDictionary()
  broadcast('dictionary-updated', dictionary)
  const events = getI18NEvents()
  events.emit('updated', dictionary)
}

function loadDictionary(entry: TranslationFileEntry, priority: Priority) {
  const file = entry.file
  const dictionary = __non_webpack_require__(file) as Dictionary
  translations.push({ file, dictionary, priority })
  updateDictionary()
}

async function addTranslations(entries: TranslationFileEntry[], priority: Priority) {
  const language = await getLanguage()
  let matched = entries.find(item => item.locale === language)
  if (!matched) {
    const sepIndex = language.indexOf('-')
    const lang = sepIndex !== -1 ? language.slice(0, sepIndex) : language
    matched = entries.find(item => item.locale.startsWith(`${lang}-`))
  }
  if (matched) {
    loadDictionary(matched, priority)
  }
  return matched
}

function removeTranslation(entry: TranslationFileEntry) {
  const index = translations.findIndex(item => item.file === entry.file)
  if (index !== -1) {
    translations.splice(index, 1)
    updateDictionary()
  }
}

async function loadBuiltinTranslations() {
  const locales = await resources.entries('locales')
  const entries = locales.map(file => ({
    locale: path.basename(file, '.json'),
    file: resources.file(`locales/${file}`),
  }))
  addTranslations(entries, Priority.builtin)
}

async function loadTranslations() {
  const custom = (await userData.load<Dictionary>('translation.json')) ?? {}
  if (custom['@use']) {
    resolveLanguage(custom['@use'])
  } else {
    await app.whenReady()
    resolveLanguage(app.getLocale())
  }
  await loadBuiltinTranslations()
  // Custom translation
  translations.push({
    file: userData.file('translation.json'),
    dictionary: custom,
    priority: Priority.custom,
  })
  updateDictionary()
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
  getLanguage,
  loadTranslations,
  translate,
  addTranslations,
  removeTranslation,
  handleI18NMessages,
  getI18NEvents,
}

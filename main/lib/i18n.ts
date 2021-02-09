import { EventEmitter } from 'events'
import { app, ipcMain } from 'electron'
import findIndex from 'lodash/findIndex'
import memoize from 'lodash/memoize'
import type { Dictionary, TranslationVariables } from '../../typings/i18n'
import { userData, resources } from '../utils/directory'
import { broadcast } from './frame'

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

async function loadBuiltinTranslation(locale: string) {
  const locales = await resources.entries('locales')
  let data: Dictionary | undefined
  if (locales.includes(`${locale}.json`)) {
    data = resources.require<Dictionary>(`locales/${locale}.json`)!
  } else {
    const sepIndex = locale.indexOf('-')
    const lang = sepIndex !== -1 ? locale.slice(0, sepIndex) : locale
    const dialect = locales.find(item => item.startsWith(`${lang}-`))
    if (dialect) {
      data = resources.require<Dictionary>(`locales/${dialect}`)!
    }
  }
  if (data) {
    addTranslation([locale], data, Priority.builtin)
  }
}

async function loadTranslation() {
  const custom = (await userData.load<Dictionary>('translation.json')) ?? {}
  if (custom['@use']) language = custom['@use']
  else language = app.getLocale()
  await loadBuiltinTranslation(language)
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

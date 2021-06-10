import * as fs from 'fs'
import * as path from 'path'
import { computed, markRaw, ref, unref } from '@vue/reactivity'
import { app } from 'electron'
import { userData, resources } from '../utils/directory'
import { provideIPC } from '../utils/hooks'
import type { Dictionary, TranslationVariables } from '../../typings/i18n'

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

const DELIMITER = '#!'

let resolveLanguage: (value: string) => void

const languagePromise = new Promise<string>((resolve) => {
  resolveLanguage = resolve
})

function getLanguage() {
  return languagePromise
}

const translationsRef = ref<Translation[]>([])

const dictionaryRef = computed(() => {
  const translations = unref(translationsRef)
  const sources = [...translations]
    .sort((a, b) => a.priority - b.priority)
    // Strange issue: Cannot read property 'dictionary' of undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    .map(item => item?.dictionary)
  const dictionary: Dictionary = Object.assign({}, ...sources)
  return dictionary
})

function loadDictionary(entry: TranslationFileEntry, priority: Priority) {
  const file = entry.file
  const dictionary = __non_webpack_require__(file) as Dictionary
  const translations = unref(translationsRef)
  translations.push(markRaw({ file, dictionary, priority }))
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

async function addTranslationDirectory(directory: string, priority: Priority) {
  const files = await fs.promises.readdir(directory)
  const entries = files.map(file => ({
    locale: path.basename(file, '.json'),
    file: path.join(directory, file),
  }))
  return addTranslations(entries, priority)
}

function removeTranslation(entry: TranslationFileEntry) {
  const translations = unref(translationsRef)
  const index = translations.findIndex(item => item.file === entry.file)
  if (index !== -1) {
    translations.splice(index, 1)
  }
}

async function loadTranslations() {
  const custom = (await userData.loadYAML<Dictionary>('translation.yaml')) ?? {}
  if (custom['@use']) {
    resolveLanguage(custom['@use'])
  } else {
    await app.whenReady()
    resolveLanguage(app.getLocale())
  }
  // Built-in
  await addTranslationDirectory(resources.file('locales'), Priority.builtin)
  // Custom translation
  const translations = unref(translationsRef)
  translations.push(markRaw({
    file: userData.file('translation.yaml'),
    dictionary: custom,
    priority: Priority.custom,
  }))
}

function translateText(text: string) {
  if (!text) return text
  const dictionary = unref(dictionaryRef)
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
  provideIPC('dictionary', dictionaryRef)
}

export {
  getLanguage,
  loadTranslations,
  translate,
  addTranslations,
  addTranslationDirectory,
  removeTranslation,
  handleI18NMessages,
}

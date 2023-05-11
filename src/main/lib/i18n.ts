import * as fs from 'node:fs'
import * as path from 'node:path'
import { effect, shallowReactive } from '@vue/reactivity'
import { app } from 'electron'
import { watchBaseEffect, useAsyncComputed } from '../../shared/compositions'
import type { Dictionary, TranslationVariables } from '../../typings/i18n'
import { provideIPC, useYAMLFile } from '../utils/compositions'
import { resourceFile, userFile } from '../utils/directory'

export interface TranslationFileEntry {
  locale: string,
  file: string,
}

export enum Priority {
  custom = 0,
  addon = 1,
  builtin = 2,
}

interface Translation {
  file: string,
  dictionary: Dictionary,
  priority: Priority,
}

const DELIMITER = '#!'

const locale = $(useAsyncComputed(async () => {
  await app.whenReady()
  return app.getLocale()
}))

let userDictionary = $(useYAMLFile<Dictionary>(userFile('translation.yaml'), {}))

const language = $computed<string | undefined>({
  get() {
    if (userDictionary['@use']) {
      return userDictionary['@use']
    } else {
      return locale
    }
  },
  set(value) {
    userDictionary = {
      ...userDictionary,
      '@use': value === locale ? '' : value,
    }
  },
})

const translations = shallowReactive(new Set<Translation>())

const dictionary = $computed(() => {
  const sources = [...translations]
    .sort((a, b) => a.priority - b.priority)
    .map(item => item.dictionary)
  const value: Dictionary = Object.assign({}, ...sources)
  return value
})

function loadTranslationEntry(entry: TranslationFileEntry, priority: Priority) {
  const file = entry.file
  const source = require(file) as Dictionary
  const translation: Translation = { file, dictionary: source, priority }
  translations.add(translation)
  return translation
}

function addTranslations(entries: TranslationFileEntry[], priority: Priority) {
  return watchBaseEffect(async (onInvalidate) => {
    if (!language) return
    let matched = entries.find(item => item.locale === language)
    if (!matched) {
      const sepIndex = language.indexOf('-')
      const lang = sepIndex !== -1 ? language.slice(0, sepIndex) : language
      matched = entries.find(item => item.locale.startsWith(`${lang}-`))
    }
    const defaultEntry = entries.find(item => item.locale === 'default')
    const matchedEntries = [defaultEntry, matched]
      .filter((item): item is TranslationFileEntry => Boolean(item))
    if (matchedEntries.length) {
      let loadedTranslations: Translation[]
      onInvalidate(async () => {
        await 'Execution of process below'
        loadedTranslations.forEach(item => {
          removeTranslation(item)
        })
      })
      await 'Avoid tracking the translations'
      loadedTranslations = matchedEntries.map(item => loadTranslationEntry(item, priority))
    }
  })
}

async function addTranslationDirectory(directory: string, priority: Priority) {
  const files = await fs.promises.readdir(directory)
  const entries = files.map(file => ({
    locale: path.basename(file, '.json'),
    file: path.join(directory, file),
  }))
  return addTranslations(entries, priority)
}

function removeTranslation(translation: Translation) {
  const matched = [...translations].find(item => item.file === translation.file)
  if (matched) {
    translations.delete(matched)
  }
}

function loadBuiltinTranslations() {
  return addTranslationDirectory(resourceFile('locales'), Priority.builtin)
}

async function loadCustomTranslation() {
  const translation: Translation = {
    file: userFile('translation.yaml'),
    dictionary: userDictionary,
    priority: Priority.custom,
  }
  removeTranslation(translation)
  translations.add(translation)
}

async function loadTranslations() {
  await loadBuiltinTranslations()
  effect(() => {
    loadCustomTranslation()
  })
}

function translateText(text: string) {
  if (!text) return text
  const translated = dictionary[text]
  if (translated) return translated
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
  provideIPC('language', $$(language))
  provideIPC('dictionary', $$(dictionary))
}

export {
  loadTranslations,
  translate,
  addTranslations,
  addTranslationDirectory,
  handleI18NMessages,
}

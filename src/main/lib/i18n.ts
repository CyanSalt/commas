import * as fs from 'fs'
import * as path from 'path'
import { computed, customRef, effect, shallowReactive, unref } from '@vue/reactivity'
import { app } from 'electron'
import type { Dictionary, TranslationVariables } from '../../../typings/i18n'
import { provideIPC, useEffect } from '../utils/compositions'
import { userData, resources } from '../utils/directory'

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

const localeRef = customRef<string | undefined>((track, trigger) => {
  let locale
  app.whenReady().then(() => {
    locale = app.getLocale()
    trigger()
  })
  return {
    get() {
      track()
      return locale
    },
    set() {
      throw new Error('Cannot set locale at runtime.')
    },
  }
})

const userDictionaryRef = userData.useYAML<Dictionary>('translation.yaml', {})

const languageRef = computed<string | undefined>({
  get() {
    const userDictionary = unref(userDictionaryRef)
    if (userDictionary['@use']) {
      return userDictionary['@use']
    } else {
      return unref(localeRef)
    }
  },
  set(value) {
    const userDictionary = unref(userDictionaryRef)
    const language = unref(languageRef)
    userDictionaryRef.value = {
      ...userDictionary,
      '@use': value === language ? '' : value,
    }
  },
})

const translations = shallowReactive(new Set<Translation>())

const dictionaryRef = computed(() => {
  const sources = [...translations]
    .sort((a, b) => a.priority - b.priority)
    .map(item => item.dictionary)
  const dictionary: Dictionary = Object.assign({}, ...sources)
  return dictionary
})

function loadDictionary(entry: TranslationFileEntry, priority: Priority) {
  const file = entry.file
  const dictionary = require(file) as Dictionary
  const translation: Translation = { file, dictionary, priority }
  translations.add(translation)
  return translation
}

function addTranslations(entries: TranslationFileEntry[], priority: Priority) {
  return useEffect(async (onInvalidate) => {
    const language = unref(languageRef)
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
      await 'Avoid tracking the translationsRef'
      loadedTranslations = matchedEntries.map(item => loadDictionary(item, priority))
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
  return addTranslationDirectory(resources.file('locales'), Priority.builtin)
}

async function loadCustomTranslation() {
  const userDictionary = unref(userDictionaryRef)
  const translation: Translation = {
    file: userData.file('translation.yaml'),
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
  const dictionary = unref(dictionaryRef)
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
  provideIPC('language', languageRef)
  provideIPC('dictionary', dictionaryRef)
}

export {
  loadTranslations,
  translate,
  addTranslations,
  addTranslationDirectory,
  handleI18NMessages,
}

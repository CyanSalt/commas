import { last } from 'lodash-es'
import { computed, unref } from 'vue'
import type { DirectiveBinding } from 'vue'
import type { Dictionary, TranslationVariables } from '../../typings/i18n'
import { injectIPC } from './hooks'

const DELIMITER = '#!'

function getTextSequence(text: string, readable?: boolean) {
  return readable ? text.split(DELIMITER)[0] : last(text.split(DELIMITER))!
}

const dictionaryRef = injectIPC<Dictionary>('dictionary', {})

const databaseRef = computed(() => {
  const dictionary = unref(dictionaryRef)
  const database: Dictionary = Object.fromEntries(Object.entries(dictionary).map(
    ([key, value]) => [getTextSequence(key, false), value]
  ))
  return database
})

const conciseDictionaryRef = computed(() => {
  const dictionary = unref(dictionaryRef)
  const conciseDictionary: Dictionary = Object.fromEntries(Object.entries(dictionary).map(
    ([key, value]) => [getTextSequence(key, true), value]
  ))
  return conciseDictionary
})

function translateText(text: string) {
  if (!text) return text
  const dictionary = unref(dictionaryRef)
  if (dictionary[text]) return dictionary[text]
  const database = unref(databaseRef)
  const identity = getTextSequence(text, false)
  if (database[identity]) return database[identity]
  const conciseDictionary = unref(conciseDictionaryRef)
  const readableText = getTextSequence(text, true)
  if (conciseDictionary[readableText]) return conciseDictionary[readableText]
  return readableText
}

export function translate(text: string, variables?: TranslationVariables) {
  const translatedText = translateText(text)
  if (!variables) return translatedText
  return translatedText.replace(/%([A-Z]+)/g, (original, key) => {
    return typeof variables[key] === 'string' ? variables[key] : original
  })
}

export function translateElement(el: HTMLElement, { arg, value }: DirectiveBinding<TranslationVariables>) {
  const attr = arg ?? 'textContent'
  const originalAttr = `i18n:${attr}(original)`
  const replacedAttr = `i18n:${attr}`
  if (el[attr] !== el[replacedAttr] || el[originalAttr] === undefined) {
    el[originalAttr] = el[attr]
  }
  const content = translate(el[originalAttr], value)
  el[attr] = content
  el[replacedAttr] = content
}

import { last } from 'lodash-es'
import { computed, unref } from 'vue'
import type { Directive, VNode } from 'vue'
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
    ([key, value]) => [getTextSequence(key, false), value],
  ))
  return database
})

const conciseDictionaryRef = computed(() => {
  const dictionary = unref(dictionaryRef)
  const conciseDictionary: Dictionary = Object.fromEntries(Object.entries(dictionary).map(
    ([key, value]) => [getTextSequence(key, true), value],
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

function getVNodeTextContent(vnode: VNode): string {
  return Array.isArray(vnode.children)
    ? vnode.children.map(getVNodeTextContent).join('')
    : String(vnode.children ?? '')
}

export const translateElement: Directive<HTMLElement, TranslationVariables> = (el, { arg, value }, vnode) => {
  const attr = arg ?? 'textContent'
  const text = arg ? String(vnode.props?.[arg] ?? '') : getVNodeTextContent(vnode)
  el[attr] = translate(text, value)
}

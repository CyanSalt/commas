import type { Dictionary, TranslationVariables } from '@commas/types/i18n'
import type { VNode } from 'vue'
import { interpolateText } from '../../shared/text'
import { injectIPC } from './compositions'
import { createReactiveDirective } from './directives'

const DELIMITER = '#!'

function getTextSequence(text: string, readable?: boolean) {
  const sequences = text.split(DELIMITER)
  return readable ? sequences[0] : sequences[sequences.length - 1]
}

const dictionary = $(injectIPC('dictionary', {}))

const database = $computed<Dictionary>(() => {
  return Object.fromEntries(Object.entries(dictionary).map(
    ([key, value]) => [getTextSequence(key, false), value],
  ))
})

const conciseDictionary = $computed<Dictionary>(() => {
  return Object.fromEntries(Object.entries(dictionary).map(
    ([key, value]) => [getTextSequence(key, true), value],
  ))
})

function translateText(text: string) {
  if (!text) return text
  let translated = dictionary[text]
  if (translated) return translated
  const identity = getTextSequence(text, false)
  translated = database[identity]
  if (translated) return translated
  const readableText = getTextSequence(text, true)
  translated = conciseDictionary[readableText]
  if (translated) return translated
  return readableText
}

export function translate(text: string, variables?: TranslationVariables) {
  const translatedText = translateText(text)
  return interpolateText(translatedText, variables)
}

function getVNodeTextContent(vnode: VNode): string {
  return Array.isArray(vnode.children)
    ? vnode.children.map(getVNodeTextContent).join('')
    : String(vnode.children ?? '')
}

export const vI18n = createReactiveDirective<HTMLElement, TranslationVariables | undefined>(
  (el, { arg, value }, vnode) => {
    const attr = arg ?? 'textContent'
    const text = arg ? String(vnode.props?.[arg] ?? '') : getVNodeTextContent(vnode)
    el[attr] = translate(text, value)
  },
)

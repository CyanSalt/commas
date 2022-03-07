import { last } from 'lodash-es'
import type { VNode } from 'vue'
import type { Dictionary, TranslationVariables } from '../../typings/i18n'
import { injectIPC } from './compositions'
import { createReactiveDirective } from './directives'

const DELIMITER = '#!'

function getTextSequence(text: string, readable?: boolean) {
  return readable ? text.split(DELIMITER)[0] : last(text.split(DELIMITER))!
}

const dictionary = $(injectIPC<Dictionary>('dictionary', {}))

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

export const translateElement = createReactiveDirective<HTMLElement, TranslationVariables>(
  (el, { arg, value }, vnode) => {
    const attr = arg ?? 'textContent'
    const text = arg ? String(vnode.props?.[arg] ?? '') : getVNodeTextContent(vnode)
    el[attr] = translate(text, value)
  },
)

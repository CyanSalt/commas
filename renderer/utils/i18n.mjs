import { last } from 'lodash-es'
import { computed, unref } from 'vue'
import { useRemoteData } from '../hooks/remote'

/**
 * @typedef {Record<string, string>} Dictionary
 *
 * @typedef {import('vue').DirectiveBinding<Record<string, string>>} TranlateDirectiveBinding
 */

const DELIMITER = '#!'

/**
 * @param {string} text
 * @param {boolean} [readable]
 */
function getTextSequence(text, readable) {
  return readable ? text.split(DELIMITER)[0] : last(text.split(DELIMITER))
}

const dictionaryRef = useRemoteData({}, {
  getter: 'get-dictionary',
  effect: 'dictionary-updated',
})

const databaseRef = computed(() => {
  const dictionary = unref(dictionaryRef)
  /** @type {Dictionary} */
  const database = Object.fromEntries(Object.entries(dictionary).map(
    ([key, value]) => [getTextSequence(key, false), value]
  ))
  return database
})

const conciseDictionaryRef = computed(() => {
  const dictionary = unref(dictionaryRef)
  /** @type {Dictionary} */
  const conciseDictionary = Object.fromEntries(Object.entries(dictionary).map(
    ([key, value]) => [getTextSequence(key, true), value]
  ))
  return conciseDictionary
})

function translateText(text) {
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

/**
 * @param {string} text
 * @param {Record<string, string>} [variables]
 */
export function translate(text, variables) {
  let translatedText = translateText(text)
  if (!variables) return translatedText
  return translatedText.replace(/%([A-Z]+)/g, (original, key) => {
    return typeof variables[key] === 'string' ? variables[key] : original
  })
}

/**
 * @param {HTMLElement} el
 * @param {TranlateDirectiveBinding} binding
 */
export function translateElement(el, { arg, value }) {
  const attr = arg || 'textContent'
  const originalAttr = `i18n:${attr}(original)`
  if (el[originalAttr] === undefined) {
    el[originalAttr] = el[attr]
  }
  el[attr] = translate(el[originalAttr], value)
}

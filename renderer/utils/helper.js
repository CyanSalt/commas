import { exec as execCallback } from 'child_process'
import { promisify } from 'util'

/**
 * @typedef {import('../hooks/settings').SettingSpec} SettingSpec
 */

export const exec = promisify(execCallback)

/**
 * @template T
 * @param {T} object
 * @returns {T}
 */
export const unreactive = object => new Proxy(object, {
  // Prevent `__ob__` and getters/setters
  defineProperty: () => true,
  // Prevent deep traversing
  // notice that 'ownKeys' must contains unconfigurable keys
  ownKeys: () => Object.entries(Object.getOwnPropertyDescriptors(object))
    .filter(([key, value]) => !value.configurable)
    .map(([key, value]) => key),
})

/**
 * @param {string} expression
 */
export function regexp(expression) {
  const matches = expression.match(/^s\/(.+)\/([a-z]+)?$/)
  if (!matches) return null
  try {
    return new RegExp(matches[1], matches[2])
  } catch {
    return null
  }
}

/**
 * @param {SettingSpec} specs
 */
export function generateSource(specs) {
  const sources = []
  for (const spec of specs) {
    if (sources.length) {
      sources[sources.length - 1] += ',\n'
    }
    if (spec.comments) {
      for (const comment of spec.comments) {
        sources.push(`// ${comment}`)
      }
    }
    const key = JSON.stringify(spec.key)
    const value = JSON.stringify(spec.default, null, 2)
    const entry = `${key}: ${value}`
    const lines = entry.split('\n')
    for (const line of lines) {
      sources.push(line)
    }
  }
  return ['{', ...sources.map(line => (line ? `  ${line}` : '')), '}', '']
    .join('\n')
}

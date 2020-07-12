import { memoize } from 'lodash-es'

/**
 * @typedef Theme
 * @property {string} name
 * @property {'light'|'dark'} type
 * @property {string} foreground
 * @property {string} background
 * @property {string} [selection]
 * @property {string} [cursor]
 * @property {string} [cursorAccent]
 * @property {string} black
 * @property {string} red
 * @property {string} green
 * @property {string} yellow
 * @property {string} blue
 * @property {string} magenta
 * @property {string} cyan
 * @property {string} white
 * @property {string} brightBlack
 * @property {string} brightRed
 * @property {string} brightGreen
 * @property {string} brightYellow
 * @property {string} brightBlue
 * @property {string} brightMagenta
 * @property {string} brightCyan
 * @property {string} brightWhite
 */

const createCalculator = memoize(() => {
  return document.createElement('div')
})

/**
 * @param {string} color
 */
function normalizeColor(color) {
  const element = createCalculator()
  element.style.color = color
  return element.style.color
}

/**
 * @param {string} color
 */
export function hasAlphaChannel(color) {
  color = normalizeColor(color)
  return color.startsWith('rgba(')
}

/**
 * @param {string} color
 * @param {number} alpha
 */
export function rgba(color, alpha) {
  color = normalizeColor(color)
  if (!color.startsWith('rgb(')) return color
  return `rgba(${color.slice(4, -1)}, ${alpha})`
}

/**
 * @param {string} color
 */
export function rgb(color) {
  color = normalizeColor(color)
  if (!hasAlphaChannel(color)) return color
  return color.split(',').slice(0, -1).join(',') + ')'
}

/**
 * @param {string} value
 */
export function color(value) {
  const dimensions = normalizeColor(value).match(/\((.+)\)/)[1].split(',')
    .map(value => Number(value.trim()))
  return {
    r: dimensions[0],
    g: dimensions[1],
    b: dimensions[2],
    a: dimensions.length > 3 ? dimensions[3] : 1,
  }
}

/**
 * @param {string} color1
 * @param {string} color2
 */
export function distance(color1, color2) {
  const c1 = color(color1)
  const c2 = color(color2)
  return (c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2
}

/**
 * @param {string} color1
 * @param {string} color2
 * @param {number} weight
 */
export function mix(color1, color2, weight) {
  const c1 = color(color1)
  const c2 = color(color2)
  const w1 = weight
  const w2 = 1 - weight
  const r = Math.round(w1 * c1.r + w2 * c2.r)
  const g = Math.round(w1 * c1.g + w2 * c2.g)
  const b = Math.round(w1 * c1.b + w2 * c2.b)
  return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')
}

const parseRGBA = require('color-rgba')

/**
 * @typedef {Object} RGBA
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */

/**
 * @param {string} color
 * @returns {RGBA}
 */
function toRGBA(color) {
  const channels = parseRGBA(color)
  return {
    r: channels[0],
    g: channels[1],
    b: channels[2],
    a: channels[3],
  }
}

/**
 * @param {RGBA} rgba
 */
function toCSSColor(rgba) {
  return rgba.a < 1 ? `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
    : `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`
}

/**
 * @param {RGBA} rgba1
 * @param {RGBA} rgba2
 */
function distance(rgba1, rgba2) {
  return (rgba1.r - rgba2.r) ** 2 + (rgba1.g - rgba2.g) ** 2 + (rgba1.b - rgba2.b) ** 2
}

/**
 * @param {RGBA} rgba
 */
function isDarkColor(rgba) {
  return distance(rgba, { r: 0, g: 0, b: 0, a: 1 })
    < distance(rgba, { r: 255, g: 255, b: 255, a: 1 })
}

/**
 * @param {RGBA} rgba1
 * @param {RGBA} rgba2
 * @param {number} weight
 */
function mix(rgba1, rgba2, weight) {
  const w1 = weight
  const w2 = 1 - weight
  return {
    r: Math.round(w1 * rgba1.r + w2 * rgba2.r),
    g: Math.round(w1 * rgba1.g + w2 * rgba2.g),
    b: Math.round(w1 * rgba1.b + w2 * rgba2.b),
    a: Math.round(w1 * rgba1.a + w2 * rgba2.a),
  }
}

module.exports = {
  toRGBA,
  toCSSColor,
  distance,
  isDarkColor,
  mix,
}

import { colord } from 'colord'

interface RGBA {
  r: number,
  g: number,
  b: number,
  a: number,
}

export function toRGBA(color: string): RGBA {
  return colord(color).toRgb()
}

export function toCSSColor(rgba: RGBA) {
  return `rgb(${rgba.r} ${rgba.g} ${rgba.b} / ${rgba.a})`
}

function toHexChannel(channel: number) {
  return channel.toString(16).toUpperCase().padStart(2, '0')
}

export function toCSSHEX(rgba: RGBA) {
  return colord(rgba).toHex()
}

export function toElectronHEX(rgba: RGBA) {
  return '#' + [
    rgba.a < 1 ? toHexChannel(Math.floor(256 * rgba.a)) : '',
    toHexChannel(rgba.r),
    toHexChannel(rgba.g),
    toHexChannel(rgba.b),
  ].join('')
}

export function isDarkColor(rgba: RGBA) {
  // YIQ equation from http://24ways.org/2010/calculating-color-contrast
  const yiq = (rgba.r * 2126 + rgba.g * 7152 + rgba.b * 722) / 10000
  return yiq < 128
}

export function mix(rgba1: RGBA, rgba2: RGBA, weight: number) {
  const w1 = weight
  const w2 = 1 - weight
  return {
    r: Math.round(w1 * rgba1.r + w2 * rgba2.r),
    g: Math.round(w1 * rgba1.g + w2 * rgba2.g),
    b: Math.round(w1 * rgba1.b + w2 * rgba2.b),
    a: Math.round(w1 * rgba1.a + w2 * rgba2.a),
  }
}

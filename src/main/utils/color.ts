import * as conversions from 'color-convert'
import parseRGBA from 'color-rgba'

interface RGBA {
  r: number,
  g: number,
  b: number,
  a: number,
}

function toRGBA(color: string): RGBA {
  const channels = parseRGBA(color)!
  return {
    r: channels[0],
    g: channels[1],
    b: channels[2],
    a: channels[3],
  }
}

interface HSLA {
  h: number,
  s: number,
  l: number,
  a: number,
}

function toHSLA(rgba: RGBA): HSLA {
  const [h, s, l] = conversions.rgb.hsl([rgba.r, rgba.g, rgba.b])
  return { h, s: s / 100, l: l / 100, a: rgba.a }
}

function toRGBAFromHSLA(hsla: HSLA): RGBA {
  const [r, g, b] = conversions.hsl.rgb([hsla.h, hsla.s * 100, hsla.l * 100])
  return { r, g, b, a: hsla.a }
}

function toCSSColor(rgba: RGBA) {
  return `rgb(${rgba.r} ${rgba.g} ${rgba.b} / ${rgba.a})`
}

function toHexChannel(channel: number) {
  return channel.toString(16).toUpperCase().padStart(2, '0')
}

function toCSSHEX(rgba: RGBA) {
  return '#' + [
    toHexChannel(rgba.r),
    toHexChannel(rgba.g),
    toHexChannel(rgba.b),
    rgba.a < 1 ? toHexChannel(Math.floor(256 * rgba.a)) : '',
  ].join('')
}

function toElectronHEX(rgba: RGBA) {
  return '#' + [
    rgba.a < 1 ? toHexChannel(Math.floor(256 * rgba.a)) : '',
    toHexChannel(rgba.r),
    toHexChannel(rgba.g),
    toHexChannel(rgba.b),
  ].join('')
}

function isDarkColor(rgba: RGBA) {
  // YIQ equation from http://24ways.org/2010/calculating-color-contrast
  const yiq = (rgba.r * 2126 + rgba.g * 7152 + rgba.a * 722) / 10000
  return yiq < 128
}

function mix(rgba1: RGBA, rgba2: RGBA, weight: number) {
  const w1 = weight
  const w2 = 1 - weight
  return {
    r: Math.round(w1 * rgba1.r + w2 * rgba2.r),
    g: Math.round(w1 * rgba1.g + w2 * rgba2.g),
    b: Math.round(w1 * rgba1.b + w2 * rgba2.b),
    a: Math.round(w1 * rgba1.a + w2 * rgba2.a),
  }
}

export {
  toRGBA,
  toHSLA,
  toRGBAFromHSLA,
  toCSSColor,
  toCSSHEX,
  toElectronHEX,
  isDarkColor,
  mix,
}

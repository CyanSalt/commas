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

function toCSSColor(rgba: RGBA) {
  return `rgb(${rgba.r} ${rgba.g} ${rgba.b} / ${rgba.a})`
}

function toHex(channel: number) {
  return channel.toString(16).toUpperCase().padStart(2, '0')
}

function toElectronColor(rgba: RGBA) {
  return '#' + [
    rgba.a < 1 ? toHex(Math.floor(256 * rgba.a)) : '',
    toHex(rgba.r),
    toHex(rgba.g),
    toHex(rgba.b),
  ].join('')
}

function distance(rgba1: RGBA, rgba2: RGBA) {
  return (rgba1.r - rgba2.r) ** 2 + (rgba1.g - rgba2.g) ** 2 + (rgba1.b - rgba2.b) ** 2
}

function isDarkColor(rgba: RGBA) {
  return distance(rgba, { r: 0, g: 0, b: 0, a: 1 })
    < distance(rgba, { r: 255, g: 255, b: 255, a: 1 })
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
  toCSSColor,
  toElectronColor,
  distance,
  isDarkColor,
  mix,
}

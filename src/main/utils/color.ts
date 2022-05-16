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
  const r = rgba.r / 255
  const g = rgba.g / 255
  const b = rgba.b / 255
  const min = Math.min(r, g, b)
  const max = Math.max(r, g, b)
  const delta = max - min

  let h = 0
  if (max === min) {
    // pass
  } else if (r === max) {
    h = (g - b) / delta
  } else if (g === max) {
    h = 2 + (b - r) / delta
  } else if (b === max) {
    h = 4 + (r - g) / delta
  }
  h = Math.min(Math.round(h * 60), 360)
  if (h < 0) {
    h += 360
  }

  const l = (min + max) / 2

  let s: number
  if (l <= 0.5) {
    s = delta / (max + min)
  } else {
    s = delta / (2 - max - min)
  }

  return { h, s, l, a: rgba.a }
}

function toRGBAFromHSLA(hsla: HSLA): RGBA {
  const h = hsla.h / 360
  const s = hsla.s
  const l = hsla.l

  if (s === 0) {
    const value = Math.round(l * 255)
    return { r: value, g: value, b: value, a: hsla.a }
  }

  let t2
  if (l < 0.5) {
    t2 = l * (1 + s)
  } else {
    t2 = l + s - l * s
  }
  const t1 = 2 * l - t2

  const rgb = [0, 0, 0]
  let t3
  for (let i = 0; i < 3; i += 1) {
    t3 = h + 1 / 3 * (1 - i)
    if (t3 < 0) {
      t3 += 1
    }
    if (t3 > 1) {
      t3 -= 1
    }
    let value: number
    if (6 * t3 < 1) {
      value = t1 + (t2 - t1) * 6 * t3
    } else if (2 * t3 < 1) {
      value = t2
    } else if (3 * t3 < 2) {
      value = t1 + (t2 - t1) * (2 / 3 - t3) * 6
    } else {
      value = t1
    }
    rgb[i] = Math.round(value * 255)
  }

  return { r: rgb[0], g: rgb[1], b: rgb[2], a: hsla.a }
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
  toElectronColor,
  isDarkColor,
  mix,
}

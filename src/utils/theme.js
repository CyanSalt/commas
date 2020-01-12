export const colors = [
  'foreground', 'background', 'backdrop',
  'black', 'red', 'green', 'yellow',
  'blue', 'magenta', 'cyan', 'white',
  'brightBlack', 'brightRed', 'brightGreen', 'brightYellow',
  'brightBlue', 'brightMagenta', 'brightCyan', 'brightWhite',
]

let element
function normalizeColor(color) {
  if (!element) element = document.createElement('div')
  element.style.color = color
  return element.style.color
}

function hasAlphaChannel(color) {
  color = normalizeColor(color)
  return color.startsWith('rgba(')
}

export function rgba(color, alpha) {
  color = normalizeColor(color)
  if (!color.startsWith('rgb(')) return color
  return `rgba(${color.slice(4, -1)}, ${alpha})`
}

export function rgb(color) {
  color = normalizeColor(color)
  if (!hasAlphaChannel(color)) return color
  return color.split(',').slice(0, -1).join(',') + ')'
}

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

export function mix(color1, color2, weight) {
  const c1 = color(color1)
  const c2 = color(color2)
  const w1 = weight
  const w2 = 1 - weight
  const r = w1 * c1.r + w2 * c2.r
  const g = w1 * c1.g + w2 * c2.g
  const b = w1 * c1.b + w2 * c2.b
  return `rgb(${r}, ${g}, ${b})`
}

export function normalizeTheme(original) {
  const theme = {...original}
  if (!theme.selection || !hasAlphaChannel(theme.selection)) {
    const weight = theme.type === 'light' ? 0.15 : 0.3
    theme.selection = mix(theme.foreground, theme.background, weight)
  }
  if (!theme.cursor) theme.cursor = theme.foreground
  if (!theme.cursorAccent) theme.cursorAccent = theme.background
  return theme
}

export const colors = [
  'foreground', 'background',
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

export function normalizeTheme(original) {
  const theme = {...original}
  if (!theme.selection || !hasAlphaChannel(theme.selection)) {
    const alpha = theme.type === 'light' ? 0.15 : 0.3
    theme.selection = rgba(theme.foreground, alpha)
  }
  if (!theme.cursor) theme.cursor = theme.foreground
  if (!theme.cursorAccent) theme.cursorAccent = theme.background
  return theme
}

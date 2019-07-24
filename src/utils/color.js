let element
function normalizeColor(color) {
  if (!element) element = document.createElement('div')
  element.style.color = color
  return element.style.color
}

export function hasAlphaChannel(color) {
  color = normalizeColor(color)
  return color.startsWith('rgba(')
}

export function rgba(color, alpha) {
  color = normalizeColor(color)
  if (!color.startsWith('rgb(')) return color
  return `rgba(${color.slice(4, -1)}, ${alpha})`
}

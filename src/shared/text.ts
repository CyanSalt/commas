export function getWords(text: string) {
  return text.trim().toLowerCase().split(/\s+/)
    .map(item => item.trim())
    .filter(Boolean)
}

export function matches(source: string | string[], keywords: string | string[]) {
  const words = Array.isArray(keywords) ? keywords : getWords(keywords)
  if (!words.length) return true
  const text = (Array.isArray(source) ? source.join(' ') : source).toLowerCase()
  return words.every(item => text.includes(item))
}

export function interpolateText(text: string, variables?: Record<string, unknown>) {
  if (!variables) return text
  return text.replace(/%([A-Z]+)%?/g, (original, key) => {
    const variable = variables[key]
    return typeof variable === 'string' ? variable : original
  })
}

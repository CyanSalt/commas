export function parseITerm2EscapeSequence(data: string) {
  const equalsIndex = data.indexOf('=')
  const command = equalsIndex === -1 ? data : data.slice(0, equalsIndex)
  const positional = equalsIndex === -1 ? '' : data.slice(equalsIndex + 1)
  const colonIndex = positional.indexOf(':')
  const argString = colonIndex === -1 ? positional : positional.slice(0, colonIndex)
  const args = argString.split(';').reduce<Record<string, string>>((collection, line) => {
    const semiIndex = line.indexOf('=')
    if (semiIndex !== -1) {
      collection[line.slice(0, semiIndex)] = line.slice(semiIndex + 1)
    }
    return collection
  }, {})
  const body = Buffer.from(colonIndex === -1 ? '' : positional.slice(colonIndex + 1), 'base64')
  return {
    command,
    positional,
    args,
    body,
  }
}

export function calculateDOM<T, U extends HTMLElement = HTMLDivElement>(
  fn: (insertedElement: U) => T,
  targetElement?: U,
) {
  const el = targetElement ?? document.createElement('div') as unknown as U
  el.style.position = 'fixed'
  el.style.pointerEvents = 'none'
  el.style.opacity = '0'
  document.body.append(el)
  const result = fn(el)
  el.remove()
  return result
}

export function loadingElement<T extends HTMLElement>(element: T) {
  if (element instanceof HTMLImageElement && element.complete) {
    return element
  }
  return new Promise<T>((resolve, reject) => {
    element.addEventListener('load', () => {
      resolve(element)
    })
    element.addEventListener('error', (event: ErrorEvent) => {
      reject(event.error)
    })
  })
}

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

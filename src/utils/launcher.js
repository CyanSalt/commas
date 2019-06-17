import {createIDGenerator} from '@/utils/identity'

const generateID = createIDGenerator()

function getMatchedLauncher(launchers, declarations, condition) {
  let matches = launchers.filter(condition)
  let siblings = declarations.filter(condition)
  if (matches.length === 1 && siblings.length === 1) {
    return matches[0]
  }
  return null
}

function getLauncherID(launchers, declarations, declaration) {
  let matched = getMatchedLauncher(
    launchers, declarations,
    item => item.name === declaration.name,
  )
  if (matched) return matched.id
  matched = getMatchedLauncher(
    launchers, declarations,
    item => item.remote === declaration.remote
      && item.directory === declaration.directory
  )
  if (matched) return matched.id
  return generateID()
}

export function merge(launchers, declarations) {
  if (!launchers.length) {
    return declarations.map(declaration => ({
      ...declaration,
      id: generateID(),
    }))
  }
  return declarations.map(declaration => {
    const id = getLauncherID(launchers, declarations, declaration)
    return {...declaration, id}
  })
}

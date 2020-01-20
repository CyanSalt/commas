import {createIDGenerator} from '@/utils/identity'
import {quote} from '@/utils/terminal'

const generateID = createIDGenerator()

export function getLauncherTab(tabs, launcher) {
  return tabs.find(tab => tab.launcher === launcher.id)
}

export function getTabLauncher(launchers, tab) {
  return launchers.find(launcher => tab.launcher === launcher.id)
}

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

export function getLauncherCommand(launcher) {
  let command = launcher.command
  if (launcher.login) {
    command = command ? `$SHELL -lic ${quote(command, '"')}`
      : '$SHELL -li'
  }
  if (launcher.directory) {
    const directory = launcher.directory.replace(' ', '\\ ')
    command = command ? `cd ${directory} && (${command})`
      : `cd ${directory}`
  }
  if (launcher.remote) {
    command = command ? `ssh -t ${launcher.remote} ${quote(command, '\'')}`
      : `ssh -t ${launcher.remote}`
  }
  return command
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

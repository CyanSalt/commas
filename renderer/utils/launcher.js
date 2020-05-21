import { createIDGenerator } from './identity'
import { quote } from './terminal'

/**
 * @typedef {import('./terminal').TerminalTab} TerminalTab
 *
 * @typedef Launcher
 * @property {number} id
 * @property {string} command
 * @property {string} [directory]
 * @property {boolean} [login]
 * @property {boolean} [remote]
 */

const generateID = createIDGenerator()

/**
 * @param {TerminalTab[]} tabs
 * @param {Launcher} launcher
 */
export function getLauncherTab(tabs, launcher) {
  return tabs.find(tab => tab.launcher === launcher.id)
}

/**
 * @param {Launcher[]} launchers
 * @param {TerminalTab} tab
 */
export function getTabLauncher(launchers, tab) {
  return launchers.find(launcher => tab.launcher === launcher.id)
}

/**
 * @param {Launcher[]} launchers
 * @param {Launcher[]} declarations
 * @param {(value: Launcher, index: number, array: Launcher[]) => value is Launcher} condition
 */
function getMatchedLauncher(launchers, declarations, condition) {
  let matches = launchers.filter(condition)
  let siblings = declarations.filter(condition)
  if (matches.length === 1 && siblings.length === 1) {
    return matches[0]
  }
  return null
}

/**
 * @param {Launcher[]} launchers
 * @param {Launcher[]} declarations
 * @param {Launcher} declaration
 */
function getLauncherID(launchers, declarations, declaration) {
  let matched = getMatchedLauncher(
    launchers,
    declarations,
    item => item.name === declaration.name,
  )
  if (matched) return matched.id
  matched = getMatchedLauncher(
    launchers,
    declarations,
    item => item.remote === declaration.remote
      && item.directory === declaration.directory
  )
  if (matched) return matched.id
  return generateID()
}

/**
 * @param {Launcher} launcher
 */
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

/**
 * @param {Launcher[]} launchers
 * @param {Launcher[]} declarations
 * @returnes {Launcher[]}
 */
export function merge(launchers, declarations) {
  if (!launchers.length) {
    return declarations.map(declaration => ({
      ...declaration,
      id: generateID(),
    }))
  }
  return declarations.map(declaration => {
    const id = getLauncherID(launchers, declarations, declaration)
    return { ...declaration, id }
  })
}

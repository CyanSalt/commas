import { shell, ipcRenderer } from 'electron'
import { unref } from 'vue'
import { memoize } from 'lodash-es'
import * as os from 'os'
import { useRemoteData } from './remote'
import {
  useTerminalTabs,
  createTerminalTab,
  activateTerminalTab,
  writeTerminalTab,
} from './terminal'
import { useSettings } from './settings'
import { resolveHome } from '../utils/terminal'
import { getLauncherCommand } from '../utils/launcher'

/**
 * @typedef {import('../utils/terminal').TerminalTab} TerminalTab
 * @typedef {import('../utils/launcher').Launcher} Launcher
 */

/**
 * @types {Ref<Launcher[]>}
 */
export const useLaunchers = memoize(() => {
  return useRemoteData([], {
    getter: 'get-launchers',
    effect: 'launchers-updated',
  })
})

/**
 * @param {Launcher} launcher
 */
export function getTerminalTabByLauncher(launcher) {
  const tabs = unref(useTerminalTabs())
  return tabs.find(tab => tab.launcher === launcher.id)
}

/**
 * @param {TerminalTab} tab
 */
export function getLauncherByTerminalTab(tab) {
  const launchers = unref(useLaunchers())
  return launchers.find(launcher => tab.launcher === launcher.id)
}

/**
 * @param {Launcher} launcher
 */
export async function openLauncher(launcher) {
  const tab = getTerminalTabByLauncher(launcher)
  if (tab) {
    activateTerminalTab(tab)
  } else {
    const directory = launcher.remote ? null : launcher.directory
    await createTerminalTab({
      cwd: resolveHome(directory),
      launcher: launcher.id,
    })
  }
}

/**
 * @param {Launcher} launcher
 */
export async function startLauncher(launcher) {
  await openLauncher(launcher)
  const tab = getTerminalTabByLauncher(launcher)
  const command = getLauncherCommand(launcher)
  writeTerminalTab(tab, command + os.EOL)
}

/**
 * @param {Launcher} launcher
 */
export async function startLauncherExternally(launcher) {
  if (!launcher.directory) return
  const directory = resolveHome(launcher.directory)
  const settings = unref(useSettings())
  let explorer = settings['terminal.external.explorer']
  if (!explorer) {
    return shell.openPath(directory)
  }
  if (!Array.isArray(explorer)) {
    explorer = [explorer]
  }
  const [command, ...args] = explorer
  return ipcRenderer.invoke('spawn-process', command, [...args, directory])
}

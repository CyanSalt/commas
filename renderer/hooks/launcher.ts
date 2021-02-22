import * as os from 'os'
import { shell, ipcRenderer } from 'electron'
import { memoize } from 'lodash-es'
import { unref } from 'vue'
import type { Launcher } from '../../typings/launcher'
import type { TerminalTab } from '../../typings/terminal'
import { getLauncherCommand } from '../utils/launcher'
import { resolveHome } from '../utils/terminal'
import { useRemoteData } from './remote'
import { useSettings } from './settings'
import {
  useTerminalTabs,
  createTerminalTab,
  activateTerminalTab,
  writeTerminalTab,
} from './terminal'

export const useLaunchers = memoize(() => {
  return useRemoteData<Launcher[]>([], {
    getter: 'get-launchers',
    setter: 'set-launchers',
    effect: 'launchers-updated',
  })
})

export function getTerminalTabByLauncher(launcher: Launcher) {
  const tabs = unref(useTerminalTabs())
  return tabs.find(tab => tab.launcher === launcher.id)
}

export function getLauncherByTerminalTab(tab: TerminalTab) {
  const launchers = unref(useLaunchers())
  return launchers.find(launcher => tab.launcher === launcher.id)
}

export async function openLauncher(launcher: Launcher) {
  const tab = getTerminalTabByLauncher(launcher)
  if (tab) {
    activateTerminalTab(tab)
  } else {
    const directory = launcher.remote ? undefined : launcher.directory
    await createTerminalTab({
      cwd: directory && resolveHome(directory),
      launcher: launcher.id,
    })
  }
}

export async function startLauncher(launcher: Launcher) {
  await openLauncher(launcher)
  const tab = getTerminalTabByLauncher(launcher)!
  const command = getLauncherCommand(launcher)
  writeTerminalTab(tab, '\x03' + command + os.EOL)
}

export async function runLauncherScript(launcher: Launcher, index: number) {
  await openLauncher(launcher)
  const tab = getTerminalTabByLauncher(launcher)!
  const command = getLauncherCommand({
    ...launcher,
    ...launcher.scripts![index],
  })
  writeTerminalTab(tab, '\x03' + command + os.EOL)
}

export async function startLauncherExternally(launcher: Launcher) {
  if (!launcher.directory) return
  const directory = resolveHome(launcher.directory)
  const settings = unref(useSettings())
  let explorer = settings['terminal.external.explorer']
  if (!explorer) {
    return shell.openPath(directory)
  }
  if (!Array.isArray(explorer)) {
    // Use applications on macOS by default
    if (process.platform === 'darwin') {
      explorer = ['open', '-a', explorer]
    } else {
      explorer = [explorer]
    }
  }
  if (explorer.includes('$_')) {
    explorer = explorer.map(item => (item === '$_' ? directory : item))
  } else {
    explorer = [...explorer, directory]
  }
  const [command, ...args] = explorer
  return ipcRenderer.invoke('spawn-process', command, args)
}

export function moveLauncher(from: number, to: number) {
  const launchersRef = useLaunchers()
  const launchers = [...unref(launchersRef)]
  const rule = launchers[from]
  if (from < to) {
    launchers.splice(to + 1, 0, rule)
    launchers.splice(from, 1)
  } else {
    launchers.splice(from, 1)
    launchers.splice(to, 0, rule)
  }
  launchersRef.value = launchers
}

export function handleLauncherMessages() {
  ipcRenderer.on('run-script', (event, { launcher, index: scriptIndex }: { launcher: Launcher, index: number }) => {
    runLauncherScript(launcher, scriptIndex)
  })
}

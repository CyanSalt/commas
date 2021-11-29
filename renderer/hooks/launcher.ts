import { shell, ipcRenderer } from 'electron'
import { memoize } from 'lodash-es'
import { unref, watch } from 'vue'
import type { Terminal } from 'xterm'
import type { Launcher } from '../../typings/launcher'
import type { TerminalTab } from '../../typings/terminal'
import { injectIPC } from '../utils/hooks'
import { getLauncherCommand } from '../utils/launcher'
import { resolveHome } from '../utils/terminal'
import { useSettings } from './settings'
import {
  useTerminalTabs,
  createTerminalTab,
  activateTerminalTab,
  executeTerminalTab,
} from './terminal'

export const useLaunchers = memoize(() => {
  return injectIPC<Launcher[]>('launchers', [])
})

export function getTerminalTabByLauncher(launcher: Launcher) {
  const tabs = unref(useTerminalTabs())
  return tabs.find(tab => tab.launcher === launcher.id)
}

export function getLauncherByTerminalTab(tab: TerminalTab) {
  const launchers = unref(useLaunchers())
  return launchers.find(launcher => tab.launcher === launcher.id)
}

interface OpenLauncherOptions {
  command?: string,
}

export async function openLauncher(launcher: Launcher, { command }: OpenLauncherOptions = {}) {
  const tab = getTerminalTabByLauncher(launcher)
  if (tab) {
    activateTerminalTab(tab)
    if (command) {
      executeTerminalTab(tab, command, true)
    }
  } else {
    const directory = launcher.remote ? undefined : launcher.directory
    await createTerminalTab({
      cwd: directory && resolveHome(directory),
      launcher: launcher.id,
      command,
    })
  }
}

export async function startLauncher(launcher: Launcher) {
  const settings = unref(useSettings())
  const shellPath = settings['terminal.shell.path']
  return openLauncher(launcher, {
    command: getLauncherCommand(launcher, shellPath),
  })
}

export async function runLauncherScript(launcher: Launcher, index: number) {
  const settings = unref(useSettings())
  const shellPath = settings['terminal.shell.path']
  return openLauncher(launcher, {
    command: getLauncherCommand({
      ...launcher,
      ...launcher.scripts![index],
    }, shellPath),
  })
}

export async function startLauncherExternally(launcher: Launcher) {
  const directory = launcher.directory ? resolveHome(launcher.directory) : ''
  const settings = unref(useSettings())
  let explorer = launcher.explorer ?? (
    launcher.remote
      ? settings['terminal.external.remoteExplorer']
      : settings['terminal.external.explorer']
  )
  if (!explorer) {
    if (launcher.remote) return
    return shell.openPath(directory)
  }
  explorer = explorer
    .replace(/\$\{directory\}/g, directory)
    .replace(/\$\{remote\}/g, launcher.remote ?? '')
  return ipcRenderer.invoke('execute', explorer)
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

const launcherSessionMap = new Map<number, string>()

export function loadLauncherSession(xterm: Terminal, id: number) {
  const session = launcherSessionMap.get(id)
  if (session) {
    xterm.write(session)
  }
}

export function saveLauncherSession(tab: TerminalTab) {
  if (tab.launcher) {
    launcherSessionMap.set(tab.launcher, tab.addons.serialize.serialize())
  }
}

export function handleLauncherMessages() {
  watch(useLaunchers(), () => {
    launcherSessionMap.clear()
  })
  ipcRenderer.on('start-launcher', (event, launcher: Launcher) => {
    startLauncher(launcher)
  })
  ipcRenderer.on('run-script', (event, launcher: Launcher, index: number) => {
    runLauncherScript(launcher, index)
  })
}

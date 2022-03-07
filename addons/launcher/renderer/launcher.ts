import { shell, ipcRenderer } from 'electron'
import { useSettings } from '../../../renderer/compositions/settings'
import {
  useTerminalTabs,
  createTerminalTab,
  activateTerminalTab,
  executeTerminalTab,
} from '../../../renderer/compositions/terminal'
import { injectIPC } from '../../../renderer/utils/compositions'
import { resolveHome } from '../../../renderer/utils/terminal'
import type { TerminalTab, TerminalTabGroup } from '../../../typings/terminal'
import type { Launcher } from '../typings/launcher'
import { getLauncherCommand } from './utils'

const tabs = $(useTerminalTabs())
const settings = $(useSettings())

let launchers = $(injectIPC<Launcher[]>('launchers', []))

export function useLaunchers() {
  return $$(launchers)
}

export function getTerminalTabByLauncher(launcher: Launcher) {
  return tabs.find(tab => tab.group?.type === 'launcher' && tab.group.data === launcher.id)
}

export function getLauncherByTerminalTab(tab: TerminalTab) {
  return launchers.find(launcher => tab.group?.type === 'launcher' && tab.group.data === launcher.id)
}

export function createLauncherGroup(launcher: Launcher): TerminalTabGroup {
  return {
    type: 'launcher',
    title: launcher.name,
    icon: {
      name: `feather-icon ${launcher.remote ? 'icon-link' : 'icon-hash'}`,
    },
    data: launcher.id,
  }
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
      command,
      group: createLauncherGroup(launcher),
    })
  }
}

export async function startLauncher(launcher: Launcher) {
  const shellPath = settings['terminal.shell.path']
  return openLauncher(launcher, {
    command: getLauncherCommand(launcher, shellPath),
  })
}

export async function runLauncherScript(launcher: Launcher, index: number) {
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
  const sorted = [...launchers]
  const rule = sorted[from]
  if (from < to) {
    sorted.splice(to + 1, 0, rule)
    sorted.splice(from, 1)
  } else {
    sorted.splice(from, 1)
    sorted.splice(to, 0, rule)
  }
  launchers = sorted
}

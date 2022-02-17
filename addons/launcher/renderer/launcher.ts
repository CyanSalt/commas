import { shell, ipcRenderer } from 'electron'
import { memoize } from 'lodash-es'
import { unref } from 'vue'
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

export const useLaunchers = memoize(() => {
  return injectIPC<Launcher[]>('launchers', [])
})

export function getTerminalTabByLauncher(launcher: Launcher) {
  const tabs = unref(useTerminalTabs())
  return tabs.find(tab => tab.group?.type === 'launcher' && tab.group.data === launcher.id)
}

export function getLauncherByTerminalTab(tab: TerminalTab) {
  const launchers = unref(useLaunchers())
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

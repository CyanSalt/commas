import * as commas from 'commas:api/renderer'
import { shell, ipcRenderer } from 'electron'
import type { TerminalTab, TerminalTabGroup } from '../../../../src/typings/terminal'
import type { Launcher } from '../../typings/launcher'
import { getLauncherCommand } from './utils'

const settings = commas.remote.useSettings()

let launchers = $(commas.ipcRenderer.inject<Launcher[]>('launchers', []))

export function useLaunchers() {
  return $$(launchers)
}

const launcherGroups = $computed(() => {
  return launchers.map<TerminalTabGroup>(launcher => {
    return {
      type: 'launcher',
      id: launcher.id,
      title: launcher.name,
      icon: {
        name: `ph-bold ${launcher.remote ? 'ph-link' : 'ph-hash'}`,
      },
    }
  })
})

export function useLauncherGroups() {
  return $$(launcherGroups)
}

export function getLauncherByTerminalTabGroup(group: TerminalTabGroup) {
  return launchers.find(launcher => group.type === 'launcher' && group.id === launcher.id)
}

export function getTerminalTabGroupByLauncher(launcher: Launcher) {
  return launcherGroups.find(group => group.type === 'launcher' && group.id === launcher.id)!
}

export function getTerminalTabsByLauncher(launcher: Launcher) {
  return commas.workspace.getTerminalTabsByGroup(getTerminalTabGroupByLauncher(launcher))
}

interface OpenLauncherOptions {
  tab?: TerminalTab,
  command?: string,
}

export async function openLauncher(launcher: Launcher, { tab, command }: OpenLauncherOptions = {}) {
  if (!tab) {
    const launcherTabs = getTerminalTabsByLauncher(launcher)
    tab = launcherTabs.length ? launcherTabs[0] : undefined
  }
  if (tab) {
    commas.workspace.activateTerminalTab(tab)
    if (command) {
      commas.workspace.executeTerminalTab(tab, command, true)
    }
  } else {
    const directory = launcher.remote ? undefined : launcher.directory
    await commas.workspace.createTerminalTab({
      ...launcher.profile,
      cwd: directory && commas.helper.resolveHome(directory),
    }, {
      command,
      group: getTerminalTabGroupByLauncher(launcher),
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
  const directory = launcher.directory ? commas.helper.resolveHome(launcher.directory) : ''
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
  const updated = [...launchers]
  const rule = updated[from]
  if (from < to) {
    updated.splice(to + 1, 0, rule)
    updated.splice(from, 1)
  } else {
    updated.splice(from, 1)
    updated.splice(to, 0, rule)
  }
  launchers = updated
}

export function removeLauncher(index: number) {
  const updated = [...launchers]
  updated.splice(index, 1)
  launchers = updated
}

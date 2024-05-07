import * as commas from 'commas:api/renderer'
import { ipcRenderer, shell } from 'electron'
import type { TerminalTab, TerminalTabCharacter } from '../../../../src/typings/terminal'
import type { Launcher } from '../../typings/launcher'
import { getLauncherCommand } from './utils'

const settings = commas.remote.useSettings()

let launchers = $(commas.ipcRenderer.inject<Launcher[]>('launchers', []))

export function useLaunchers() {
  return $$(launchers)
}

const launcherCharacters = $computed(() => {
  return launchers.map<TerminalTabCharacter>(launcher => {
    return {
      type: 'launcher',
      id: launcher.id,
      title: launcher.name,
      defaultIcon: launcher.remote ? undefined : {
        name: 'lucide-hash',
      },
      icon: launcher.remote ? {
        name: 'lucide-link',
      } : undefined,
    }
  })
})

export function useLauncherCharacters() {
  return $$(launcherCharacters)
}

export function getLauncherByTerminalTabCharacter(character: TerminalTabCharacter) {
  return launchers.find(launcher => character.type === 'launcher' && character.id === launcher.id)
}

export function getTerminalTabCharacterByLauncher(launcher: Launcher) {
  return launcherCharacters.find(character => character.type === 'launcher' && character.id === launcher.id)!
}

export function getTerminalTabsByLauncher(launcher: Launcher) {
  return commas.workspace.getTerminalTabsByCharacter(getTerminalTabCharacterByLauncher(launcher))
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
      character: getTerminalTabCharacterByLauncher(launcher),
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

export function moveLauncher(launcher: Launcher, index: number, edge?: 'start' | 'end') {
  const updated = [...launchers]
  const fromIndex = updated.indexOf(launcher)
  let targetIndex = index
  if (fromIndex < index) {
    targetIndex = edge === 'start' ? index - 1 : index
    updated.splice(targetIndex + 1, 0, launcher)
    updated.splice(fromIndex, 1)
  } else {
    targetIndex = edge === 'end' ? index + 1 : index
    updated.splice(fromIndex, 1)
    updated.splice(targetIndex, 0, launcher)
  }
  launchers = updated
}

export function removeLauncher(index: number) {
  const updated = [...launchers]
  updated.splice(index, 1)
  launchers = updated
}

export function updateLauncher(index: number, launcher: Launcher) {
  const updated = [...launchers]
  updated.splice(index, 1, launcher)
  launchers = updated
}

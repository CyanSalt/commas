import { ipcRenderer } from '@commas/electron-ipc'
import type { TerminalInfo, TerminalTab, TerminalTabCharacter } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import { shell } from 'electron'
import type { Launcher } from '../types/launcher'
import { getLauncherCommand } from './utils'

const settings = commas.remote.useSettings()

let launchers = $(commas.ipcRenderer.inject('launchers', []))

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

function getLauncherProfile(launcher: Launcher) {
  const directory = launcher.remote ? undefined : launcher.directory
  const profile: Partial<TerminalInfo> = {
    ...launcher.profile,
    cwd: directory && commas.helper.resolveHome(directory),
  }
  if (profile.shell) {
    profile.process = profile.shell
  }
  return profile
}

export function getLauncherByTerminalTabCharacter(character: TerminalTabCharacter) {
  return launchers.find(launcher => character.type === 'launcher' && character.id === launcher.id)
}

export function getTerminalTabCharacterByLauncher(launcher: Launcher) {
  return launcherCharacters.find(character => character.type === 'launcher' && character.id === launcher.id)!
}

export function getTerminalTabsByLauncher(launcher: Launcher) {
  const pane = launcher.pane ? commas.workspace.getPane(launcher.pane) : undefined
  if (pane) {
    const paneTab = commas.workspace.getTerminalTabByPane(pane, getLauncherProfile(launcher))
    return paneTab ? [paneTab] : []
  }
  return commas.workspace.getTerminalTabsByCharacter(getTerminalTabCharacterByLauncher(launcher))
}

interface OpenLauncherOptions {
  tab?: TerminalTab,
  command?: string,
  duplicate?: boolean,
}

export async function openLauncher(launcher: Launcher, { tab, command, duplicate }: OpenLauncherOptions = {}) {
  if (!tab) {
    const launcherTabs = getTerminalTabsByLauncher(launcher)
    tab = launcherTabs.length ? launcherTabs[0] : undefined
  }
  if (tab && !duplicate) {
    commas.workspace.activateTerminalTab(tab)
    if (command) {
      commas.workspace.executeTerminalTab(tab, command, true)
    }
    return tab
  }
  const profile = getLauncherProfile(launcher)
  if (duplicate) {
    return commas.workspace.createTerminalTab(profile, {
      command,
    })
  }
  const pane = launcher.pane ? commas.workspace.getPane(launcher.pane) : undefined
  if (pane) {
    const paneTab = commas.workspace.createPaneTab(pane, profile)
    paneTab.character = getTerminalTabCharacterByLauncher(launcher)
    commas.workspace.activateOrAddTerminalTab(paneTab)
    return paneTab
  } else {
    return commas.workspace.createTerminalTab(profile, {
      command,
      character: getTerminalTabCharacterByLauncher(launcher),
    })
  }
}

export async function startLauncher(launcher: Launcher, duplicate?: boolean) {
  const shellPath = settings['terminal.shell.path']
  return openLauncher(launcher, {
    command: getLauncherCommand(launcher, shellPath),
    duplicate,
  })
}

export async function runLauncherScript(launcher: Launcher, index: number, duplicate?: boolean) {
  const shellPath = settings['terminal.shell.path']
  return openLauncher(launcher, {
    command: getLauncherCommand({
      ...launcher,
      ...launcher.scripts![index],
    }, shellPath),
    duplicate,
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
  if (fromIndex === index) return
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

export function removeLauncher(launcher: Launcher) {
  const launcherTabs = getTerminalTabsByLauncher(launcher)
  const updated = [...launchers]
  const index = updated.findIndex(item => item.id === launcher.id)
  updated.splice(index, 1)
  launchers = updated
  for (const tab of launcherTabs) {
    delete tab.character
  }
}

export function updateLauncher(index: number, launcher: Launcher) {
  const updated = [...launchers]
  updated.splice(index, 1, launcher)
  launchers = updated
}

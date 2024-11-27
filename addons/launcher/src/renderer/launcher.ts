import type { TerminalContext, TerminalInfo, TerminalTab, TerminalTabCharacter } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import type { Launcher } from '../types/launcher'

const settings = commas.remote.useSettings()

let launchers = $(commas.ipcRenderer.inject('launchers', []))

export function useLaunchers() {
  return $$(launchers)
}

const launcherCharacters = $computed(() => {
  return launchers.map<TerminalTabCharacter>(launcher => {
    const pane = launcher.pane ? commas.workspace.getPane(launcher.pane) : undefined
    return {
      type: 'launcher',
      id: launcher.id,
      title: launcher.name,
      defaultIcon: pane ? pane.icon : (
        launcher.remote ? undefined : {
          name: 'lucide-hash',
        }
      ),
      icon: launcher.remote ? {
        name: 'lucide-link',
      } : undefined,
    }
  })
})

export function useLauncherCharacters() {
  return $$(launcherCharacters)
}

export function getLauncherProfile(launcher: Launcher) {
  const directory = launcher.remote ? undefined : launcher.directory
  const profile: Partial<TerminalInfo> = {
    ...launcher.profile,
    cwd: directory && commas.helper.resolveHome(directory),
  }
  if (profile.shell) {
    profile.process = profile.shell === commas.workspace.TERMINAL_DIRECTORY_SHELL ? profile.cwd : profile.shell
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
  return commas.workspace.getTerminalTabsByCharacter(getTerminalTabCharacterByLauncher(launcher))
}

interface OpenLauncherOptions {
  tab?: TerminalTab,
  command?: string,
  profile?: Partial<TerminalContext>,
  duplicate?: boolean,
}

export async function openLauncher(launcher: Launcher, options: OpenLauncherOptions = {}) {
  let { tab, command, profile, duplicate } = options
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
  if (!profile) {
    profile = getLauncherProfile(launcher)
  }
  if (duplicate) {
    return commas.workspace.createTerminalTab(profile, {
      command,
    })
  }
  const character = getTerminalTabCharacterByLauncher(launcher)
  const pane = launcher.pane ? commas.workspace.getPane(launcher.pane) : undefined
  if (pane) {
    const paneTab = await commas.workspace.createPaneTab(pane, {
      ...profile,
      command: launcher.command,
      character,
    })
    await commas.workspace.activateOrAddTerminalTab(paneTab)
    return paneTab
  } else {
    return commas.workspace.createTerminalTab(profile, {
      command,
      character,
    })
  }
}

function getLauncherCommand(launcher: Launcher, shellPath: string) {
  return commas.workspace.getTerminalExecutorCommand({
    command: launcher.command,
    login: launcher.login,
    directory: launcher.directory,
    remote: launcher.remote,
    shell: launcher.profile?.shell ?? shellPath,
  })
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
  const script = {
    ...launcher,
    ...launcher.scripts![index],
  }
  return openLauncher(launcher, {
    command: getLauncherCommand(script, shellPath),
    profile: getLauncherProfile(script),
    duplicate,
  })
}

export async function startLauncherExternally(launcher: Launcher) {
  return commas.remote.openExternalExplorer(launcher)
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

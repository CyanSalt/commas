import type { TerminalTabCharacter } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import type { KeyboardEvent } from 'electron'
import { watch } from 'vue'
import type { Launcher } from '../types/launcher'
import LauncherLink from './LauncherLink.vue'
import LauncherList from './LauncherList.vue'
import { getLauncherByTerminalTabCharacter, openLauncher, removeLauncher, runLauncherScript, startLauncher, startLauncherExternally, useLauncherCharacters, useLaunchers } from './launcher'
import { clearLauncherSessions, LauncherSessionAddon } from './session'

declare module '@commas/types/terminal' {
  export interface TerminalTabAddons {
    launcherSession: LauncherSessionAddon,
  }
}

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-launcher-character': (character: TerminalTabCharacter) => void,
    'start-launcher': (launcher: Launcher, keyboardEvent: KeyboardEvent) => void,
    'start-launcher-externally': (launcher: Launcher) => void,
    'run-launcher-script': (launcher: Launcher, index: number, keyboardEvent: KeyboardEvent) => void,
    'remove-launcher': (launcher: Launcher) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.ipcRenderer.on('open-launcher-character', (event, character) => {
    const launcher = getLauncherByTerminalTabCharacter(character)
    if (launcher) {
      openLauncher(launcher)
    }
  })
  commas.ipcRenderer.on('start-launcher', (event, launcher, keyboardEvent) => {
    startLauncher(launcher, keyboardEvent.shiftKey)
  })
  commas.ipcRenderer.on('start-launcher-externally', (event, launcher) => {
    startLauncherExternally(launcher)
  })
  commas.ipcRenderer.on('run-launcher-script', (event, launcher, index, keyboardEvent) => {
    runLauncherScript(launcher, index, keyboardEvent.shiftKey)
  })
  commas.ipcRenderer.on('remove-launcher', (event, launcher) => {
    removeLauncher(launcher)
  })

  const characters = $(useLauncherCharacters())

  commas.app.effect(() => {
    commas.context.provide('terminal.category', {
      title: 'Launcher#!launcher.1',
      characters,
      command: 'open-launcher-character',
    })
  })

  watch(useLaunchers(), () => {
    clearLauncherSessions()
  })

  commas.workspace.registerXtermAddon('launcherSession', tab => {
    const settings = commas.remote.useSettings()
    if (tab.character?.type === 'launcher' && settings['launcher.session.persist']) {
      return new LauncherSessionAddon(tab.character.id, tab.addons.serialize)
    }
  }, { immediate: true })

  commas.context.provide('terminal.ui-side-list', LauncherList)

  commas.context.provide('preference.item', {
    component: LauncherLink,
    group: 'feature',
    priority: 1,
  })

}

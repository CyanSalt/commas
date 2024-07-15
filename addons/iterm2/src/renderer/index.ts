import * as commas from 'commas:api/renderer'
import BadgeSlot from './BadgeSlot.vue'
import { ITerm2Addon } from './xterm'
import './style.scss'

declare module '@commas/types/terminal' {
  export interface TerminalTabAddons {
    iterm2: ITerm2Addon,
  }
}

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'set-mark': () => void,
    'scroll-to-mark': (offset: number) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerXtermAddon('iterm2', tab => new ITerm2Addon(tab), true)

  commas.context.provide('terminal.ui-slot', BadgeSlot)

  const currentTerminal = $(commas.workspace.useCurrentTerminal())

  commas.ipcRenderer.on('set-mark', () => {
    if (!currentTerminal) return
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    currentTerminal.addons?.iterm2?.setMark()
  })

  commas.ipcRenderer.on('scroll-to-mark', (event, offset) => {
    if (!currentTerminal) return
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    currentTerminal.addons?.iterm2?.scrollToMark(offset)
  })

}

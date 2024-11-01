import * as os from 'node:os'
import * as path from 'node:path'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import type { TTYRecFrame } from '../types/ttyrec'
import CameraAnchor from './CameraAnchor.vue'
import RecorderAnchor from './RecorderAnchor.vue'
import RecorderPane from './RecorderPane.vue'
import { openRecorderTab } from './compositions'
import { RecorderAddon } from './xterm'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'ttyrec-data': (file: string, data: TTYRecFrame) => void,
  }
  export interface GlobalCommands {
    'toggle-recorder': (tab: TerminalTab, status: boolean) => void,
  }
}

declare module '@commas/types/terminal' {
  export interface TerminalTabAddons {
    recorder: RecorderAddon,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.context.provide('terminal.ui-right-action-anchor', RecorderAnchor)

  commas.context.provide('terminal.ui-right-action-anchor', CameraAnchor)

  const toggle = commas.workspace.registerXtermAddon('recorder', tab => new RecorderAddon(tab))

  commas.context.handle('toggle-recorder', (tab, status) => {
    toggle(status, tab)
  })

  commas.workspace.registerTabPane('recorder', {
    title: '',
    component: RecorderPane,
    factory: info => {
      const shell = info?.shell || path.join(os.tmpdir(), '.commas')
      return {
        shell,
        process: shell,
        cwd: path.dirname(shell),
      }
    },
  })

  commas.context.provide('terminal.file-opener', {
    extensions: ['.ttyrec'],
    handler(file) {
      openRecorderTab(file)
    },
  })

}

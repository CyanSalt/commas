import * as os from 'node:os'
import * as path from 'node:path'
import * as commas from 'commas:api/renderer'
import type { TTYRecFrame } from '../types/ttyrec'
import CameraAnchor from './CameraAnchor.vue'
import RecorderPane from './RecorderPane.vue'
import { openRecorderTab } from './compositions'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'ttyrec-data': (file: string, data: TTYRecFrame) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.context.provide('terminal.ui-right-action-anchor', CameraAnchor)

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

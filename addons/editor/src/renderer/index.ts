import * as os from 'node:os'
import * as path from 'node:path'
import * as commas from 'commas:api/renderer'
import CodeEditorPane from './CodeEditorPane.vue'
import { openCodeEditorTab } from './compositions'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-code-editor': (file: string) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('editor', {
    title: '',
    component: CodeEditorPane,
    factory: info => {
      const shell = info?.shell || path.join(os.tmpdir(), '.commas')
      return {
        shell,
        process: shell,
        cwd: path.dirname(shell),
      }
    },
  })

  commas.ipcRenderer.on('open-code-editor', (event, file) => {
    openCodeEditorTab(file)
  })

  commas.context.handle('global-renderer:open-file', (file) => {
    openCodeEditorTab(file)
  })

}

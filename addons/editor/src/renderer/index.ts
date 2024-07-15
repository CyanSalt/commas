import * as commas from 'commas:api/renderer'
import { shell } from 'electron'
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
  })

  commas.ipcRenderer.on('open-code-editor', (event, file) => {
    openCodeEditorTab(file)
  })

  commas.context.removeHandler('global-renderer:open-file')

  commas.context.handle('global-renderer:open-file', (file) => {
    openCodeEditorTab(file)
  })

  commas.app.onCleanup(() => {
    commas.context.handle('global-renderer:open-file', (file) => {
      shell.showItemInFolder(file)
    })
  })

}

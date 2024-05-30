import * as commas from 'commas:api/renderer'
import { shell } from 'electron'
import CodeEditorPane from './CodeEditorPane.vue'
import { openCodeEditorTab } from './compositions'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('editor', {
    title: '',
    component: CodeEditorPane,
  })

  commas.ipcRenderer.on('open-code-editor', (event, file: string) => {
    openCodeEditorTab(file)
  })

  commas.context.removeHandler('global:open-file')

  commas.context.handle('global:open-file', (file: string) => {
    openCodeEditorTab(file)
  })

  commas.app.onCleanup(() => {
    commas.context.handle('global:open-file', (file: string) => {
      shell.showItemInFolder(file)
    })
  })

}

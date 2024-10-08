import * as commas from 'commas:api/renderer'
import FileExplorerPane from './FileExplorerPane.vue'
import { openFileExplorerTab, splitOrCloseFileExplorerTab } from './compositions'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('explorer', {
    title: '',
    component: FileExplorerPane,
  })

  const handleOpen = commas.context.removeHandler('global-renderer:open-directory')

  commas.context.handle('global-renderer:open-directory', (directory) => {
    openFileExplorerTab(directory)
  })

  if (handleOpen) {
    commas.app.onCleanup(() => {
      commas.context.handle('global-renderer:open-directory', handleOpen)
    })
  }

  const handleShow = commas.context.removeHandler('global-renderer:show-directory')

  commas.context.handle('global-renderer:show-directory', (directory) => {
    splitOrCloseFileExplorerTab(directory)
  })

  if (handleShow) {
    commas.app.onCleanup(() => {
      commas.context.handle('global-renderer:show-directory', handleShow)
    })
  }

}

import * as os from 'node:os'
import * as commas from 'commas:api/renderer'
import FileExplorerPane from './FileExplorerPane.vue'
import { getDirectoryProcess, openFileExplorerTab, splitOrCloseFileExplorerTab } from './compositions'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-explorer': (directory?: string) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('explorer', {
    title: '',
    component: FileExplorerPane,
    volatile: true,
    factory: info => {
      const cwd = info?.cwd || os.homedir()
      const dir = getDirectoryProcess(cwd)
      return {
        cwd: dir,
        process: dir,
        shell: commas.workspace.TERMINAL_DIRECTORY_SHELL,
      }
    },
  })

  const handleOpen = commas.context.removeHandler('global-renderer:open-directory')

  commas.context.handle('global-renderer:open-directory', (directory) => {
    openFileExplorerTab(directory)
  })

  commas.ipcRenderer.on('open-explorer', (event, directory) => {
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

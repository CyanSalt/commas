import * as os from 'node:os'
import * as commas from 'commas:api/renderer'
import FileExplorerPane from './FileExplorerPane.vue'
import { getDirectoryProcess, openFileExplorerTab, splitFileExplorerTab, splitOrCloseFileExplorerTab, useIsDotFileVisible } from './compositions'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-explorer': (directory?: string) => void,
    'split-explorer': (directory: string) => void,
    'show-all-files': (value: boolean) => void,
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

  commas.context.handle('global-renderer:open-directory', (directory) => {
    openFileExplorerTab(directory)
  })

  commas.ipcRenderer.on('open-explorer', (event, directory) => {
    openFileExplorerTab(directory)
  })

  commas.ipcRenderer.on('split-explorer', (event, directory) => {
    splitFileExplorerTab(directory)
  })

  commas.context.handle('global-renderer:show-directory', (directory) => {
    splitOrCloseFileExplorerTab(directory)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let isDotFileVisible = $(useIsDotFileVisible())

  commas.ipcRenderer.on('show-all-files', (event, value) => {
    isDotFileVisible = value
  })

}

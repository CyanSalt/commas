import * as path from 'node:path'
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import PaintProPane from './PaintProPane.vue'
import { openPaintProTab } from './composables'

function getNewFileName() {
  return commas.remote.translate('New Whiteboard#!paint-pro.1', {
    increment: '',
  }) + '.excalidraw.svg'
}

export default () => {

  const settings = commas.remote.useSettings()

  const assetsPath = $computed(() => {
    const userAssetsPath = settings['paint-pro.assets.path']
    return userAssetsPath.endsWith('/') ? userAssetsPath : userAssetsPath + '/'
  })

  commas.app.effect(() => {
    window['EXCALIDRAW_ASSET_PATH'] = assetsPath
  })

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('paint-pro', {
    title: '',
    component: PaintProPane,
    factory: async info => {
      const shell = info?.shell || await ipcRenderer.invoke('save-file-path', getNewFileName())
      return {
        shell,
        process: shell,
        cwd: path.dirname(shell),
      }
    },
  })

  commas.context.provide('terminal.file-opener', {
    extensions: ['.excalidraw', '.excalidraw.json', '.excalidraw.svg', '.excalidraw.png'],
    handler(file) {
      openPaintProTab(file)
    },
  })

  commas.context.provide('terminal.icon', {
    name: 'simple-icons-excalidraw',
    patterns: [/\.excalidraw(\.|$)/],
    color: '#6965DB',
  })

  commas.context.provide('terminal.shell', {
    label: 'Whiteboard Pro#!paint-pro.2',
    command: 'open-pane',
    args: ['paint-pro'],
  })

}

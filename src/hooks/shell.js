import {shell, ipcRenderer, remote} from 'electron'
import {promises as fs} from 'fs'
import {resolve} from 'path'
import FileStorage from '@/utils/storage'
import {assetsDir} from '@/utils/electron'

export default {
  openWindow() {
    ipcRenderer.send('open-window')
  },
  closeWindow() {
    remote.getCurrentWindow().close()
  },
  openUserDirectory() {
    shell.openItem(FileStorage.filename('.'))
  },
  async openUserFile(filename, example) {
    const path = FileStorage.filename(filename)
    try {
      await fs.access(path)
    } catch (err) {
      await fs.copyFile(resolve(assetsDir, example), path)
    }
    shell.openItem(path)
  },
}

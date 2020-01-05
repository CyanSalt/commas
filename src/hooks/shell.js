import {shell, ipcRenderer, remote} from 'electron'
import {promises as fs} from 'fs'
import {tmpdir} from 'os'
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
  openDefaultSettings() {
    const source = resolve(assetsDir, 'settings.json')
    const target = resolve(tmpdir(), 'commas-default-settings.json')
    try {
      fs.copyFile(source, target)
      shell.openItem(target)
    } catch {
      // ignore error
    }
  },
  async openUserFile(filename, example) {
    const path = FileStorage.filename(filename)
    try {
      await fs.access(path)
    } catch {
      await fs.copyFile(resolve(assetsDir, example), path)
    }
    shell.openItem(path)
  },
}

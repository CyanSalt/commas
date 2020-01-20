import {shell, ipcRenderer, remote} from 'electron'
import {promises as fs} from 'fs'
import {tmpdir} from 'os'
import {resolve} from 'path'
import {userStorage} from '@/utils/storage'
import {assetsDir} from '@/utils/electron'

export default {
  openWindow() {
    ipcRenderer.send('open-window')
  },
  closeWindow() {
    remote.getCurrentWindow().close()
  },
  openUserDirectory() {
    shell.openItem(userStorage.filename('.'))
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
    const path = userStorage.filename(filename)
    try {
      await fs.access(path)
    } catch {
      await fs.copyFile(resolve(assetsDir, example), path)
    }
    shell.openItem(path)
  },
  openExternalByEvent(event) {
    shell.openExternal(event.target.dataset.href)
  },
  openContextByEvent(event, template) {
    ipcRenderer.send('contextmenu', {
      template,
      position: {
        x: event.clientX,
        y: event.clientY,
      },
    })
  },
}

import {shell, ipcRenderer} from 'electron'
import {promises as fs} from 'fs'
import {tmpdir} from 'os'
import {resolve} from 'path'
import {userStorage} from '@/utils/storage'
import {assetsDir} from '@/utils/electron'
import {currentWindow} from '@/utils/frame'
import {generateSource} from '@/utils/object'
import settings from './settings'

export default {
  openWindow() {
    ipcRenderer.send('open-window')
  },
  closeWindow() {
    currentWindow.close()
  },
  openUserDirectory() {
    shell.openItem(userStorage.filename('.'))
  },
  async openDefaultSettings() {
    const specs = settings.getSpecs()
    const source = generateSource(specs)
    const target = resolve(tmpdir(), 'commas-default-settings.json')
    try {
      await fs.writeFile(target, source)
      shell.openItem(target)
    } catch {
      // ignore error
    }
  },
  async openUserFile(filename, source, assets) {
    const path = userStorage.filename(filename)
    try {
      await fs.access(path)
    } catch {
      if (assets) {
        await fs.copyFile(resolve(assetsDir, source), path)
      } else {
        await userStorage.write(filename, source)
      }
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

import {shell, ipcRenderer} from 'electron'
import {promises as fs} from 'fs'
import {tmpdir} from 'os'
import {resolve} from 'path'
import {currentWindow} from '../utils/frame'
import {generateSource} from '../utils/helper'
import settings from './settings'
import storage from './storage'

export default {
  openWindow() {
    ipcRenderer.send('open-window')
  },
  closeWindow() {
    currentWindow.close()
  },
  openUserDirectory() {
    shell.openItem(storage.user.filename('.'))
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
    const path = storage.user.filename(filename)
    try {
      await fs.access(path)
    } catch {
      if (assets) {
        const file = storage.assets.filename(source)
        await fs.copyFile(file, path)
      } else {
        await storage.user.write(filename, source)
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

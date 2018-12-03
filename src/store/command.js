import {ipcRenderer, remote} from 'electron'
import {FileStorage} from '../plugins/storage'
import {access, copyFile} from 'fs'
import {resolve} from 'path'
import {promisify} from 'util'
import Vue from 'vue'

const promises = {
  access: promisify(access),
  copyFile: promisify(copyFile),
}

async function openStorageFile(filename, example) {
  const path = FileStorage.filename(filename)
  try {
    await promises.access(path)
  } catch (e) {
    await promises.copyFile(resolve(__dirname, 'assets', example), path)
  }
  remote.shell.openItem(path)
}

const commands = {
  'open-tab'({action}) {
    return action.dispatch('terminal.spawn')
  },
  'open-window'() {
    ipcRenderer.send('open-window')
  },
  'close-tab'({state, action}) {
    const active = state.get('terminal.active')
    return action.dispatch('terminal.close', active)
  },
  'close-window'() {
    remote.getCurrentWindow().close()
  },
  'previous-tab'({state}) {
    const active = state.get('terminal.active')
    if (active > 0) {
      state.set('terminal.active', active - 1)
    }
  },
  'next-tab'({state}) {
    const active = state.get('terminal.active')
    const tabs = state.get('terminal.tabs')
    if (active < tabs.length - 1) {
      state.set('terminal.active', active + 1)
    }
  },
  'toggle-tab-list'({state, action}) {
    state.update('shell.multitabs', value => !value, true)
    Vue.nextTick(() => {
      action.dispatch('terminal.resize')
    })
  },
  'launch'({accessor, action}) {
    const current = accessor.get('terminal.current')
    if (current.launcher) {
      action.dispatch('launcher.launch', current.launcher)
    }
  },
  'open-settings'() {
    openStorageFile('settings.json', 'settings.json')
  },
  'open-launchers'() {
    openStorageFile('launchers.json', 'examples/launchers.json')
  },
}

export default {
  actions: {
    exec(Maye, command) {
      if (!commands[command]) return false
      return commands[command].call(this, Maye)
    },
    register(Maye, user) {
      Object.assign(commands, user)
    },
  },
}

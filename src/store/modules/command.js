import {ipcRenderer, remote} from 'electron'
import {FileStorage} from '@/plugins/storage'
import {access, copyFile} from 'fs'
import {resolve} from 'path'
import {promisify} from 'util'

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
  'open-tab'({dispatch}) {
    return dispatch('terminal/spawn', null, {root: true})
  },
  'open-window'() {
    ipcRenderer.send('open-window')
  },
  'close-tab'({dispatch, rootState}) {
    const active = rootState.terminal.active
    return dispatch('terminal/close', active, {root: true})
  },
  'close-window'() {
    remote.getCurrentWindow().close()
  },
  'previous-tab'({commit, rootState}) {
    const active = rootState.terminal.active
    if (active > 0) {
      commit('terminal/setActive', active - 1, {root: true})
    }
  },
  'next-tab'({commit, rootState}) {
    const {tabs, active} = rootState.terminal.active
    if (active < tabs.length - 1) {
      commit('terminal/setActive', active + 1, {root: true})
    }
  },
  'toggle-tab-list'({commit, rootState}) {
    const value = rootState.shell.multitabs
    commit('shell/setMultitabs', !value, {root: true})
  },
  'launch'({dispatch, rootGetters}) {
    const current = rootGetters['terminal/current']
    if (current.launcher) {
      dispatch('launcher/launch', current.launcher, {root: true})
    }
  },
  'find'({commit}) {
    commit('shell/setFinding', true, {root: true})
  },
  'open-settings'() {
    openStorageFile('settings.json', 'settings.json')
  },
  'open-launchers'() {
    openStorageFile('launchers.json', 'examples/launchers.json')
  },
}

export default {
  namespaced: true,
  actions: {
    exec(store, command) {
      if (!commands[command]) return false
      return commands[command].call(this, store)
    },
    register(store, user) {
      Object.assign(commands, user)
    },
  },
}
import {ipcRenderer, remote, shell} from 'electron'
import {promises as fs} from 'fs'
import {resolve} from 'path'
import FileStorage from '@/utils/storage'
import {InternalTerminals} from '@/utils/terminal'
import {assetsDir} from '@/utils/electron'

async function openStorageFile(filename, example) {
  const path = FileStorage.filename(filename)
  try {
    await fs.access(path)
  } catch (err) {
    await fs.copyFile(resolve(assetsDir, example), path)
  }
  shell.openItem(path)
}

const commands = {
  'open-tab'({dispatch}, payload) {
    return dispatch('terminal/spawn', payload, {root: true})
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
    const {tabs, active} = rootState.terminal
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
    if (current && current.launcher) {
      dispatch('launcher/launch', current.launcher, {root: true})
    }
  },
  'find'({commit}) {
    commit('shell/setFinding', true, {root: true})
  },
  'clear'({dispatch}) {
    dispatch('terminal/clear', null, {root: true})
  },
  'interact-settings'({dispatch}) {
    dispatch('terminal/interact', InternalTerminals.settings, {root: true})
  },
  'open-user-directory'() {
    shell.openItem(FileStorage.filename('.'))
  },
  'open-settings'() {
    openStorageFile('settings.json', 'settings.json')
  },
  'open-launchers'() {
    openStorageFile('launchers.json', 'examples/launchers.json')
  },
  'open-proxy-rules'() {
    openStorageFile('proxy-rules.json', 'examples/proxy-rules.json')
  },
  'open-keybindings'() {
    openStorageFile('keybindings.json', 'examples/keybindings.json')
  },
  'open-custom-js'() {
    openStorageFile('custom.js', 'examples/custom.js')
  },
  'open-custom-css'() {
    openStorageFile('custom.css', 'examples/custom.css')
  },
  'open-translation'() {
    openStorageFile('translation.json', 'examples/translation.json')
  },
}

export default {
  namespaced: true,
  actions: {
    exec(store, payload) {
      if (typeof payload === 'string') {
        payload = {command: payload}
      }
      const {command, args} = payload
      if (!commands[command]) return false
      return commands[command].call(this, store, args)
    },
    register(store, user) {
      Object.assign(commands, user)
    },
  },
}

import {FileStorage} from '@/plugins/storage'
import {createIDGenerator} from '@/utils/identity'
import {quote, resolveHome} from '@/utils/shell'
import {updateItem} from '@/utils/array'
import {getLauncherTab} from '@/utils/terminal'
import {remote} from 'electron'
import {spawn} from 'child_process'
import {EOL} from 'os'

const generateID = createIDGenerator()

export default {
  namespaced: true,
  state: {
    launchers: [],
    watcher: null,
  },
  mutations: {
    setLaunchers(state, value) {
      state.launchers = value
    },
    setWatcher(state, value) {
      state.watcher = value
    },
  },
  actions: {
    async load({commit}) {
      const launchers = await FileStorage.load('launchers.json')
      if (!launchers) return
      commit('setLaunchers', launchers.map(launcher => ({
        ...launcher,
        id: generateID(),
      })))
    },
    async open({state, commit, dispatch, rootState, rootGetters}, launcher) {
      const tab = getLauncherTab(rootState.terminal.tabs, launcher)
      if (tab) {
        return dispatch('terminal/activite', tab, {root: true})
      } else {
        const directory = launcher.remote ? null : launcher.directory
        await dispatch('terminal/spawn', resolveHome(directory), {root: true})
        const current = rootGetters['terminal/current']
        commit('terminal/setTabs', updateItem(rootState.terminal.tabs, current, {
          name: launcher.name, // title template variable
          launcher: launcher.id,
        }), {root: true})
      }
    },
    async launch({state, dispatch, rootState}, launcher) {
      const active = getLauncherTab(rootState.terminal.tabs, launcher)
      await dispatch('open', launcher)
      launcher = state.launchers.find(item => item.id === launcher.id)
      let command = launcher.command
      if (launcher.login) {
        command = `bash -lic ${quote(command)}`
      }
      if (launcher.directory) {
        command = `cd ${launcher.directory} && (${command})`
      }
      if (launcher.remote) {
        command = `ssh -t ${launcher.remote} ${quote(command)}`
      }
      const tab = getLauncherTab(rootState.terminal.tabs, launcher)
      const {pty} = rootState.terminal.poll.get(tab.id)
      // Windows does not support pty signal
      if (active && process.platform !== 'win32') pty.kill('SIGINT')
      pty.write(command + EOL)
    },
    assign({rootState}, launcher) {
      const settings = rootState.settings.settings
      const explorer = settings['terminal.external.explorer']
      if (!launcher.directory) return false
      const directory = resolveHome(launcher.directory)
      if (!explorer) {
        remote.shell.openItem(directory)
        return
      }
      if (!Array.isArray(explorer)) {
        spawn(explorer, [directory])
        return
      }
      const [command, ...args] = explorer
      spawn(command, [...args, directory])
    },
    watch({state, commit, dispatch, rootState}) {
      if (state.watcher) state.watcher.close()
      const watcher = FileStorage.watch('launchers.json', () => {
        const launchers = state.launchers
        // don't update if any launcher is running
        const tabs = rootState.terminal.tabs
        if (launchers.every(launcher => !getLauncherTab(tabs, launcher))) {
          dispatch('load')
        }
      })
      commit('setWatcher', watcher)
    },
  },
}

import {FileStorage} from '@/plugins/storage'
import {quote, resolveHome} from '@/utils/shell'
import {updateItem} from '@/utils/array'
import {getLauncherTab} from '@/utils/terminal'
import {merge} from '@/utils/launcher'
import {remote} from 'electron'
import {spawn} from 'child_process'
import {EOL} from 'os'

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
    async load({state, commit, rootState}) {
      const launchers = await FileStorage.load('launchers.json')
      if (!launchers) return
      const merged = merge(state.launchers, launchers)
      commit('setLaunchers', merged)
      commit('terminal/setTabs', rootState.terminal.tabs.map(tab => {
        if (!tab.launcher) return tab
        const updated = merged.find(item => item.id === tab.launcher)
        return updated ? {...tab, name: updated.name}
          : {...tab, launcher: undefined, name: undefined}
      }), {root: true})
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
          launcher: launcher.id,
          name: launcher.name, // title template variable
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
        dispatch('load')
      })
      commit('setWatcher', watcher)
    },
  },
}

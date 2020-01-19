import {userStorage} from '@/utils/storage'
import {quote, resolveHome} from '@/utils/terminal'
import {getLauncherTab, merge} from '@/utils/launcher'
import {shell} from 'electron'
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
      const launchers = await userStorage.load('launchers.json')
      if (!launchers) return
      const merged = merge(state.launchers, launchers)
      commit('setLaunchers', merged)
      rootState.terminal.tabs.forEach(tab => {
        if (tab.launcher && !merged.some(item => item.id === tab.launcher)) {
          commit('terminal/updateTab', {id: tab.id, launcher: undefined})
        }
      })
    },
    open({dispatch, rootState}, launcher) {
      const tab = getLauncherTab(rootState.terminal.tabs, launcher)
      if (tab) {
        return dispatch('terminal/activate', tab, {root: true})
      } else {
        const directory = launcher.remote ? null : launcher.directory
        return dispatch('terminal/spawn', {
          cwd: resolveHome(directory),
          launcher: launcher.id,
        }, {root: true})
      }
    },
    async launch({state, dispatch, rootState}, launcher) {
      const id = launcher.id
      await dispatch('open', launcher)
      launcher = state.launchers.find(item => item.id === id)
      let command = launcher.command
      if (launcher.login) {
        command = command ? `$SHELL -lic ${quote(command, '"')}`
          : '$SHELL -li'
      }
      if (launcher.directory) {
        const directory = launcher.directory.replace(' ', '\\ ')
        command = command ? `cd ${directory} && (${command})`
          : `cd ${directory}`
      }
      if (launcher.remote) {
        command = command ? `ssh -t ${launcher.remote} ${quote(command, '\'')}`
          : `ssh -t ${launcher.remote}`
      }
      const tab = getLauncherTab(rootState.terminal.tabs, launcher)
      return dispatch('terminal/input', {tab, data: command + EOL}, {root: true})
    },
    assign({rootState}, launcher) {
      const settings = rootState.settings.settings
      const explorer = settings['terminal.external.explorer']
      if (!launcher.directory) return false
      const directory = resolveHome(launcher.directory)
      if (!explorer) {
        shell.openItem(directory)
        return
      }
      if (!Array.isArray(explorer)) {
        spawn(explorer, [directory])
        return
      }
      const [command, ...args] = explorer
      spawn(command, [...args, directory])
    },
    watch({state, commit, dispatch}) {
      if (state.watcher) state.watcher.close()
      const watcher = userStorage.watch('launchers.json', () => {
        dispatch('load')
      })
      commit('setWatcher', watcher)
    },
  },
}

import {FileStorage} from '../plugins/storage'
import {remote} from 'electron'
import {spawn} from 'child_process'

const quote = command => `"${command.replace(/"/g, '"\\""')}"`
const feelAtHome = directory => {
  if (!directory) return directory
  return directory.startsWith('~') ?
    process.env.HOME + directory.slice(1) : directory
}

export default {
  states: {
    all: [],
  },
  actions: {
    async load({state}) {
      const launchers = await FileStorage.load('launchers.json')
      if (launchers) state.set([this, 'all'], launchers)
    },
    activite({state, action}, launcher) {
      if (launcher.tab) {
        action.dispatch('terminal.activite', launcher.tab)
      } else {
        const directory = launcher.remote ? null : launcher.directory
        const tab = action.dispatch('terminal.spawn', feelAtHome(directory))
        state.update('terminal.tabs', () => {
          tab.name = launcher.name // title template variable
          tab.launcher = launcher
          state.update([this, 'all'], () => {
            launcher.tab = tab
          })
        })
      }
    },
    launch({action}, launcher) {
      const active = launcher.tab
      action.dispatch([this, 'activite'], launcher)
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
      if (active) launcher.tab.pty.kill('SIGINT')
      launcher.tab.pty.write(`${command}\n`)
    },
    assign({state}, launcher) {
      const settings = state.get('settings.user')
      const explorer = settings['terminal.external.explorer']
      if (!launcher.directory) return false
      const directory = feelAtHome(launcher.directory)
      if (!explorer) return remote.shell.openItem(directory)
      if (!Array.isArray(explorer)) {
        return spawn(explorer, [directory])
      }
      const [command, ...args] = explorer
      return spawn(command, [...args, directory])
    },
    watch({state, action}) {
      state.update([this, 'watcher'], watcher => {
        if (watcher) watcher.close()
        return FileStorage.watch('launchers.json', () => {
          const launchers = state.get([this, 'all'])
          // don't update if any launcher is running
          if (launchers.every(launcher => !launcher.tab)) {
            action.dispatch([this, 'load'])
          }
        })
      }, true)
    },
  },
}

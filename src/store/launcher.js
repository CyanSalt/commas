import {FileStorage} from '../plugins/storage'

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
        const tab = action.dispatch('terminal.spawn')
        state.update('terminal.tabs', () => {
          tab.launcher = launcher
          state.update([this, 'all'], () => {
            launcher.tab = tab
          })
        })
      }
    },
    launch({action}, launcher) {
      action.dispatch([this, 'activite'], launcher)
      let command = launcher.command
      if (launcher.directory) {
        command = `cd ${launcher.directory} && ${command}`
      }
      if (launcher.remote) {
        command = `ssh ${launcher.remote} '${command}'`
      }
      launcher.tab.pty.write(`${command}\n`)
    },
  },
}

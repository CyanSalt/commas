import {ipcRenderer, remote} from 'electron'

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
}

export default {
  actions: {
    exec(Maye, command) {
      if (!commands[command]) return false
      return commands[command].call(this, Maye)
    },
  },
}

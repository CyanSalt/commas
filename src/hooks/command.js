import {ui} from './core'
import shell from './shell'

const registry = {
  'open-tab'(args) {
    return ui.store.dispatch('terminal/spawn', args)
  },
  'open-window'() {
    return shell.openWindow()
  },
  'close-tab'() {
    const active = ui.store.state.terminal.active
    return ui.store.dispatch('terminal/close', active)
  },
  'close-window'() {
    return shell.closeWindow()
  },
  'previous-tab'() {
    const active = ui.store.state.terminal.active
    if (active > 0) {
      ui.store.commit('terminal/setActive', active - 1)
    }
  },
  'next-tab'() {
    const {tabs, active} = ui.store.state.terminal
    if (active < tabs.length - 1) {
      ui.store.commit('terminal/setActive', active + 1)
    }
  },
  'toggle-tab-list'() {
    const value = ui.store.state.shell.multitabs
    ui.store.commit('shell/setMultitabs', !value)
  },
  'launch'() {
    const current = ui.store.getters['terminal/current']
    if (current && current.launcher) {
      return ui.store.dispatch('launcher/launch', current.launcher)
    }
  },
  'find'() {
    ui.store.commit('shell/setFinding', true)
  },
  'clear'() {
    return ui.store.dispatch('terminal/clear')
  },
  'open-user-directory'() {
    return shell.openUserDirectory()
  },
  'open-default-settings'() {
    return shell.openDefaultSettings()
  },
  'open-settings'() {
    return shell.openUserFile('settings.json', 'settings.json')
  },
  'open-launchers'() {
    return shell.openUserFile('launchers.json', 'examples/launchers.json')
  },
  'open-keybindings'() {
    return shell.openUserFile('keybindings.json', 'examples/keybindings.json')
  },
  'open-custom-js'() {
    return shell.openUserFile('custom.js', 'examples/custom.js')
  },
  'open-custom-css'() {
    return shell.openUserFile('custom.css', 'examples/custom.css')
  },
  'open-translation'() {
    return shell.openUserFile('translation.json', 'examples/translation.json')
  },
}

export default {
  exec(command, args) {
    const handler = registry[command]
    if (!handler) return false
    handler(args)
    return true
  },
  register(command, handler) {
    if (registry[command]) {
      throw new Error(`Command '${command}' has already exists`)
    }
    registry[command] = handler
  },
}

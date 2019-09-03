import {ui} from './core'

export default {
  exec(command, args) {
    return ui.store.dispatch('command/exec', {command, args})
  },
  register(command, handler) {
    const registry = ui.store.state.command.registry
    if (registry[command]) {
      throw new Error(`Command '${command}' has already exists`)
    }
    return ui.store.dispatch('command/register', {command, handler})
  },
}

import {ui} from './core'

export default {
  get(key) {
    return ui.store.state.settings.settings[key]
  },
}

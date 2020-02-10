import defaultSpecs from '@assets/settings.spec.json'
import {ui} from './core'

let specs = defaultSpecs

export default {
  get(key) {
    return ui.store.getters['settings/settings'][key]
  },
  getSpecs() {
    return specs
  },
  register(value) {
    specs = [...specs, value]
    // TODO: fully handle settings in hooks
    ui.store.commit('settings/setSpecs', specs)
  },
}

import {ui} from './core'
import storage from './storage'

let specs = storage.assets.require('settings.spec.json')

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

import { ui } from './core'
import storage from './storage'

/**
 * @typedef SettingSpec
 * @property {string} key
 * @property {string|string[]} type
 * @property {string} label
 * @property {any[]} [paradigm]
 * @property {string[]} [comments]
 * @property {any} [default]
 */

/**
 * @type {SettingSpec[]}
 */
let specs = storage.assets.require('settings.spec.json')

export default {
  /**
   * @param {string} key
   */
  get(key) {
    return ui.store.getters['settings/settings'][key]
  },
  getSpecs() {
    return specs
  },
  /**
   * @param {SettingSpec|SettingSpec[]} value
   */
  register(value) {
    specs = [...specs, value]
    // TODO: fully handle settings in hooks
    ui.store.commit('settings/setSpecs', specs)
  },
}

/**
 * @typedef {import('vue').Component} VueComponent
 *
 * @typedef {import('vuex').Store} VuexStore
 */

export const ui = {
  /** @type {VueComponent} */
  vm: null,
  /** @type {VuexStore} */
  store: null,
}

export default {
  getViewModel() {
    return ui.vm
  },
  getStore() {
    return ui.store
  },
  /**
   * @param {VueComponent} vm
   */
  dangerouslySetViewModel(vm) {
    ui.vm = vm
    ui.store = vm.$store
  },
}

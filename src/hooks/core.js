import * as electron from 'electron'

export const ui = {
  electron,
  vm: null,
  store: null,
}

export default {
  getElectron() {
    return ui.electron
  },
  getUnstableViewModel() {
    return ui.vm
  },
  dangerouslySetViewModel(vm) {
    ui.vm = vm
    ui.store = vm.$store
  },
}

export const ui = {
  vm: null,
  store: null,
}

export default {
  getViewModel() {
    return ui.vm
  },
  getStore() {
    return ui.store
  },
  dangerouslySetViewModel(vm) {
    ui.vm = vm
  },
  dangerouslySetStore(store) {
    ui.store = store
  },
}

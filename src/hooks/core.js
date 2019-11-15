export const ui = {
  vm: null,
  store: null,
}

export default {
  getUnstableViewModel() {
    return ui.vm
  },
  dangerouslySetViewModel(vm) {
    ui.vm = vm
    ui.store = vm.$store
  },
}

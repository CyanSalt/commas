import FileStorage from '@/utils/storage'

export default {
  install(Vue, options) {
    Vue.prototype.$storage = FileStorage
  },
}

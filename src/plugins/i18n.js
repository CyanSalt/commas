import {translate} from '@/utils/i18n'

export default {
  install(Vue) {
    Vue.prototype.i18n = translate
    Vue.directive('i18n', (el, {value}) => {
      el.textContent = translate(el.textContent, value)
    })
  },
}

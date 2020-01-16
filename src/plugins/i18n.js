import {translate} from '@/utils/i18n'

export default {
  install(Vue) {
    Vue.directive('i18n', (el, {value}) => {
      if (['INPUT', 'TEXTAREA'].includes(el.tagName)) {
        el.placeholder = translate(el.placeholder, value)
      } else {
        el.textContent = translate(el.textContent, value)
      }
    })
  },
}

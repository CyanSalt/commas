import {translate} from '@/utils/i18n'

export default {
  install(Vue) {
    Vue.prototype.i18n = translate
    Vue.directive('i18n', (el, {value}) => {
      let text = translate(el.textContent)
      if (value) for (const [key, replacer] of Object.entries(value)) {
        text = text.replace('%' + key, replacer)
      }
      el.textContent = text
    })
  },
}

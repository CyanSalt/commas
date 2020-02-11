import Vue from 'vue'
import App from './components/app'
import store from './store'
import {translateElement} from './utils/i18n'

Vue.directive('i18n', translateElement)

new Vue({
  store,
  el: '#main',
  functional: true,
  render: h => h(App),
})

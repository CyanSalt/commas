import Vue from 'vue'
import I18N from './plugins/i18n'
import FileStorage from './plugins/storage'
import Root from './components/root'
import store from './store'

Vue.use(I18N)
Vue.use(FileStorage)

new Vue({
  store,
  el: '#main',
  functional: true,
  render: h => h(Root),
})

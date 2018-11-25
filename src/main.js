import Vue from 'vue'
import I18N from './plugins/i18n'
import FileStorage from './plugins/storage'
import Root from './components/root'
import Maye from 'maye'
import declaration from 'maye/plugins/declaration'
import pathString from 'maye/plugins/path-string'
import pathWrapper from 'maye/plugins/path-wrapper'
import vueMaye from 'maye/plugins/vue'
import store from './store'

Maye.use(pathString)
Maye.use(pathWrapper)
Maye.use(declaration, store)
Maye.use(vueMaye, Vue)

Vue.use(I18N)
Vue.use(FileStorage)
Vue.use(vueMaye)

new Vue(Root)

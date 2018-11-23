import Vue from 'vue'
import I18N from './plugins/i18n'
import FileStorage from './plugins/storage'
import Root from './components/root'
import Maye from 'maye'
import declaration from 'maye/plugins/declaration'
import stringPath from 'maye/plugins/string-path'
import store from './store'

Vue.use(I18N)
Vue.use(FileStorage)

Maye.use(declaration, store)
Maye.use(stringPath)

new Vue(Root)

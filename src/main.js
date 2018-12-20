import Vue from 'vue'
import I18N from './plugins/i18n'
import FileStorage from './plugins/storage'
import Root from './components/root'
import MayeBooter from 'maye'
import Declaration from 'maye/plugins/declaration'
import PathString from 'maye/plugins/path-string'
import PathWrapper from 'maye/plugins/path-wrapper'
import VueMaye from 'maye/plugins/vue'
import store from './store'

const Maye = MayeBooter.boot()

Maye.use(PathString)
Maye.use(PathWrapper)
Maye.use(Declaration, store)
Maye.use(VueMaye, {Vue, install: true})

Vue.use(I18N)
Vue.use(FileStorage)

new Vue(Root)

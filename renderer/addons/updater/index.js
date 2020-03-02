import locales from './locales.json'
import UpdaterLine from './updater-line'
import UpdaterStore from './store'

export default {
  install(hooks) {
    hooks.i18n.addTranslations(locales)
    hooks.addon.data.add('settings:slots', {
      component: UpdaterLine,
      group: 'about',
    })
    const store = hooks.core.getStore()
    store.registerModule('updater', UpdaterStore)
  },
}

import UpdaterLine from './updater-line'
import UpdaterStore from './store'

export default {
  install(hooks) {
    hooks.addon.data.add('settings:slots', {
      component: UpdaterLine,
      group: 'about',
    })
    hooks.events.on('ready', () => {
      const store = hooks.core.getStore()
      store.registerModule('updater', UpdaterStore)
    })
  },
}

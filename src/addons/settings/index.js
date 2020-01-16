import SettingsPanel from './settings-panel'
import SettingsAnchor from './settings-anchor'

export default {
  install(hooks) {
    hooks.workspace.panel.register('settings', {
      component: SettingsPanel,
      title: 'Settings#!7',
      icon: 'feather-icon icon-settings',
    })
    hooks.command.register('interact-settings', () => {
      return hooks.workspace.panel.open('settings')
    })
    hooks.workspace.anchor.add(SettingsAnchor)
  },
}

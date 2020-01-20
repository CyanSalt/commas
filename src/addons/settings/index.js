import SettingsPanel from './settings-panel'

export default {
  install(hooks) {
    hooks.workspace.panel.register('settings', {
      component: SettingsPanel,
      title: 'Settings#!7',
      icon: 'feather-icon icon-settings',
      i18n: true,
    })
    hooks.command.register('interact-settings', () => {
      return hooks.workspace.panel.open('settings')
    })
  },
}

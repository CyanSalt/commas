import locales from './locales.json'
import SettingsPanel from './settings-panel'

/**
 * @typedef {typeof import('../../hooks').default} Hooks
 */

export default {
  /**
   * @param {Hooks} hooks
   */
  install(hooks) {
    hooks.i18n.addTranslations(locales)
    hooks.workspace.panel.register('settings', {
      component: SettingsPanel,
      title: 'Settings#!settings.1',
      icon: 'feather-icon icon-settings',
      i18n: true,
    })
    hooks.command.register('interact-settings', () => {
      return hooks.workspace.panel.open('settings')
    })
  },
}

import locales from './locales.json'
import UserSettingsLink from './user-settings-link'
import UserSettingsPanel from './user-settings-panel'

/**
 * @typedef {typeof import('../../hooks').default} Hooks
 */

export default {
  /**
   * @param {Hooks} hooks
   */
  install(hooks) {
    hooks.i18n.addTranslations(locales)
    hooks.addon.data.add('settings:slots', {
      component: UserSettingsLink,
      group: 'general',
    })
    hooks.workspace.panel.register('user-settings', {
      component: UserSettingsPanel,
      title: 'User Settings#!user-settings.1',
      icon: 'feather-icon icon-sliders',
      i18n: true,
    })
  },
}

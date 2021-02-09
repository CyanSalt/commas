module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.i18n.addTranslations([
      { locale: 'zh-CN', file: require.resolve('./locales/zh-CN.json') },
    ])

  } else {

    commas.reactive.provide('user-settings:terminal.addon.includes', {
      value: 'menu',
      note: 'Provide translations for the application menu on macOS#!menu.1',
    })

  }
}

module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const { handleProxyServerMessages } = require('./server')
    const { handleSystemProxyMessages } = require('./system')
    const { handleProxyRulesMessages } = require('./rules')

    handleProxyServerMessages(commas)
    handleSystemProxyMessages(commas)
    handleProxyRulesMessages(commas)

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslation(['zh', 'zh-CN'], require('./locales/zh-CN.json'))

  } else {

    commas.workspace.registerTabPane('proxy', {
      title: 'Proxy Rules#!proxy.1',
      component: commas.module.require('internal/proxy/proxy-pane.vue').default,
      icon: {
        name: 'feather-icon icon-navigation',
      },
    })

    commas.workspace.addAnchor(
      commas.module.require('internal/proxy/proxy-anchor.vue').default
    )

    commas.storage.shareDataIntoArray('settings', {
      component: commas.module.require('internal/proxy/proxy-link.vue').default,
      group: 'feature',
    })

  }
}

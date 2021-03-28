/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    const { useProxyServerStatus } = commas.bundler.extract('proxy/server.ts')
    const { useSystemProxyStatus } = commas.bundler.extract('proxy/system.ts')
    const { useProxyRules } = commas.bundler.extract('proxy/rule.ts')

    // Server
    const serverStatusRef = useProxyServerStatus()
    commas.ipcMain.provide('proxy-server-status', serverStatusRef)
    commas.app.onCleanup(() => {
      serverStatusRef.value = false
    })

    // System
    const systemStatusRef = useSystemProxyStatus()
    commas.ipcMain.provide('system-proxy-status', systemStatusRef)
    commas.app.onCleanup(() => {
      systemStatusRef.value = false
    })

    // Rules
    commas.ipcMain.provide('proxy-rules', useProxyRules())

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.workspace.registerTabPane('proxy', {
      title: 'Proxy Rules#!proxy.1',
      component: commas.bundler.extract('proxy/proxy-pane.vue').default,
      icon: {
        name: 'feather-icon icon-navigation',
      },
    })

    commas.workspace.addAnchor(
      commas.bundler.extract('proxy/proxy-anchor.vue').default
    )

    commas.context.provide('preference', {
      component: commas.bundler.extract('proxy/proxy-link.vue').default,
      group: 'feature',
    })

  }
}

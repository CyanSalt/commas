module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    const { startServer, stopServer } = commas.bundler.extract('proxy/server.ts')
    const { getSystemProxy, setSystemProxy } = commas.bundler.extract('proxy/system.ts')
    const { getProxyRules, setProxyRules } = commas.bundler.extract('proxy/rule.ts')

    // Server
    commas.ipcMain.handle('get-proxy-server-status', () => {
      return startServer.cache.has()
    })
    commas.ipcMain.handle('set-proxy-server-status', () => {
      const currentServer = startServer.cache.get()
      if (currentServer) {
        stopServer()
      } else {
        startServer()
      }
    })
    commas.app.onCleanup(() => {
      stopServer()
    })

    // System
    commas.ipcMain.handle('get-system-proxy-status', () => {
      return getSystemProxy()
    })
    commas.ipcMain.handle('set-system-proxy-status', async (event, value) => {
      return setSystemProxy(value)
    })
    commas.app.onCleanup(() => {
      setSystemProxy(false)
    })

    // Rules
    commas.ipcMain.handle('get-proxy-rules', () => {
      return getProxyRules()
    })
    commas.ipcMain.handle('set-proxy-rules', (event, rules) => {
      return setProxyRules(rules)
    })

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

    commas.reactive.provide('preference', {
      component: commas.bundler.extract('proxy/proxy-link.vue').default,
      group: 'feature',
    })

  }
}

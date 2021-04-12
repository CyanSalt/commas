/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')
    const { effect, ref, stop } = require('@vue/reactivity')

    const { checkRootCA, installRootCA, uninstallRootCA } = commas.bundler.extract('proxy/cert.ts')
    const { useProxyServerStatus, getProxyServerVersion } = commas.bundler.extract('proxy/server.ts')
    const { useSystemProxyStatus } = commas.bundler.extract('proxy/system.ts')

    // Server
    const serverStatusRef = useProxyServerStatus()
    commas.ipcMain.provide('proxy-server-status', serverStatusRef)

    commas.ipcMain.handle('get-proxy-server-version', () => {
      return getProxyServerVersion()
    })

    // System
    const systemStatusRef = useSystemProxyStatus()
    commas.ipcMain.provide('system-proxy-status', systemStatusRef)

    const rootCAStatusRef = ref(false)
    const rootCAEffect = effect(async () => {
      rootCAStatusRef.value = await checkRootCA()
    })
    commas.ipcMain.provide('proxy-root-ca-status', rootCAStatusRef)

    commas.ipcMain.handle('install-proxy-root-ca', async () => {
      await installRootCA()
      rootCAEffect()
    })

    commas.ipcMain.handle('uninstall-proxy-root-ca', async () => {
      await uninstallRootCA()
      rootCAEffect()
    })

    commas.app.onCleanup(() => {
      stop(rootCAEffect)
      serverStatusRef.value = false
      systemStatusRef.value = false
    })

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.workspace.registerTabPane('proxy', {
      title: 'Proxy Configurations#!proxy.1',
      component: commas.bundler.extract('proxy/proxy-pane.vue').default,
      icon: {
        name: 'feather-icon icon-navigation',
      },
    })

    commas.context.provide(
      '@anchor',
      commas.bundler.extract('proxy/proxy-anchor.vue').default
    )

    commas.context.provide('preference', {
      component: commas.bundler.extract('proxy/proxy-link.vue').default,
      group: 'feature',
    })

  }
}

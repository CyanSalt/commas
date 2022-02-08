/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')
    const { effect, ref, stop } = require('@vue/reactivity')

    const { checkRootCA, installRootCA, uninstallRootCA } = commas.bundler.extract('proxy/main/cert.ts')
    const { getLatestProxyServerVersion, getProxyServerVersion, installProxyServer, useProxyServerStatus } = commas.bundler.extract('proxy/main/server.ts')
    const { useSystemProxyStatus } = commas.bundler.extract('proxy/main/system.ts')

    // Server
    const serverStatusRef = useProxyServerStatus()
    commas.ipcMain.provide('proxy-server-status', serverStatusRef)

    commas.ipcMain.handle('get-latest-proxy-server-version', async () => {
      return getLatestProxyServerVersion()
    })

    const serverVersionRef = ref(undefined)
    const serverVersionEffect = effect(async () => {
      serverVersionRef.value = await getProxyServerVersion()
    })
    commas.ipcMain.provide('proxy-server-version', serverVersionRef)

    commas.ipcMain.handle('install-proxy-server', async () => {
      await installProxyServer()
      return serverVersionEffect()
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
      return rootCAEffect()
    })

    commas.ipcMain.handle('uninstall-proxy-root-ca', async () => {
      await uninstallRootCA()
      return rootCAEffect()
    })

    commas.app.onCleanup(() => {
      stop(serverVersionEffect)
      stop(rootCAEffect)
      serverStatusRef.value = false
      systemStatusRef.value = false
    })

    commas.settings.addSettingsSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.workspace.registerTabPane('proxy', {
      title: 'Proxy#!proxy.1',
      component: commas.bundler.extract('proxy/renderer/proxy-pane.vue').default,
      icon: {
        name: 'feather-icon icon-navigation',
      },
    })

    commas.context.provide(
      '@ui-side-anchor',
      commas.bundler.extract('proxy/renderer/proxy-anchor.vue').default,
    )

    commas.context.provide('preference', {
      component: commas.bundler.extract('proxy/renderer/proxy-link.vue').default,
      group: 'feature',
    })

  }
}

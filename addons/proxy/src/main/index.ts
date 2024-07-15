import { effect } from '@vue/reactivity'
import * as address from 'address'
import * as commas from 'commas:api/main'
import { checkRootCA, installRootCA, uninstallRootCA } from './cert'
import { getLatestProxyServerVersion, useProxyServerInstalled, useProxyServerStatus, useProxyServerVersion } from './server'
import { useSystemProxyStatus } from './system'

declare module '@commas/types/settings' {
  export interface Settings {
    'proxy.server.whistle'?: string,
    'proxy.server.port'?: number,
  }
}

export default () => {

  let serverInstalled = $(useProxyServerInstalled())
  commas.ipcMain.provide('proxy-server-installed', $$(serverInstalled))

  let serverStatus = $(useProxyServerStatus())
  commas.ipcMain.provide('proxy-server-status', $$(serverStatus))

  commas.ipcMain.handle('get-latest-proxy-server-version', async () => {
    return getLatestProxyServerVersion()
  })

  commas.ipcMain.handle('get-ip', async () => {
    return address.ip()
  })

  const serverVersion = $(useProxyServerVersion())
  commas.ipcMain.provide('proxy-server-version', $$(serverVersion))

  // System
  let systemStatus = $(useSystemProxyStatus())
  commas.ipcMain.provide('system-proxy-status', $$(systemStatus))

  let rootCAStatus = $ref(false)
  const rootCAEffect = effect(async () => {
    rootCAStatus = await checkRootCA()
  })
  commas.ipcMain.provide('proxy-root-ca-status', $$(rootCAStatus))

  commas.ipcMain.handle('install-proxy-root-ca', async () => {
    await installRootCA()
    return rootCAEffect()
  })

  commas.ipcMain.handle('uninstall-proxy-root-ca', async () => {
    await uninstallRootCA()
    return rootCAEffect()
  })

  commas.app.onCleanup(() => {
    serverStatus = false
    systemStatus = false
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}

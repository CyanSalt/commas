import { effect, ref, stop } from '@vue/reactivity'
import * as address from 'address'
import * as commas from 'commas:api/main'
import { quote } from 'shell-quote'
import { checkRootCA, installRootCA, uninstallRootCA } from './cert'
import { getLatestProxyServerVersion, useProxyServerStatus, useProxyServerVersionInfo, whistle } from './server'
import { useSystemProxyStatus } from './system'

declare module '../../../../src/typings/settings' {
  export interface Settings {
    'proxy.server.whistle'?: string,
    'proxy.server.port'?: number,
  }
}

export default () => {

  // Server
  commas.context.provide('cli.command', {
    command: 'whistle',
    usage: '<command> [options]',
    async handler({ argv }) {
      try {
        const { stdout } = await whistle(quote(argv))
        return stdout.trim()
      } catch (err) {
        return err.stderr
      }
    },
  })

  const serverStatusRef = useProxyServerStatus()
  commas.ipcMain.provide('proxy-server-status', serverStatusRef)

  commas.ipcMain.handle('get-latest-proxy-server-version', async () => {
    return getLatestProxyServerVersion()
  })

  commas.ipcMain.handle('get-ip', async () => {
    return address.ip()
  })

  const serverVersionInfoRef = useProxyServerVersionInfo()
  commas.ipcMain.provide('proxy-server-version-info', serverVersionInfoRef)

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
    stop(rootCAEffect)
    serverStatusRef.value = false
    systemStatusRef.value = false
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}

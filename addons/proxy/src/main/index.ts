import * as path from 'path'
import { effect, ref, stop } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import { checkRootCA, installRootCA, uninstallRootCA } from './cert'
import { getLatestProxyServerVersion, getProxyServerVersion, installProxyServer, useProxyServerStatus } from './server'
import { useSystemProxyStatus } from './system'

// Server
const serverStatusRef = useProxyServerStatus()
commas.ipcMain.provide('proxy-server-status', serverStatusRef)

commas.ipcMain.handle('get-latest-proxy-server-version', async () => {
  return getLatestProxyServerVersion()
})

const serverVersionRef = ref<string | null | undefined>(undefined)
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

commas.settings.addSettingsSpecs(require('../../settings.spec.json'))

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))

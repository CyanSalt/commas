import { effect, toRaw, unref } from '@vue/reactivity'
import type { BrowserWindow } from 'electron'
import { app } from 'electron'
import difference from 'lodash/difference'
import semver from 'semver'
import * as commas from '../../api/core-main'
import type { AddonInfo } from '../../typings/addon'
import { userData } from '../utils/directory'
import { notify } from '../utils/notification'
import { useAddons, useDiscoveredAddons } from './addon-manager'
import { translate } from './i18n'

function checkAddon(name: string, discoveredAddons: Record<string, AddonInfo>) {
  const { manifest } = discoveredAddons[name]
  const engine = manifest.engines?.commas
  const version = app.getVersion()
  if (engine && !semver.satisfies(engine, version)) {
    notify({
      type: 'error',
      body: translate(`Addon [%N] does not support Commas %V (requires %E)#!terminal.7`, {
        N: name,
        E: engine,
        V: version,
      }),
    })
  }
}

function loadAddons() {
  const discoveredAddonsRef = useDiscoveredAddons()
  effect(() => {
    const discoveredAddons = unref(discoveredAddonsRef)
    commas.addon.preloadAddons(discoveredAddons)
  })
  const addonsRef = useAddons()
  let loadedAddons: string[] = []
  effect(() => {
    const addons = unref(addonsRef)
    difference(loadedAddons, addons).forEach(addon => {
      commas.addon.unloadAddon(addon)
    })
    difference(addons, loadedAddons).forEach(addon => {
      checkAddon(addon, toRaw(discoveredAddonsRef).value)
      commas.addon.loadAddon(addon, commas.raw)
    })
    loadedAddons = [...addons]
  })
}

function loadCustomJS() {
  commas.addon.loadAddon('custom.js', commas.raw)
}

function loadCustomCSS(frame: BrowserWindow) {
  const loadingCSS = userData.read('custom.css')
  frame.webContents.on('did-finish-load', async () => {
    const styles = await loadingCSS
    if (styles) {
      frame.webContents.insertCSS(styles)
    }
  })
}

export {
  loadAddons,
  loadCustomJS,
  loadCustomCSS,
}

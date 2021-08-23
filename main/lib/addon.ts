import { effect, unref } from '@vue/reactivity'
import type { BrowserWindow } from 'electron'
import difference from 'lodash/difference'
import * as commas from '../../api/main'
import { userData } from '../utils/directory'
import { useAddons, useDiscoveredAddons } from './addon-manager'

function loadAddons() {
  const discoveredAddonsRef = useDiscoveredAddons()
  effect(() => {
    const discoveredAddons = unref(discoveredAddonsRef)
    commas.app.preloadAddons(discoveredAddons)
  })
  const addonsRef = useAddons()
  let loadedAddons: string[] = []
  effect(() => {
    const addons = unref(addonsRef)
    difference(loadedAddons, addons).forEach(addon => {
      commas.app.unloadAddon(addon)
    })
    difference(addons, loadedAddons).forEach(addon => {
      commas.app.loadAddon(addon, commas)
    })
    loadedAddons = [...addons]
  })
}

function loadCustomJS() {
  commas.app.loadAddon('custom.js', commas)
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

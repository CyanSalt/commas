import { difference } from 'lodash-es'
import { watchEffect, unref } from 'vue'
import * as commas from '../../api/renderer'
import { useAddons, useDiscoveredAddons } from './settings'

export function loadAddons() {
  const discoveredAddonsRef = useDiscoveredAddons()
  watchEffect(() => {
    const addons = unref(discoveredAddonsRef)
    commas.app.preloadAddons(addons)
  })
  const addonsRef = useAddons()
  let loadedAddons: string[] = []
  watchEffect(() => {
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

export function loadCustomJS() {
  commas.app.loadAddon('custom.js', commas)
}

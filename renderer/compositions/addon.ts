import { difference } from 'lodash-es'
import { watchEffect, unref } from 'vue'
import * as commas from '../../api/core-renderer'
import { useAddons, useDiscoveredAddons } from './settings'

export function loadAddons() {
  const discoveredAddonsRef = useDiscoveredAddons()
  watchEffect(() => {
    const addons = unref(discoveredAddonsRef)
    commas.addon.preloadAddons(addons)
  })
  const addonsRef = useAddons()
  let loadedAddons: string[] = []
  watchEffect(() => {
    const addons = unref(addonsRef)
    difference(loadedAddons, addons).forEach(addon => {
      commas.addon.unloadAddon(addon)
    })
    difference(addons, loadedAddons).forEach(addon => {
      commas.addon.loadAddon(addon, commas.raw)
    })
    loadedAddons = [...addons]
  })
}

export function loadCustomJS() {
  commas.addon.loadAddon('custom.js', commas.raw)
}

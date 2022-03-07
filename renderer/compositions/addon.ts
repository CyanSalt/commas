import { difference } from 'lodash-es'
import { watchEffect } from 'vue'
import * as commas from '../../api/core-renderer'
import { useAddons, useDiscoveredAddons } from './settings'

const discoveredAddons = $(useDiscoveredAddons())
const addons = $(useAddons())

export function loadAddons() {
  watchEffect(() => {
    commas.addon.preloadAddons(discoveredAddons)
  })
  let loadedAddons: string[] = []
  watchEffect(() => {
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

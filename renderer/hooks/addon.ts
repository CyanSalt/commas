import { difference } from 'lodash-es'
import { watchEffect, unref } from 'vue'
import * as commas from '../../api/renderer'
import { useSettings } from './settings'

export async function loadAddons() {
  await commas.app.discoverAddons()
  const settingsRef = useSettings()
  let loadedAddons: string[] = []
  watchEffect(() => {
    const settings = unref(settingsRef)
    const addons: string[] | undefined = settings['terminal.addon.includes']
    if (!addons) return
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

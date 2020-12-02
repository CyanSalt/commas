import { difference } from 'lodash-es'
import { watchEffect, unref } from 'vue'
import { useSettings } from './settings.mjs'

export function loadAddons() {
  const commas = globalThis.require('../api/renderer')
  const settingsRef = useSettings()
  let loadedAddons = []
  watchEffect(() => {
    const settings = unref(settingsRef)
    const addons = settings['terminal.addon.includes']
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

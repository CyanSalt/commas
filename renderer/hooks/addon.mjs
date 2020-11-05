import { watchEffect, unref } from 'vue'
import { useSettings } from './settings.mjs'

export function loadAddons() {
  const commas = globalThis.require('../api/renderer')
  const settingsRef = useSettings()
  watchEffect(() => {
    const settings = unref(settingsRef)
    const addons = settings['terminal.addon.includes']
    if (!addons) return
    for (const addon of addons) {
      commas.app.loadAddon(addon, commas)
    }
  })
}

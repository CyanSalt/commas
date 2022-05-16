import { differenceBy } from 'lodash'
import { watchEffect } from 'vue'
import * as commas from '../../../api/core-renderer'
import type { AddonInfo } from '../../../typings/addon'
import { useAddons } from './settings'

const addons = $(useAddons())

export function loadAddons() {
  let loadedAddons: AddonInfo[] = []
  watchEffect(() => {
    differenceBy(loadedAddons, addons, (addon: AddonInfo) => addon.name).forEach(addon => {
      commas.addon.unloadAddon(addon)
    })
    differenceBy(addons, loadedAddons, (addon: AddonInfo) => addon.name).forEach(addon => {
      commas.addon.loadAddon(addon, commas.raw)
    })
    loadedAddons = [...addons]
  })
}

export function loadCustomJS() {
  commas.addon.loadAddon({
    type: 'user',
    name: 'custom.js',
    entry: '',
    manifest: {},
  }, commas.raw)
}

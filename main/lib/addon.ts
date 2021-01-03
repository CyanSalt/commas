import type { BrowserWindow } from 'electron'
import difference from 'lodash/difference'
import * as commas from '../../api/main'
import { userData } from '../utils/directory'
import { getSettings, getSettingsEvents } from './settings'

let loadedAddons: string[] = []
async function applyAddons() {
  const settings = await getSettings()
  const addons: string[] = settings['terminal.addon.includes']
  difference(loadedAddons, addons).forEach(addon => {
    commas.app.unloadAddon(addon)
  })
  difference(addons, loadedAddons).forEach(addon => {
    commas.app.loadAddon(addon, commas)
  })
  loadedAddons = [...addons]
}

function loadAddons() {
  const events = getSettingsEvents()
  events.on('updated', () => {
    applyAddons()
  })
  return applyAddons()
}

function loadCustomJS() {
  commas.app.loadAddon('custom.js', commas)
}

function loadCustomCSS(frame: BrowserWindow) {
  const loadingCSS = userData.read('custom.css')
  frame.webContents.on('did-finish-load', async () => {
    const styles = await loadingCSS
    if (styles) {
      frame.webContents.insertCSS(styles, {
        cssOrigin: 'user',
      })
    }
  })
}

export {
  loadAddons,
  loadCustomJS,
  loadCustomCSS,
}

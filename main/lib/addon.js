const difference = require('lodash/difference')
const commas = require('../../api/main')
const { userData } = require('../utils/directory')
const { getSettings, getSettingsEvents } = require('./settings')

let loadedAddons = []
async function applyAddons() {
  const settings = await getSettings()
  const addons = settings['terminal.addon.includes']
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

function loadCustomCSS(frame) {
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

module.exports = {
  loadAddons,
  loadCustomJS,
  loadCustomCSS,
}

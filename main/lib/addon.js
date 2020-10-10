const commas = require('../../api/main')
const { userData } = require('../utils/directory')
const { getSettings, getSettingsEvents } = require('./settings')

async function applyAddons() {
  const settings = await getSettings()
  const addons = settings['terminal.addon.includes']
  for (const addon of addons) {
    commas.app.loadAddon(addon, commas)
  }
}

function loadAddons() {
  const events = getSettingsEvents()
  events.on('updated', () => {
    applyAddons()
  })
  return applyAddons()
}

function loadCustomJS() {
  const script = userData.require('custom.js')
  if (script) script(commas)
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

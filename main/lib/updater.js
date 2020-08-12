const { app, autoUpdater } = require('electron')
const fs = require('fs')
const { translate } = require('./i18n')
const { getSettings, getSettingsEvents } = require('./settings')
const { notify } = require('../utils/notification')

let autoUpdaterEnabled = true
let autoUpdaterTimer

async function executeChecking() {
  if (!autoUpdaterEnabled) return
  if (autoUpdaterTimer) clearTimeout(autoUpdaterTimer)
  try {
    await fs.promises.access(app.getPath('exe'))
    autoUpdater.checkForUpdates()
  } catch {
    return
  }
  // Check for updates endlessly
  autoUpdaterTimer = setTimeout(() => {
    autoUpdaterTimer = null
    executeChecking()
  }, 3600 * 1e3)
}

function checkForUpdates() {
  if (!app.isPackaged || !['darwin', 'win32'].includes(process.platform)) return
  autoUpdater.on('update-available', () => {
    clearInterval(autoUpdaterTimer)
  })
  autoUpdater.on('update-downloaded', async (event, notes, name) => {
    const response = await notify({
      title: name,
      body: translate('A new version has been downloaded. Restart the application to apply the updates.#!6'),
      actions: [
        translate('Restart#!7'),
        translate('Later#!8'),
      ],
    })
    if (response === 0) autoUpdater.quitAndInstall()
  })
  // Electron official feed URL
  const repo = 'CyanSalt/commas'
  const host = 'https://update.electronjs.org'
  const feedURL = `${host}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`
  try {
    autoUpdater.setFeedURL(feedURL)
  } catch (err) {
    return
  }
  const settings = getSettings()
  autoUpdaterEnabled = settings['terminal.updater.enabled']
  const events = getSettingsEvents()
  events.on('updated', settings => {
    autoUpdaterEnabled = settings['terminal.updater.enabled']
  })
  executeChecking()
}

module.exports = {
  checkForUpdates,
}

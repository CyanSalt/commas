const {app, autoUpdater, dialog} = require('electron')
const {promises: fs} = require('fs')
const {translate} = require('../build/main')

let autoUpdaterEnabled = true
let autoUpdaterPrepared = false
let autoUpdaterChecker

async function executeChecking() {
  if (!autoUpdaterEnabled || !autoUpdaterPrepared) return
  try {
    await fs.access(app.getPath('exe'))
    autoUpdater.checkForUpdates()
  } catch (err) {
    clearInterval(autoUpdaterChecker)
  }
}

function toggleAutoUpdater(value) {
  autoUpdaterEnabled = value
}

function checkForUpdates() {
  if (!app.isPackaged || !['darwin', 'win32'].includes(process.platform)) return
  autoUpdater.on('update-available', () => {
    clearInterval(autoUpdaterChecker)
  })
  autoUpdater.on('update-downloaded', async (event, notes, name) => {
    const options = {
      type: 'info',
      message: name,
      detail: translate('A new version has been downloaded. Restart the application to apply the updates.#!16'),
      buttons: [
        translate('Restart#!17'),
        translate('Later#!18'),
      ],
      defaultId: 0,
      cancelId: 1,
    }
    const {response} = await dialog.showMessageBox(options)
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
  autoUpdaterPrepared = true
  // Check for updates endlessly
  autoUpdaterChecker = setInterval(executeChecking, 3600 * 1e3)
  executeChecking()
}

module.exports = {
  toggleAutoUpdater,
  checkForUpdates,
}

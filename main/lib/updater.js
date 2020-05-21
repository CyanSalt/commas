const { app, autoUpdater, Notification, dialog } = require('electron')
const { promises: fs } = require('fs')
const { translate } = require('../build')

let autoUpdaterEnabled = true
let autoUpdaterPrepared = false
let autoUpdaterChecker

async function executeChecking() {
  if (!autoUpdaterEnabled || !autoUpdaterPrepared) return
  if (autoUpdaterChecker) clearTimeout(autoUpdaterChecker)
  try {
    await fs.access(app.getPath('exe'))
    autoUpdater.checkForUpdates()
  } catch {
    return
  }
  // Check for updates endlessly
  autoUpdaterChecker = setTimeout(() => {
    autoUpdaterChecker = null
    executeChecking()
  }, 3600 * 1e3)
}

/**
 * @param {boolean} value
 */
function toggleAutoUpdater(value) {
  autoUpdaterEnabled = value
}

/**
 * @typedef NotifyContext
 * @property {string} title
 * @property {string} body
 * @property {string[]} actions
 *
 * @param {NotifyContext} context
 */
async function notify({ title, body, actions }) {
  if (Notification.isSupported() && process.platform === 'darwin') {
    const notification = new Notification({
      title,
      body,
      silent: true,
      actions: actions.map(text => ({ type: 'button', text })),
    })
    return new Promise(resolve => {
      notification.on('action', (event, index) => resolve(index))
      notification.show()
    })
  } else {
    const options = {
      type: 'info',
      message: title,
      detail: body,
      buttons: actions,
      defaultId: 0,
      cancelId: 1,
    }
    const { response } = await dialog.showMessageBox(options)
    return response
  }
}

function checkForUpdates() {
  if (!app.isPackaged || !['darwin', 'win32'].includes(process.platform)) return
  autoUpdater.on('update-available', () => {
    clearInterval(autoUpdaterChecker)
  })
  autoUpdater.on('update-downloaded', async (event, notes, name) => {
    const response = await notify({
      title: name,
      body: translate('A new version has been downloaded. Restart the application to apply the updates.#!7'),
      actions: [
        translate('Restart#!8'),
        translate('Later#!9'),
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
  autoUpdaterPrepared = true
  executeChecking()
}

module.exports = {
  toggleAutoUpdater,
  checkForUpdates,
}

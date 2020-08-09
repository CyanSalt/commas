const { app, autoUpdater, Notification, dialog } = require('electron')
const fs = require('fs')
const { translate } = require('./i18n')
const { getSettings, getSettingsEvents } = require('./settings')

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

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.body
 * @param {string[]} options.actions
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

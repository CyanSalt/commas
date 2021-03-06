import * as fs from 'fs'
import { app, autoUpdater } from 'electron'
import { notify } from '../utils/notification'
import { translate } from './i18n'
import { getSettings, getSettingsEvents } from './settings'

let autoUpdaterEnabled = true
let autoUpdaterTimer: ReturnType<typeof setTimeout> | null = null

async function checkForUpdates() {
  if (autoUpdaterTimer) {
    clearTimeout(autoUpdaterTimer)
  }
  if (autoUpdaterEnabled) {
    try {
      await fs.promises.access(app.getPath('exe'))
      autoUpdater.checkForUpdates()
    } catch {
      // ignore error
    }
  }
  // Check for updates endlessly
  autoUpdaterTimer = setTimeout(() => {
    autoUpdaterTimer = null
    checkForUpdates()
  }, 3600 * 1e3)
}

function setupAutoUpdater() {
  if (!app.isPackaged || !['darwin', 'win32'].includes(process.platform)) return
  autoUpdater.on('update-available', () => {
    if (autoUpdaterTimer) clearTimeout(autoUpdaterTimer)
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
    autoUpdater.setFeedURL({ url: feedURL })
  } catch {
    return
  }
  const settings = getSettings()
  autoUpdaterEnabled = settings['terminal.updater.enabled']
  const events = getSettingsEvents()
  events.on('updated', latestSettings => {
    autoUpdaterEnabled = latestSettings['terminal.updater.enabled']
  })
  checkForUpdates()
}

export {
  setupAutoUpdater,
}

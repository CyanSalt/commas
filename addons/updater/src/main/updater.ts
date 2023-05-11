import * as fs from 'node:fs'
import * as commas from 'commas:api/main'
import { app, autoUpdater } from 'electron'

async function checkForUpdates() {
  try {
    await fs.promises.access(app.getPath('exe'))
    autoUpdater.checkForUpdates()
  } catch {
    // ignore error
  }
}

function setupAutoUpdater() {
  // Electron official feed URL
  const repo = 'CyanSalt/commas'
  const host = 'https://update.electronjs.org'
  const feedURL = `${host}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`
  try {
    autoUpdater.setFeedURL({ url: feedURL })
  } catch {
    // ignore error
  }
}

function useAutoUpdaterEffect() {
  const stop = commas.helper.watchBaseEffect((onInvalidate) => {
    const settings = commas.settings.useSettings()
    const interval = settings['updater.polling.interval']!
    if (interval) {
      const timer = setInterval(() => {
        checkForUpdates()
      }, interval * 6e4)
      onInvalidate(() => {
        clearInterval(timer)
      })
    }
    if (interval >= 0) {
      checkForUpdates()
    }
  })
  const handleUpdateAvailable = () => {
    stop()
  }
  autoUpdater.on('update-available', handleUpdateAvailable)
  return () => {
    autoUpdater.off('update-available', handleUpdateAvailable)
    stop()
  }
}

export {
  setupAutoUpdater,
  checkForUpdates,
  useAutoUpdaterEffect,
}

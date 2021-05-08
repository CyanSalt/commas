import * as fs from 'fs'
import { stop, unref } from '@vue/reactivity'
import { app, autoUpdater } from 'electron'
import { useSettings } from '../../../main/lib/settings'
import { useEffect } from '../../../main/utils/hooks'

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
  const reactiveEffect = useEffect((onInvalidate) => {
    const settings = unref(useSettings())
    const interval = settings['updater.polling.interval']
    if (interval) {
      const timer = setInterval(() => {
        checkForUpdates()
      }, interval * 6e4)
      onInvalidate(() => {
        clearInterval(timer)
      })
    }
    checkForUpdates()
  })
  autoUpdater.on('update-available', () => {
    stop(reactiveEffect)
  })
  return reactiveEffect
}

export {
  setupAutoUpdater,
  checkForUpdates,
  useAutoUpdaterEffect,
}

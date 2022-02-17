/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    const { useLaunchers } = commas.bundler.extract('launcher/main/launcher.ts')

    const launchersRef = useLaunchers()
    commas.ipcMain.provide('launchers', launchersRef)

    commas.settings.addSettingsSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    const { startLauncher, runLauncherScript, useLaunchers } = commas.bundler.extract('launcher/renderer/launcher.ts')
    const { clearLauncherSessions, LauncherSessionAddon } = commas.bundler.extract('launcher/renderer/session.ts')
    const { unref, watch } = commas.bundler.extract('vue')

    commas.ipcRenderer.on('start-launcher', (event, launcher) => {
      startLauncher(launcher)
    })
    commas.ipcRenderer.on('run-script', (event, launcher, index) => {
      runLauncherScript(launcher, index)
    })

    const settingsRef = commas.ipcRenderer.useSettings()

    watch(useLaunchers(), () => {
      clearLauncherSessions()
    })

    commas.workspace.effectTerminalTab((tab, active) => {
      const settings = unref(settingsRef)
      if (tab.group?.type === 'launcher' && settings['launcher.session.persist']) {
        if (active && !tab.addons.launcherSession) {
          tab.addons.launcherSession = new LauncherSessionAddon(tab.group.data)
          tab.xterm.loadAddon(tab.addons.launcherSession)
        } else if (!active && tab.addons.launcherSession) {
          tab.addons.launcherSession.dispose()
          delete tab.addons.launcherSession
        }
      }
    }, true)

    commas.context.provide(
      '@ui-side-list',
      commas.bundler.extract('launcher/renderer/launcher-list.vue').default,
    )

    commas.context.provide('preference', {
      component: commas.bundler.extract('launcher/renderer/launcher-link.vue').default,
      group: 'feature',
      priority: 1,
    })

  }
}

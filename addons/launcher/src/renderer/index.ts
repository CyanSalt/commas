import * as path from 'path'
import * as commas from 'commas:api/renderer'
import { unref, watch } from 'vue'
import { startLauncher, runLauncherScript, useLaunchers } from './launcher'
import LauncherLink from './launcher-link.vue'
import LauncherList from './launcher-list.vue'
import { clearLauncherSessions, LauncherSessionAddon } from './session'

commas.workspace.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.ipcRenderer.on('start-launcher', (event, launcher) => {
  startLauncher(launcher)
})
commas.ipcRenderer.on('run-script', (event, launcher, index) => {
  runLauncherScript(launcher, index)
})

const settingsRef = commas.remote.useSettings()

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

commas.context.provide('@ui-side-list', LauncherList)

commas.context.provide('preference', {
  component: LauncherLink,
  group: 'feature',
  priority: 1,
})

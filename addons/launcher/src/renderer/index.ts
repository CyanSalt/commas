import * as path from 'path'
import * as commas from 'commas:api/renderer'
import { unref, watch } from 'vue'
import { startLauncher, runLauncherScript, useLaunchers } from './launcher'
import LauncherLink from './launcher-link.vue'
import LauncherList from './launcher-list.vue'
import { clearLauncherSessions, LauncherSessionAddon } from './session'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

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

commas.workspace.registerXtermAddon('launcherSession', tab => {
  const settings = unref(settingsRef)
  if (tab.group?.type === 'launcher' && settings['launcher.session.persist']) {
    return new LauncherSessionAddon(tab.group.data)
  }
}, true)

commas.context.provide('@ui-side-list', LauncherList)

commas.context.provide('preference', {
  component: LauncherLink,
  group: 'feature',
  priority: 1,
})

import * as path from 'path'
import * as commas from 'commas:api/renderer'
import { watch } from 'vue'
import LauncherLink from './LauncherLink.vue'
import LauncherList from './LauncherList.vue'
import { startLauncher, runLauncherScript, useLaunchers } from './launcher'
import { clearLauncherSessions, LauncherSessionAddon } from './session'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.ipcRenderer.on('start-launcher', (event, launcher) => {
  startLauncher(launcher)
})
commas.ipcRenderer.on('run-script', (event, launcher, index) => {
  runLauncherScript(launcher, index)
})

watch(useLaunchers(), () => {
  clearLauncherSessions()
})

commas.workspace.registerXtermAddon('launcherSession', tab => {
  const settings = commas.remote.useSettings()
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

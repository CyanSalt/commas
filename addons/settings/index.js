module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const { ipcMain } = require('electron')
    const { getFocusedWindow } = require('../../main/lib/frame')

    commas.i18n.addTranslation(['zh', 'zh-CN'], require('./locales/zh-CN.json'))

    ipcMain.removeHandler('open-settings')
    ipcMain.handle('open-settings', () => {
      const frame = getFocusedWindow()
      frame.webContents.send('open-settings-pane')
    })

  } else {

    const { ipcRenderer } = require('electron')

    commas.workspace.registerTabPane('settings', {
      title: 'Settings#!settings.1',
      component: commas.module.require('internal/settings/settings-pane.vue').default,
      icon: {
        name: 'feather-icon icon-settings',
      },
    })

    ipcRenderer.on('open-settings-pane', () => {
      const { activateOrAddTerminalTab } = commas.module.require('hooks/terminal.mjs')
      const settingsTab = commas.workspace.getPaneTab('settings')
      activateOrAddTerminalTab(settingsTab)
    })

  }
}

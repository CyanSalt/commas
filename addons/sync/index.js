const { dialog, shell } = require('electron')

module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.i18n.addTranslation(['zh', 'zh-CN'], require('./locales/zh-CN.json'))

    commas.protocol.addRoute('sync-remote', async url => {
      const source = url.searchParams.get('from')
      let target = url.searchParams.get('to')
      let sourceURL
      try {
        sourceURL = new URL(source)
      } catch {
        return
      }
      if (!target) target = path.posix.basename(sourceURL.pathname)
      const options = {
        type: 'question',
        message: commas.i18n.translate('Sync data from remote#!sync.1'),
        detail: commas.i18n.translate(`The file '%T' will be synchronized from %F .#!sync.2`, {
          F: source,
          T: target,
        }),
        buttons: [
          commas.i18n.translate('Confirm#!3'),
          commas.i18n.translate('Cancel#!4'),
        ],
        defaultId: 0,
        cancelId: 1,
      }
      const { response } = await dialog.showMessageBox(options)
      if (response === 0) {
        try {
          await commas.directory.userData.download(target, source, true)
          const notificationResponse = commas.frame.notify({
            title: target,
            body: commas.i18n.translate('Synchronization succeeded#!sync.3'),
            actions: [
              commas.i18n.translate('View#!sync.5'),
              commas.i18n.translate('Later#!8'),
            ],
          })
          if (notificationResponse === 0) {
            shell.openPath(commas.directory.userData.file(target))
          }
        } catch {
          commas.frame.notify({
            title: target,
            body: commas.i18n.translate('Synchronization failed#!sync.4'),
          })
        }
      }
    })

  }
}

import { dialog, Notification } from 'electron'
import { emitting } from './helper'

interface NotifyOptions {
  title: string,
  body: string,
  actions: string[],
}

async function notify({ title, body, actions }: NotifyOptions) {
  if (Notification.isSupported() && process.platform === 'darwin') {
    const notification = new Notification({
      title,
      body,
      silent: true,
      actions: actions.map(text => ({ type: 'button', text })),
    })
    const response: Promise<number> = emitting(notification, 'action')
      .then(([event, index]) => index)
    notification.show()
    return response
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

export {
  notify,
}

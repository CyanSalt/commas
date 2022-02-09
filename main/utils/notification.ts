import type { MessageBoxOptions } from 'electron'
import { dialog, Notification } from 'electron'
import { oncea } from './helper'

interface NotifyOptions {
  type?: MessageBoxOptions['type'],
  title?: string,
  body: string,
  actions?: string[],
}

async function notify({ type, title = '', body, actions = [] }: NotifyOptions) {
  if (Notification.isSupported() && (!actions.length || process.platform === 'darwin')) {
    const notification = new Notification({
      title,
      body,
      silent: true,
      actions: actions.map(text => ({ type: 'button', text })),
    })
    notification.show()
    if (!actions.length) return -1
    return oncea(notification, 'action')
      .then(([event, index]: any[]) => index as number)
  } else if (type === 'error') {
    dialog.showErrorBox(title, body)
    return -1
  } else {
    const options = {
      type,
      message: title,
      detail: body,
      buttons: actions,
      defaultId: 0,
      cancelId: 1,
    }
    if (!actions.length) return -1
    const { response } = await dialog.showMessageBox(options)
    return response
  }
}

export {
  notify,
}

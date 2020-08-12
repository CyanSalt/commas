const { dialog, Notification } = require('electron')
const { emitting } = require('./helper')

/**
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.body
 * @param {string[]} options.actions
 */
async function notify({ title, body, actions }) {
  if (Notification.isSupported() && process.platform === 'darwin') {
    const notification = new Notification({
      title,
      body,
      silent: true,
      actions: actions.map(text => ({ type: 'button', text })),
    })
    const response = emitting(notification, 'action')
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

module.exports = {
  notify,
}

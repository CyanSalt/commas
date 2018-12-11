import {remote} from 'electron'
import {translate} from '../plugins/i18n'

export default {
  states: {
    multitabs: true,
    finding: false,
  },
  actions: {
    closing({state}) {
      const tabs = state.get('terminal.tabs')
      if (tabs.length <= 1) return false
      const args = {
        message: translate('Close Window?#!1'),
        detail: translate('All tabs in this window will be closed.#!2'),
        buttons: [
          translate('Confirm#!3'),
          translate('Cancel#!4'),
        ],
        cancelId: 1,
        defaultId: 0,
      }
      const frame = remote.getCurrentWindow()
      remote.dialog.showMessageBox(frame, args, response => {
        if (response === 0) frame.destroy()
      })
      return true
    },
    drop({action}, {tab, files}) {
      const paths = Array.from(files).map(({path}) => {
        if (path.indexOf(' ') !== -1) return `"${path}"`
        return path
      })
      action.dispatch('terminal.input', {
        tab,
        data: paths.join(' '),
      })
    },
    open(Maye, uri) {
      remote.shell.openExternal(uri)
    },
  }
}

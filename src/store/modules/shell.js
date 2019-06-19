import {remote} from 'electron'
import {translate} from '@/plugins/i18n'

export default {
  namespaced: true,
  state: {
    quiting: false,
    multitabs: true,
    finding: false,
  },
  mutations: {
    setQuiting(state, value) {
      state.quiting = value
    },
    setMultitabs(state, value) {
      state.multitabs = value
    },
    setFinding(state, value) {
      state.finding = value
    },
  },
  actions: {
    closing({state, rootState}) {
      if (state.quiting) return
      const tabs = rootState.terminal.tabs
      if (tabs.length <= 1) return
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
      throw remote.dialog.showMessageBox(frame, args, response => {
        if (response === 0) frame.destroy()
      })
    },
    drop({dispatch}, {tab, files}) {
      const paths = Array.from(files).map(({path}) => {
        if (path.indexOf(' ') !== -1) return `"${path}"`
        return path
      })
      dispatch('terminal/input', {
        tab,
        data: paths.join(' '),
      }, {root: true})
    },
  },
}

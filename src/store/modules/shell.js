import {remote} from 'electron'
import {translate} from '@/utils/i18n'

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
    closing() {
      const args = {
        message: translate('Close Window?#!1'),
        detail: translate('All tabs in this window will be closed.#!2'),
        buttons: [
          translate('Confirm#!3'),
          translate('Cancel#!4'),
        ],
        defaultId: 0,
        cancelId: 1,
      }
      const frame = remote.getCurrentWindow()
      // const {response} = await remote.dialog.showMessageBox(frame, args)
      // if (response === 0) frame.destroy()
      remote.dialog.showMessageBox(frame, args, response => {
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

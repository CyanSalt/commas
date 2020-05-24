import { ipcRenderer } from 'electron'
import { translate } from '../../../common/i18n'

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
    async closing() {
      const args = {
        type: 'info',
        message: translate('Close Window?#!1'),
        detail: translate('All tabs in this window will be closed.#!2'),
        buttons: [
          translate('Confirm#!3'),
          translate('Cancel#!4'),
        ],
        defaultId: 0,
        cancelId: 1,
      }
      const { response } = await ipcRenderer.invoke('message-box', args)
      if (response === 0) ipcRenderer.invoke('destroy')
    },
    drop({ dispatch }, { tab, files }) {
      const paths = Array.from(files).map(({ path }) => {
        if (path.indexOf(' ') !== -1) return `"${path}"`
        return path
      })
      dispatch('terminal/input', {
        tab,
        data: paths.join(' '),
      }, { root: true })
    },
  },
}

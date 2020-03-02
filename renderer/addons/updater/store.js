import {ipcRenderer} from 'electron'

export default {
  namespaced: true,
  state: {
    enabled: true,
  },
  mutations: {
    setEnabled(state, value) {
      state.enabled = value
    },
  },
  actions: {
    toggle({state, commit}) {
      const value = !state.enabled
      commit('setEnabled', value)
      ipcRenderer.send('toggle-auto-update', value)
    },
  },
}

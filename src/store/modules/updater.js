import {remote, shell} from 'electron'

const isPackaged = remote.app.isPackaged

const currentVersion = remote.app.getVersion()

export default {
  namespaced: true,
  state: {
    project: {
      owner: 'CyanSalt',
      repository: 'commas',
    },
    latest: null,
  },
  getters: {
    outdated: state => {
      return Boolean(state.latest)
    },
  },
  mutations: {
    setLatest(state, value) {
      state.latest = value
    },
  },
  actions: {
    async check({state, commit}) {
      if (!isPackaged) return
      const {project} = state
      const feed = `https://update.electronjs.org/${project.owner}/${project.repository}/${process.platform}-${process.arch}/${currentVersion}`
      const response = await fetch(feed)
      if (response.status === 200) {
        const data = await response.json()
        if (data) commit('setLatest', data)
      }
    },
    update(state) {
      const {project} = state
      shell.openExternal(`https://github.com/${project.owner}/${project.repository}/releases`)
    },
  },
}

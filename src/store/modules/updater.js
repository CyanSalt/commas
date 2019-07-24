import {remote, shell} from 'electron'

const isPackaged = remote.app.isPackaged

function compareVersions(ver1, ver2) {
  const arr1 = ver1.split('.')
  const arr2 = ver2.split('.')
  for (let index = 0; index < arr1.length; index++) {
    if (arr2.length <= index) return 1
    const cur1 = parseInt(arr1[index], 10)
    const cur2 = parseInt(arr2[index], 10)
    if (cur1 !== cur2) {
      return cur1 < cur2 ? -1 : 1
    }
  }
  return arr2.length === arr1.length ? 0 : -1
}

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
      if (!state.latest) return false
      return compareVersions(state.latest, currentVersion) === 1
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
      const checkpoint = `https://api.github.com/repos/${project.owner}/${project.repository}/releases/latest`
      const response = await fetch(checkpoint)
      if (response.status === 200) {
        const data = await response.json()
        if (data) commit('setLatest', data.name)
      }
    },
    update(state) {
      const {project} = state
      shell.openExternal(`https://github.com/${project.owner}/${project.repository}/releases`)
    },
  },
}

import fallback from '@assets/settings.json'
import {userStorage} from '@/utils/storage'
import {unreactive} from '@/utils/object'
import {cloneDeep, isEqual} from 'lodash'

export default {
  namespaced: true,
  state: {
    fallback,
    settings: cloneDeep(fallback),
    watcher: null,
    writer: null,
  },
  mutations: {
    setSettings(state, value) {
      Object.assign(state.settings, value)
    },
    setWatcher(state, value) {
      state.watcher = value
    },
    setWriter(state, value) {
      state.writer = value
    },
  },
  actions: {
    async load({commit}) {
      // Load user settings
      const result = await userStorage.fetch('settings.json')
      if (!result) return
      commit('setSettings', result.data)
      commit('setWriter', unreactive(result.writer))
    },
    save({state}) {
      // Filter default values on saving
      const reducer = (diff, [key, value]) => {
        if (!isEqual(value, fallback[key])) {
          diff[key] = value
        }
        return diff
      }
      return userStorage.update('settings.json', {
        // TODO: better data merging logic
        data: Object.entries(state.settings).reduce(reducer, {}),
        writer: state.writer,
      })
    },
    update({commit, dispatch}, patch) {
      commit('setSettings', patch)
      return dispatch('save')
    },
    watch({state, commit, dispatch}, callback) {
      if (state.watcher) state.watcher.close()
      const watcher = userStorage.watch('settings.json', async () => {
        await dispatch('load')
        callback(state.settings)
      })
      commit('setWatcher', watcher)
    },
  },
}

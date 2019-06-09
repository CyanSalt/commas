import fallback from '@/assets/settings.json'
import {FileStorage} from '@/plugins/storage'
import {clone, congruent} from '@/utils/object'

export default {
  namespaced: true,
  state: {
    fallback,
    settings: clone(fallback),
    watcher: null,
  },
  mutations: {
    setSettings(state, value) {
      state.settings = value
    },
    setWatcher(state, value) {
      state.watcher = value
    },
  },
  actions: {
    async load({commit}) {
      // Load user settings
      const declared = await FileStorage.load('settings.json')
      if (declared) {
        commit('setSettings', {...clone(fallback), ...declared})
      }
    },
    save({state}) {
      // Filter default values on saving
      const data = state.settings
      const reducer = (diff, [key, value]) => {
        if (!congruent(value, fallback[key])) {
          diff[key] = fallback[key]
        }
        return diff
      }
      // TODO: better data merging logic
      const computed = Object.entries(data).reduce(reducer, {})
      return FileStorage.save('settings.json', computed)
    },
    watch({state, commit, dispatch}, callback) {
      if (state.watcher) state.watcher.close()
      const watcher = FileStorage.watch('settings.json', async () => {
        await dispatch('load')
        callback(state.settings)
      })
      commit('setWatcher', watcher)
    },
  },
}

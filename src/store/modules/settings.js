import fallback from '@assets/settings.json'
import FileStorage from '@/utils/storage'
// import Writer from '@/utils/writer'
import {cloneDeep, isEqual} from 'lodash'
import * as JSON from 'json5'

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
      state.settings = value
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
      const source = await FileStorage.read('settings.json')
      if (!source) return
      // commit('setWriter', new Writer(source))
      try {
        const declared = JSON.parse(source)
        commit('setSettings', {...cloneDeep(fallback), ...declared})
      } catch (err) {
        // ignore error
      }
    },
    save({state}) {
      const writer = state.writer
      // Filter default values on saving
      const reducer = (diff, [key, value]) => {
        if (!isEqual(value, fallback[key])) {
          diff[key] = value
        }
        return diff
      }
      // TODO: better data merging logic
      const computed = Object.entries(state.settings).reduce(reducer, {})
      if (writer) {
        writer.write(computed)
        return FileStorage.write('settings.json', writer.toSource())
      } else {
        return FileStorage.save('settings.json', computed)
      }
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

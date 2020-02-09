import specs from '@assets/settings.spec.json'
import {userStorage} from '@/utils/storage'
import {unreactive} from '@/utils/object'
import {cloneDeep, isEqual} from 'lodash'

export default {
  namespaced: true,
  state: {
    specs,
    settings: {},
    watcher: null,
    writer: null,
  },
  getters: {
    fallback: state => {
      console.log(state.specs.reduce((settings, spec) => {
        settings[spec.key] = cloneDeep(spec.default)
        return settings
      }, {}))
      return state.specs.reduce((settings, spec) => {
        settings[spec.key] = cloneDeep(spec.default)
        return settings
      }, {})
    },
    settings: (state, getters) => {
      return {...getters.fallback, ...state.settings}
    },
  },
  mutations: {
    addSpec(state, value) {
      state.specs.push(value)
    },
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
      const result = await userStorage.fetch('settings.json')
      if (!result) return
      commit('setSettings', result.data)
      commit('setWriter', unreactive(result.writer))
    },
    save({state, getters}) {
      // Filter default values on saving
      const reducer = (diff, [key, value]) => {
        if (!isEqual(value, getters.fallback[key])) {
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
    overwrite({commit, dispatch}, settings) {
      commit('setSettings', settings)
      return dispatch('save')
    },
    update({state, dispatch}, patch) {
      return dispatch('overwrite', {...state.settings, ...patch})
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

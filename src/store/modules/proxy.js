import {createServer} from 'http'
import {createProxyServer} from 'http-proxy'
import FileStorage from '@/utils/storage'
import {unreactive} from '@/utils/object'
import {normalizeRules, getMatchedProxy} from '@/utils/proxy'

export default {
  namespaced: true,
  state: {
    server: null,
    port: null,
    rules: [],
    watcher: null,
  },
  mutations: {
    setServer(state, value) {
      state.server = value
    },
    setPort(state, value) {
      state.port = value
    },
    setRules(state, value) {
      state.rules = value
    },
    setWatcher(state, value) {
      state.watcher = value
    },
  },
  actions: {
    async load({commit}) {
      const rules = await FileStorage.load('proxy-rules.json')
      if (!rules) return
      commit('setRules', rules)
    },
    open({state, commit, rootState}) {
      let server = state.server
      if (server) return
      const rules = normalizeRules(state.rules)
      const settings = rootState.settings.settings
      const port = settings['terminal.proxyServer.port']
      // TODO: catch EADDRINUSE and notify error
      const proxyServer = createProxyServer()
      server = createServer((req, res) => {
        proxyServer.web(req, res, getMatchedProxy(rules, req.url))
      })
      server.listen(port)
      commit('setServer', unreactive(server))
      commit('setPort', port)
    },
    close({state, commit}) {
      if (!state.server) return
      state.server.close()
      commit('setServer', null)
      commit('setPort', null)
    },
    watch({state, commit, dispatch}) {
      if (state.watcher) state.watcher.close()
      const watcher = FileStorage.watch('proxy-rules.json', async () => {
        await dispatch('load')
        if (state.server) {
          await dispatch('close')
          dispatch('open')
        }
      })
      commit('setWatcher', watcher)
    },
    async refresh({state, dispatch, rootState}) {
      if (!state.server) return
      const settings = rootState.settings.settings
      const port = settings['terminal.proxyServer.port']
      if (port !== state.port) {
        await dispatch('close')
        dispatch('open')
      }
    },
  },
}

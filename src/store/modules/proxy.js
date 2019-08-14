import connect from 'connect'
import vhost from 'vhost'
import proxy from 'http-proxy-middleware'
import FileStorage from '@/utils/storage'
import {unreactive} from '@/utils/object'

const createProxyMiddleware = rule => {
  let options = rule.proxy
  if (typeof options === 'string') {
    options = {target: options}
  }
  options.logLevel = 'silent'
  return proxy(rule.context, options)
}

export default {
  namespaced: true,
  state: {
    server: null,
    rules: [],
    watcher: null,
  },
  getters: {
    port(state, getters, rootState) {
      const settings = rootState.settings.settings
      return settings['terminal.proxyServer.port']
    },
  },
  mutations: {
    setServer(state, value) {
      state.server = value
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
    open({state, getters, commit}) {
      let server = state.server
      if (server) return
      const app = connect()
      const rules = state.rules
      const port = getters.port
      const groups = rules.reduce((groups, rule) => {
        const key = rule.vhost || ''
        if (!groups[key]) groups[key] = []
        groups[key].push(rule)
        return groups
      }, {})
      for (const [host, rules] of Object.entries(groups)) {
        if (host) {
          const child = connect()
          for (const rule of rules) {
            child.use(createProxyMiddleware(rule))
          }
          app.use(vhost(host, child))
        } else {
          for (const rule of rules) {
            app.use(createProxyMiddleware(rule))
          }
        }
      }
      // TODO: catch EADDRINUSE and notify error
      server = app.listen(port)
      commit('setServer', unreactive(server))
    },
    close({state, commit}) {
      if (!state.server) return
      state.server.close()
      commit('setServer', null)
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
  },
}

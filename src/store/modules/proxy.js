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
      const app = connect()
      const rules = state.rules
      const settings = rootState.settings.settings
      const port = settings['terminal.proxyServer.port']
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

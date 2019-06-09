import connect from 'connect'
import vhost from 'vhost'
import proxy from 'http-proxy-middleware'

export default {
  namespaced: true,
  state: {
    server: null,
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
  },
  actions: {
    open({state, commit, rootState}) {
      const settings = rootState.settings.settings
      let server = state.server
      if (server) return
      const app = connect()
      const rules = settings['terminal.proxyServer.rules']
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
            child.use(proxy(rule.context, rule.proxy))
          }
          app.use(vhost(host, child))
        } else {
          for (const rule of rules) {
            app.use(proxy(rule.context, rule.proxy))
          }
        }
      }
      server = app.listen(port)
      commit('setServer', server)
    },
    close({state, commit}) {
      const server = state.server
      if (!server) return
      commit('setServer', null)
      server.close()
    },
  },
}

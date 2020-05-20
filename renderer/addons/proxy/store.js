import { createServer } from 'http'
import { connect } from 'net'
import { createProxyServer } from 'http-proxy'
import {
  parseProxyRules, getProxyByURL, getRewriteRulesByURL, rewriteProxy,
  getGlobalWebProxy, setGlobalWebProxy,
} from './utils'
import hooks from '@hooks'

export default {
  namespaced: true,
  state: {
    server: null,
    port: null,
    rules: [],
    globe: false,
    watcher: null,
    writer: null,
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
    setGlobe(state, value) {
      state.globe = value
    },
    setWatcher(state, value) {
      state.watcher = value
    },
    setWriter(state, value) {
      state.writer = value
    },
  },
  actions: {
    async load({ commit }) {
      const result = await hooks.storage.user.fetch('proxy-rules.json')
      if (!result) return
      commit('setRules', result.data)
      commit('setWriter', hooks.utils.unreactive(result.writer))
    },
    async loadSystem({ commit, rootGetters }) {
      const settings = rootGetters['settings/settings']
      const port = settings['terminal.proxyServer.port']
      const proxy = await getGlobalWebProxy()
      if (!proxy) return
      const globe = proxy.Enabled === 'Yes' && proxy.Server === '127.0.0.1'
        && proxy.Port === String(port)
      commit('setGlobe', globe)
    },
    open({ state, commit, rootGetters }) {
      let server = state.server
      if (server) return
      const rules = parseProxyRules(state.rules)
      const settings = rootGetters['settings/settings']
      const port = settings['terminal.proxyServer.port']
      // TODO: catch EADDRINUSE and notify error
      const proxyServer = createProxyServer()
      proxyServer.on('proxyReq', (proxyReq, req, res) => {
        rewriteProxy('request', proxyReq, getRewriteRulesByURL(rules, req.url))
      })
      proxyServer.on('proxyRes', (proxyRes, req, res) => {
        rewriteProxy('response', res, getRewriteRulesByURL(rules, req.url))
      })
      server = createServer((req, res) => {
        proxyServer.web(req, res, getProxyByURL(rules, req.url))
      })
      /** Inspired by {@link https://gist.github.com/tonygambone/2422322} */
      server.on('connect', (req, socket) => {
        const proxy = getProxyByURL(rules, 'https://' + req.url)
        let { protocol, host, port } = new URL(proxy.target)
        if (!port) port = protocol === 'http:' ? 80 : 443
        const connection = connect(port, host, () => {
          socket.write('HTTP/1.1 200 OK\r\n\r\n')
          socket.pipe(connection)
          connection.pipe(socket)
        })
      })
      server.listen(port)
      commit('setServer', hooks.utils.unreactive(server))
      commit('setPort', port)
    },
    close({ state, commit }) {
      if (!state.server) return
      state.server.close()
      commit('setServer', null)
      commit('setPort', null)
    },
    watch({ state, commit, dispatch }) {
      if (state.watcher) state.watcher.close()
      const watcher = hooks.storage.user.watch('proxy-rules.json', async () => {
        await dispatch('load')
        if (state.server) {
          await dispatch('close')
          dispatch('open')
        }
      })
      commit('setWatcher', watcher)
    },
    async refresh({ state, dispatch, rootGetters }) {
      if (!state.server) return
      const settings = rootGetters['settings/settings']
      const port = settings['terminal.proxyServer.port']
      if (port !== state.port) {
        await dispatch('close')
        dispatch('open')
      }
    },
    save({ state }, value) {
      return hooks.storage.user.update('proxy-rules.json', {
        data: value,
        writer: state.writer,
      })
    },
    async toggleGlobal({ state, commit, rootGetters }) {
      const value = !state.globe
      const settings = rootGetters['settings/settings']
      const port = state.port || settings['terminal.proxyServer.port']
      const proxy = value ? { host: '127.0.0.1', port } : false
      await setGlobalWebProxy(proxy)
      commit('setGlobe', value)
    },
  },
}

import express from 'express'
import proxy from 'http-proxy-middleware'

export default {
  states: {
    server: null,
  },
  accessors: {
    port({state}) {
      const settings = state.get('settings.user')
      return settings['terminal.proxyServer.port']
    },
  },
  actions: {
    open({state}) {
      const settings = state.get('settings.user')
      let server = state.get([this, 'server'])
      if (server) return server
      const app = express()
      const rules = settings['terminal.proxyServer.rules']
      const port = settings['terminal.proxyServer.port']
      for (const rule of rules) {
        app.use(proxy(rule.context, rule.proxy))
      }
      server = app.listen(port)
      state.set([this, 'server'], server)
      return server
    },
    close({state}) {
      let server = state.get([this, 'server'])
      if (!server) return false
      server.close()
      state.set([this, 'server'], null)
      return true
    },
  },
}

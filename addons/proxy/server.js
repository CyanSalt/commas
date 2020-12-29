const http = require('http')
const net = require('net')
const { createProxyServer } = require('http-proxy')
const memoize = require('lodash/memoize')
const { broadcast } = require('../../main/lib/frame')
const { getSettings, getSettingsEvents } = require('../../main/lib/settings')
const { getProxyRulesEvents, getProxyRules } = require('./rules')
const {
  extractProxyRules,
  getProxyServerOptions,
  getProxyRewritingRules,
  rewriteProxy,
} = require('./utils')

async function createServer() {
  const settings = await getSettings()
  const port = settings['proxy.server.port']
  const proxyRules = await getProxyRules()
  const rules = extractProxyRules(proxyRules)
  // TODO: catch EADDRINUSE and notify error
  const proxyServer = createProxyServer()
  proxyServer.on('proxyReq', (proxyReq, req, res) => {
    rewriteProxy('request', proxyReq, getProxyRewritingRules(rules, req.url))
  })
  proxyServer.on('proxyRes', (proxyRes, req, res) => {
    rewriteProxy('response', res, getProxyRewritingRules(rules, req.url))
  })
  const server = http.createServer((req, res) => {
    proxyServer.web(req, res, getProxyServerOptions(rules, req.url))
  })
  /** Inspired by {@link https://gist.github.com/tonygambone/2422322} */
  server.on('connect', (req, socket) => {
    const proxy = getProxyServerOptions(rules, 'https://' + req.url)
    let { protocol, host, port: targetPort } = new URL(proxy.target)
    if (!targetPort) targetPort = protocol === 'http:' ? 80 : 443
    const connection = net.connect(targetPort, host, () => {
      socket.write('HTTP/1.1 200 OK\r\n\r\n')
      socket.pipe(connection)
      connection.pipe(socket)
    })
  })
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, () => {
      server.removeListener('error', reject)
      broadcast('proxy-server-status-updated', true)
      resolve(server)
    })
  })
}

const startServer = memoize(async () => {
  const server = createServer()
  const settingsEvents = getSettingsEvents()
  settingsEvents.on('updated', () => {
    reloadServer()
  })
  const rulesEvents = getProxyRulesEvents()
  rulesEvents.on('updated', () => {
    reloadServer()
  })
  try {
    return await server
  } catch (err) {
    startServer.cache.clear()
    throw err
  }
})

async function stopServer() {
  const currentServer = startServer.cache.get()
  if (currentServer) {
    const server = await currentServer
    server.close()
    startServer.cache.clear()
    broadcast('proxy-server-status-updated', false)
  }
}

async function reloadServer() {
  const currentServer = startServer.cache.get()
  if (currentServer) {
    const server = await currentServer
    server.close()
    startServer.cache.set(undefined, createServer())
  }
}

function handleProxyServerMessages(commas) {
  commas.ipcMain.handle('get-proxy-server-status', () => {
    return startServer.cache.has()
  })
  commas.ipcMain.handle('set-proxy-server-status', () => {
    const currentServer = startServer.cache.get()
    if (currentServer) {
      stopServer()
    } else {
      startServer()
    }
  })
  commas.app.onCleanup(() => {
    stopServer()
  })
}

module.exports = {
  handleProxyServerMessages,
}

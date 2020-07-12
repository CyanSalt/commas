const { ipcMain } = require('electron')
const { createProxyServer } = require('http-proxy')
const http = require('http')
const net = require('net')
const memoize = require('lodash/memoize')
const { getSettings, getSettingsEvents } = require('../../main/lib/settings')
const { broadcast } = require('../../main/lib/frame')
const { userData } = require('../../main/utils/directory')
const {
  extractProxyRules,
  getProxyServerOptions,
  getProxyRewritingRules,
  rewriteProxy,
} = require('./utils')

function loadProxyRules() {
  return userData.fetch('proxy-rules.json')
}

const getRawProxyRules = memoize(() => {
  userData.watch('proxy-rules.json', () => {
    getRawProxyRules.cache.set(undefined, loadProxyRules())
    reloadServer()
  })
  return loadProxyRules()
})

async function createServer() {
  const settings = await getSettings()
  const port = settings['terminal.proxyServer.port']
  const proxyRules = await getRawProxyRules()
  const rules = extractProxyRules(proxyRules && proxyRules.data || [])
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
    let { protocol, host, port } = new URL(proxy.target)
    if (!port) port = protocol === 'http:' ? 80 : 443
    const connection = net.connect(port, host, () => {
      socket.write('HTTP/1.1 200 OK\r\n\r\n')
      socket.pipe(connection)
      connection.pipe(socket)
    })
  })
  return new Promise(resolve => {
    server.listen(port, () => {
      broadcast('proxy-server-status-updated', true)
      resolve(server)
    })
  })
}

const startServer = memoize(() => {
  const server = createServer()
  const events = getSettingsEvents()
  events.on('updated', () => {
    reloadServer()
  })
  return server
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

function handleProxyServerMessages() {
  ipcMain.handle('get-proxy-server-status', () => {
    return startServer.cache.has()
  })
  ipcMain.handle('set-proxy-server-status', () => {
    const currentServer = startServer.cache.get()
    if (currentServer) {
      stopServer()
    } else {
      startServer()
    }
  })
}

module.exports = {
  handleProxyServerMessages,
}

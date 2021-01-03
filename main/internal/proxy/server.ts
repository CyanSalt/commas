import type { Server } from 'http'
import * as http from 'http'
import * as net from 'net'
import { createProxyServer } from 'http-proxy'
import memoize from 'lodash/memoize'
import { broadcast } from '../../lib/frame'
import { getSettings, getSettingsEvents } from '../../lib/settings'
import { getProxyRulesEvents, getProxyRules } from './rule'
import {
  extractProxyRules,
  getProxyServerOptions,
  getProxyRewritingRules,
  rewriteProxy,
} from './utils'

async function createServer() {
  const settings = await getSettings()
  const port: number = settings['proxy.server.port']
  const proxyRules = await getProxyRules()
  const rules = extractProxyRules(proxyRules)
  // TODO: catch EADDRINUSE and notify error
  const proxyServer = createProxyServer()
  proxyServer.on('proxyReq', (proxyReq, req, res) => {
    rewriteProxy('request', proxyReq, getProxyRewritingRules(rules, req.url!))
  })
  proxyServer.on('proxyRes', (proxyRes, req, res) => {
    rewriteProxy('response', res, getProxyRewritingRules(rules, req.url!))
  })
  const server = http.createServer((req, res) => {
    proxyServer.web(req, res, getProxyServerOptions(rules, req.url!))
  })
  /** Inspired by {@link https://gist.github.com/tonygambone/2422322} */
  server.on('connect', (req, socket) => {
    const proxy = getProxyServerOptions(rules, 'https://' + req.url)
    const { protocol, host, port: proxyPort } = new URL(proxy.target)
    const targetPort = proxyPort || protocol === 'http:' ? 80 : 443
    const connection = net.connect(targetPort, host, () => {
      socket.write('HTTP/1.1 200 OK\r\n\r\n')
      socket.pipe(connection)
      connection.pipe(socket)
    })
  })
  return new Promise<Server>((resolve, reject) => {
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
    startServer.cache.clear?.()
    throw err
  }
})

async function stopServer() {
  const currentServer: ReturnType<typeof startServer> | undefined = startServer.cache.get(undefined)
  if (currentServer) {
    const server = await currentServer
    server.close()
    startServer.cache.clear?.()
    broadcast('proxy-server-status-updated', false)
  }
}

async function reloadServer() {
  const currentServer: ReturnType<typeof startServer> | undefined = startServer.cache.get(undefined)
  if (currentServer) {
    const server = await currentServer
    server.close()
    startServer.cache.set(undefined, createServer())
  }
}

export {
  startServer,
  stopServer,
}

import type { Server } from 'http'
import * as http from 'http'
import * as net from 'net'
import type { ReactiveEffect } from '@vue/reactivity'
import { customRef, stop, unref } from '@vue/reactivity'
import { createProxyServer } from 'http-proxy'
import { useSettings } from '../../lib/settings'
import { useEffect } from '../../utils/hooks'
import { useProxyRules } from './rule'
import {
  extractProxyRules,
  getProxyServerOptions,
  getProxyRewritingRules,
  rewriteProxy,
} from './utils'

async function createServer(cancelation?: Promise<void>) {
  const settings = unref(useSettings())
  const proxyRules = unref(useProxyRules())
  const port: number = settings['proxy.server.port']
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
  if (cancelation) await cancelation
  return new Promise<Server>((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, () => {
      server.removeListener('error', reject)
      resolve(server)
    })
  })
}

async function closeServer(promise: Promise<Server>) {
  const server = await promise
  return new Promise<void>((resolve, reject) => {
    server.close(err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

const serverStatusRef = customRef<boolean>((track, trigger) => {
  let status = false
  let cancelation: Promise<void> | undefined
  let serverEffect: ReactiveEffect<void>
  const createEffect = () => useEffect(async (onInvalidate) => {
    const server = createServer(cancelation)
    onInvalidate(async () => {
      cancelation = closeServer(server)
      await cancelation
      status = false
      trigger()
    })
    try {
      await server
      status = true
      trigger()
    } catch {
      // ignore error
    }
  })
  return {
    get() {
      track()
      return status
    },
    set(value) {
      if (status === value) return
      if (value) {
        serverEffect = createEffect()
      } else {
        stop(serverEffect)
      }
    },
  }
})

function useProxyServerStatus() {
  return serverStatusRef
}

export {
  useProxyServerStatus,
}

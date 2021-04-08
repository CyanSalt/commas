import type { Server } from 'http'
import * as http from 'http'
import * as net from 'net'
import type { ReactiveEffect } from '@vue/reactivity'
import { computed, customRef, stop, unref } from '@vue/reactivity'
import { createProxyServer } from 'http-proxy'
import * as commas from '../../../api/main'
import { useSettings } from '../../lib/settings'
import { useEffect } from '../../utils/hooks'
import { useProxyRules } from './rule'
import {
  extractProxyRules,
  getProxyServerOptions,
  getProxyRewritingRules,
  rewriteProxy,
} from './utils'

const extractedProxyRulesRef = computed(() => {
  const proxyRules = unref(useProxyRules())
  return extractProxyRules(proxyRules)
})

async function createServer(cancelation?: Promise<void>) {
  const settings = unref(useSettings())
  const port: number = settings['proxy.server.port']
  // TODO: catch EADDRINUSE and notify error
  const proxyServer = createProxyServer()
  proxyServer.on('proxyReq', (proxyReq, req, res) => {
    const rules = unref(extractedProxyRulesRef)
    rewriteProxy('request', proxyReq, req, getProxyRewritingRules(rules, req.url!))
    commas.app.events.emit('proxy-server-request', proxyReq, req, res)
  })
  proxyServer.on('proxyRes', (proxyRes, req, res) => {
    const rules = unref(extractedProxyRulesRef)
    rewriteProxy('response', res, proxyRes, getProxyRewritingRules(rules, req.url!))
    commas.app.events.emit('proxy-server-response', proxyRes, req, res)
  })
  const server = http.createServer((req, res) => {
    const rules = unref(extractedProxyRulesRef)
    proxyServer.web(req, res, getProxyServerOptions(rules, req.url!))
  })
  /** Inspired by {@link https://gist.github.com/tonygambone/2422322} */
  server.on('connect', (req, socket) => {
    const rules = unref(extractedProxyRulesRef)
    const proxy = getProxyServerOptions(rules, 'https://' + req.url)
    const { protocol, host, port: proxyPort } = new URL(proxy.target)
    const targetPort = proxyPort || protocol === 'http:' ? 80 : 443
    const connection = net.connect(targetPort, host, () => {
      socket.write('HTTP/1.1 200 OK\r\n\r\n')
      socket.pipe(connection)
      connection.pipe(socket)
    })
  })
  server.on('close', () => {
    proxyServer.close()
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
    setTimeout(resolve, 1000)
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

import * as http from 'node:http'
import * as commas from 'commas:api/main'
import { AccessTokenError, getAuthorizationURL, resolveAuthorization } from './chat'

let listeningPort: number | undefined
let currentServer: Promise<http.Server> | undefined

async function createServer() {
  const port = 30041
  const server = http.createServer(async (req, res) => {
    const route = new URL(`http://localhost:${port}${req.url ?? '/'}`)
    const code = route.searchParams.get('code')
    const state = route.searchParams.get('state')
    if (code && state) {
      await resolveAuthorization(code, state, route.origin)
    }
    res.writeHead(302, {
      Location: 'commas://',
    })
    res.end()
  })
  listeningPort = port
  server.listen(port)
  return server
}

async function startServer() {
  if (!currentServer) {
    currentServer = createServer()
  }
  return currentServer
}

async function stopServer() {
  const value = currentServer
  if (value) {
    currentServer = undefined
    listeningPort = undefined
    const server = await value
    server.close()
  }
}

function getServerURL() {
  if (!listeningPort) return undefined
  return `http://localhost:${listeningPort}`
}

async function authorize() {
  const redirectURL = getServerURL()
  if (redirectURL) {
    const url = await getAuthorizationURL(redirectURL)
    commas.context.invoke('global-main:open-url', url)
  }
}

async function access<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof AccessTokenError) {
      authorize()
    }
    throw err
  }
}

export {
  startServer,
  stopServer,
  authorize,
  access,
}

import * as http from 'node:http'
import * as stream from 'node:stream'
import * as address from 'address'
import getPort from 'get-port'

let streams = new Map<string, stream.PassThrough>()
let outputs = new Map<string, stream.PassThrough>()

function getStream(channel: string) {
  let duplex = streams.get(channel)
  if (!duplex) {
    duplex = new stream.PassThrough()
    streams.set(channel, duplex)
    outputs.set(channel, duplex.pipe(new stream.PassThrough()))
  }
  return duplex
}

function finishStream(channel: string) {
  const duplex = streams.get(channel)!
  duplex.end()
  const output = outputs.get(channel)!
  return output
}

function endStream(channel: string) {
  streams.delete(channel)
  return streams.size
}

let listeningPort: number | undefined
let currentServer: Promise<http.Server> | undefined

async function createServer() {
  const port = await getPort()
  const server = http.createServer(async (req, res) => {
    const route = new URL(`http://localhost:${port}${req.url ?? '/'}`)
    const search = route.searchParams.get('channel')
    if (!search) return
    const channel = Buffer.from(search, 'base64url').toString('utf8')
    const duplex = getStream(channel)
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Transfer-Encoding': 'chunked',
    })
    await stream.promises.pipeline(duplex, res)
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

function getURL(channel: string) {
  const search = Buffer.from(channel, 'utf8').toString('base64url')
  const ip = address.ip() ?? 'localhost'
  const route = new URL(`http://${ip}:${listeningPort}`)
  route.searchParams.set('channel', search)
  return route.href
}

export {
  getStream,
  finishStream,
  endStream,
  startServer,
  stopServer,
  getURL,
}

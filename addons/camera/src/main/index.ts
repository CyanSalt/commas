import * as fs from 'node:fs'
import * as http from 'node:http'
import * as path from 'node:path'
import * as stream from 'node:stream'
import { fileURLToPath } from 'node:url'
import * as address from 'address'
import * as commas from 'commas:api/main'
import type { NativeImage, Rectangle } from 'electron'
import { app } from 'electron'
import getPort from 'get-port'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'capture-page': (rect: Rectangle) => NativeImage,
    'ttyrec-read': (url: string) => void,
    'ttyrec-write-data': (channel: string, data: Buffer) => void,
    'ttyrec-write-finish': (channel: string) => string,
    'ttyrec-write-end': (channel: string) => void,
    'ttyrec-share': (channel: string) => string,
  }
}

interface TTYRecBlock {
  offset: number,
  size: number,
  data: Buffer,
}

/**
 * {@link https://en.wikipedia.org/wiki/Ttyrec#Technical_file_format_specification}
 */
function createTTYRecBlock(data: Buffer, base = 0) {
  const sec = data.readUInt32LE(0)
  const usec = data.readUInt32LE(4)
  const len = data.readUInt32LE(8)
  return {
    offset: sec * 1000 + usec / 1000 - base,
    size: len,
    data: Buffer.alloc(0),
  }
}

function createTTYRecFrame(block: TTYRecBlock) {
  return {
    offset: block.offset,
    data: block.data.toString(),
  }
}

export default () => {

  commas.ipcMain.handle('capture-page', async (event, rect) => {
    return event.sender.capturePage(rect)
  })

  commas.context.provide('cli.command', {
    command: 'connect',
    description: 'Connect to a remote TTY#!cli.description.connect',
    usage: '<url>#!cli.usage.connect',
    async handler({ sender, argv }) {
      const url = argv[0]
      if (!url) return
      commas.frame.send(sender, 'open-remote-recorder', url)
    },
  })

  commas.ipcMain.handle('ttyrec-read', async (event, url) => {
    const source = new URL(url)
    let readable: stream.Readable
    if (source.protocol === 'file:') {
      readable = fs.createReadStream(fileURLToPath(url))
    } else {
      const response = await fetch(url)
      readable = stream.Readable.fromWeb(response.body as never)
    }
    let data = Buffer.alloc(0)
    let block: TTYRecBlock | undefined
    let start: number | undefined
    const resolve = () => {
      if (block) {
        const length = block.size - block.data.length
        block.data = Buffer.concat([block.data, data.subarray(0, length)])
        data = data.subarray(length)
        if (block.data.length === block.size) {
          commas.frame.send(event.sender, 'ttyrec-read-data', url, createTTYRecFrame(block))
          block = undefined
          resolve()
        }
      } else if (data.length >= 12) {
        block = createTTYRecBlock(data, start)
        if (typeof start !== 'number') {
          start = block.offset
          block.offset = 0
        }
        data = data.subarray(12)
        resolve()
      }
    }
    for await (const chunk of readable) {
      data = Buffer.concat([data, chunk])
      resolve()
    }
    commas.frame.send(event.sender, 'ttyrec-read-data', url, {
      offset: -1,
      data: '',
    })
  })

  let streams = new Map<string, stream.PassThrough>()
  let outputs = new Map<string, stream.PassThrough>()

  let listeningPort: number | undefined
  let currentServer: Promise<http.Server> | undefined

  async function createServer() {
    const port = await getPort()
    const server = http.createServer(async (req, res) => {
      if (!req.url) return
      const route = new URL(`http://localhost${req.url}`)
      const search = route.searchParams.get('channel')
      if (!search) return
      const channel = Buffer.from(search, 'base64url').toString('utf8')
      const duplex = streams.get(channel)!
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Transfer-Encoding': 'chunked',
      })
      await stream.promises.pipeline(duplex, res)
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

  commas.app.onCleanup(() => {
    stopServer()
  })

  commas.ipcMain.handle('ttyrec-write-data', async (event, channel, data) => {
    let duplex = streams.get(channel)
    if (!duplex) {
      duplex = new stream.PassThrough()
      streams.set(channel, duplex)
      outputs.set(channel, duplex.pipe(new stream.PassThrough()))
    }
    duplex.push(data)
  })

  commas.ipcMain.handle('ttyrec-write-finish', async (event, channel) => {
    const duplex = streams.get(channel)!
    duplex.end()
    const output = outputs.get(channel)!
    const file = path.join(app.getPath('downloads'), channel)
    await stream.promises.pipeline(
      output,
      fs.createWriteStream(file),
    )
    return file
  })

  commas.ipcMain.handle('ttyrec-write-end', async (event, channel) => {
    streams.delete(channel)
    if (!streams.size) {
      stopServer()
    }
  })

  commas.ipcMain.handle('ttyrec-share', async (event, channel) => {
    await startServer()
    const search = Buffer.from(channel, 'utf8').toString('base64url')
    const ip = address.ip() ?? 'localhost'
    const route = new URL(`http://${ip}:${listeningPort}`)
    route.searchParams.set('channel', search)
    return route.href
  })

  commas.i18n.addTranslationDirectory('locales')

}

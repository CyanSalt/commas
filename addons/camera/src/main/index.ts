import * as fs from 'node:fs'
import * as path from 'node:path'
import * as stream from 'node:stream'
import { fileURLToPath } from 'node:url'
import * as commas from 'commas:api/main'
import type { NativeImage, Rectangle } from 'electron'
import { app } from 'electron'
import { endStream, finishStream, getStream, getURL, startServer, stopServer } from './server'

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
    args: {
      name: 'url',
    },
    usage: '<url>#!cli.usage.connect',
    async handler({ sender, argv }) {
      const url = argv[0]
      if (!url) return
      const remote = new URL(url)
      // Compatible with external URLs
      if (remote.protocol === 'commas:' && remote.host === 'recorder') {
        commas.frame.send(sender, 'open-remote-recorder', remote.searchParams.get('command')!)
      } else {
        commas.frame.send(sender, 'open-remote-recorder', url)
      }
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
    try {
      for await (const chunk of readable) {
        data = Buffer.concat([data, chunk])
        resolve()
      }
    } catch {
      // continue
    }
    commas.frame.send(event.sender, 'ttyrec-read-data', url, {
      offset: -1,
      data: '',
    })
  })

  commas.app.onCleanup(() => {
    stopServer()
  })

  commas.ipcMain.handle('ttyrec-write-data', async (event, channel, data) => {
    const duplex = getStream(channel)
    duplex.push(data)
  })

  commas.ipcMain.handle('ttyrec-write-finish', async (event, channel) => {
    const output = finishStream(channel)
    const file = path.join(app.getPath('downloads'), channel)
    await stream.promises.pipeline(
      output,
      fs.createWriteStream(file),
    )
    return file
  })

  commas.ipcMain.handle('ttyrec-write-end', async (event, channel) => {
    const size = endStream(channel)
    if (!size) {
      stopServer()
    }
  })

  commas.ipcMain.handle('ttyrec-share', async (event, channel) => {
    await startServer()
    const remote = getURL(channel)
    const url = new URL('commas://recorder/')
    url.searchParams.set('command', remote)
    return url.href
  })

  commas.i18n.addTranslationDirectory('locales')

}

import * as fs from 'node:fs'
import * as commas from 'commas:api/main'
import type { NativeImage, Rectangle } from 'electron'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'capture-page': (rect: Rectangle) => NativeImage,
    'ttyrec-read': (file: string) => void,
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

  commas.ipcMain.handle('ttyrec-read', async (event, file) => {
    const readable = fs.createReadStream(file)
    let data = Buffer.alloc(0)
    let block: TTYRecBlock | undefined
    let start: number | undefined
    const resolve = () => {
      if (block) {
        const length = block.size - block.data.length
        block.data = Buffer.concat([block.data, data.subarray(0, length)])
        data = data.subarray(length)
        if (block.data.length === block.size) {
          commas.frame.send(event.sender, 'ttyrec-data', file, createTTYRecFrame(block))
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
    commas.frame.send(event.sender, 'ttyrec-data', file, {
      offset: -1,
      data: '',
    })
  })

  commas.i18n.addTranslationDirectory('locales')

}

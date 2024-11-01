import type { TerminalTab } from '@commas/types/terminal'
import type { ITerminalAddon } from '@xterm/xterm'
import * as commas from 'commas:api/renderer'
import type { TTYRecFrame } from '../types/ttyrec'

export class RecorderAddon implements ITerminalAddon {

  tab: TerminalTab
  frames: TTYRecFrame[]
  startedAt: number

  constructor(tab: TerminalTab) {
    this.tab = tab
    this.frames = []
    this.startedAt = 0
  }

  onData = (tab: TerminalTab, data: string) => {
    if (typeof this.startedAt === 'number' && tab === this.tab) {
      this.frames.push({
        offset: Date.now() - this.startedAt,
        data,
      })
    }
  }

  activate() {
    this.frames = []
    this.startedAt = Date.now()
    this.frames.push({
      offset: 0,
      data: this.tab.addons.serialize.serialize(),
    })
    commas.app.events.on('terminal.data', this.onData)
  }

  dispose() {
    commas.app.events.off('terminal.data', this.onData)
    this.frames = []
    this.startedAt = 0
  }

  read() {
    return this.frames
  }

  save() {
    const data = Buffer.concat(
      this.frames.flatMap(item => {
        const header = Buffer.alloc(12)
        const body = Buffer.from(item.data)
        header.writeUInt32LE(Math.floor(item.offset / 1000), 0)
        header.writeUInt32LE((item.offset % 1000) * 1000, 4)
        header.writeUInt32LE(body.length, 8)
        return [header, body]
      }),
    )
    return {
      startedAt: this.startedAt,
      data,
    }
  }

}

import type { TerminalTab } from '@commas/types/terminal'
import type { ITerminalAddon } from '@xterm/xterm'
import * as commas from 'commas:api/renderer'
import type { TTYRecFrame } from '../types/ttyrec'

interface RecorderOptions {
  onInitialize: (startedAt: number) => string,
  onData: (data: Buffer, channel: string) => void,
  onEnd: (channel: string) => void,
}

export class RecorderAddon implements ITerminalAddon {

  tab: TerminalTab
  options: RecorderOptions
  startedAt: number
  channel?: string

  constructor(tab: TerminalTab, options: RecorderOptions) {
    this.tab = tab
    this.startedAt = 0
    this.options = options
  }

  onData = (tab: TerminalTab, data: string) => {
    if (typeof this.startedAt === 'number' && tab === this.tab) {
      this.write({
        offset: Date.now() - this.startedAt,
        data,
      })
    }
  }

  activate() {
    this.startedAt = Date.now()
    this.channel = this.options.onInitialize(this.startedAt)
    this.write({
      offset: 0,
      data: this.tab.addons.serialize.serialize(),
    })
    commas.app.events.on('terminal.data', this.onData)
  }

  dispose() {
    commas.app.events.off('terminal.data', this.onData)
    this.startedAt = 0
    this.channel = undefined
  }

  write(frame: TTYRecFrame) {
    if (!this.channel) return
    this.options.onData.call(
      undefined,
      this.serialize(frame),
      this.channel,
    )
  }

  serialize(frame: TTYRecFrame) {
    const header = Buffer.alloc(12)
    const body = Buffer.from(frame.data)
    header.writeUInt32LE(Math.floor(frame.offset / 1000), 0)
    header.writeUInt32LE((frame.offset % 1000) * 1000, 4)
    header.writeUInt32LE(body.length, 8)
    return Buffer.concat([header, body])
  }

  getChannel() {
    return this.channel
  }

}

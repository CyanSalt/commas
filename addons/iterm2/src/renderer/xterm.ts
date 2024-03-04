import type { IDisposable, IMarker, ITerminalAddon, Terminal } from '@xterm/xterm'
import confetti from 'canvas-confetti'
import * as commas from 'commas:api/renderer'
import { clipboard, ipcRenderer } from 'electron'
import { nextTick } from 'vue'
import type { TerminalTab } from '../../../../src/typings/terminal'
import { useBadge } from './badge'
import { parseITerm2EscapeSequence } from './utils'

interface XtermBufferPosition {
  x: number,
  y: number,
}

interface XtermLink {
  uri: string,
  start: XtermBufferPosition,
  end?: XtermBufferPosition,
}

export class ITerm2Addon implements ITerminalAddon {

  tab: TerminalTab
  disposables: IDisposable[]
  links: XtermLink[]
  markMarkers: IMarker[]
  recentMarkMarker?: WeakRef<IMarker>
  highlightMarker?: IMarker

  constructor(tab: TerminalTab) {
    this.tab = tab
    this.disposables = []
    this.links = []
    this.markMarkers = []
  }

  activate(xterm: Terminal) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let badge = $(useBadge())
    // iTerm2 escape codes
    this.disposables.push(
      xterm.parser.registerOscHandler(1337, async data => {
        const sequence = parseITerm2EscapeSequence(data)
        switch (sequence.command) {
          case 'CursorShape':
            switch (sequence.positional) {
              case '0':
                xterm.options.cursorStyle = 'block'
                break
              case '1':
                xterm.options.cursorStyle = 'bar'
                break
              case '2':
                xterm.options.cursorStyle = 'underline'
                break
            }
            break
          case 'SetMark': {
            this.setMark()
            break
          }
          case 'StealFocus':
            ipcRenderer.invoke('activate-window')
            commas.workspace.activateTerminalTab(this.tab)
            break
          case 'ClearScrollback':
            xterm.clear()
            break
          case 'CurrentDir':
            this.tab.cwd = sequence.positional
            break
          case 'HighlightCursorLine': {
            switch (sequence.positional) {
              case 'yes':
                this._activateHighlight()
                break
              case 'no':
                this._deactivateHighlight()
                break
            }
            break
          }
          case 'RequestAttention':
            switch (sequence.positional) {
              case 'yes':
                ipcRenderer.invoke('bounce', {
                  active: true,
                  type: 'critical',
                })
                break
              case 'no':
                ipcRenderer.invoke('bounce', {
                  active: false,
                })
                break
              case 'once':
                ipcRenderer.invoke('bounce', {
                  active: true,
                  type: 'informational',
                })
                break
              case 'fireworks': {
                ipcRenderer.invoke('activate-window')
                commas.workspace.activateTerminalTab(this.tab)
                nextTick(() => {
                  const element = xterm.element!
                  const bounds = element.getBoundingClientRect()
                  const cell = xterm['_core']._renderService.dimensions.css.cell
                  const { cursorX, cursorY } = xterm.buffer.active
                  confetti({
                    spread: 360,
                    ticks: 100,
                    startVelocity: 30,
                    scalar: 3,
                    origin: {
                      x: (bounds.x + (cursorX + 0.5) * cell.width) / window.innerWidth,
                      y: (bounds.y + (cursorY + 0.5) * cell.height) / window.innerHeight,
                    },
                  })
                })
                break
              }
            }
            break
          case 'Copy':
            clipboard.writeText(sequence.body.toString())
            break
          case 'UnicodeVersion': {
            const version = parseInt(sequence.positional, 10)
            if (version <= 6) {
              xterm.unicode.activeVersion = '6'
            } else if (version >= 11) {
              xterm.unicode.activeVersion = '11'
            }
            break
          }
          case 'File':
            // Will be handled by `xterm-addon-image`
            return false
          case 'SetBadgeFormat': {
            badge = Buffer.from(sequence.positional, 'base64').toString()
            break
          }
        }
        return true
      }),
      // iTerm2 style notification
      xterm.parser.registerOscHandler(9, data => {
        ipcRenderer.invoke('notify', {
          title: commas.workspace.getTerminalTabTitle(this.tab),
          body: data,
        })
        return true
      }),
      xterm.onLineFeed(() => {
        if (this._deactivateHighlight()) {
          this._activateHighlight()
        }
      }),
    )
  }

  dispose() {
    const disposables = [
      ...this.disposables,
      ...this.markMarkers,
    ]
    disposables.forEach(disposable => {
      disposable.dispose()
    })
    this.disposables = []
    this.markMarkers = []
    this.recentMarkMarker = undefined
  }

  setMark() {
    const theme = commas.remote.useTheme()
    const rgba = commas.helper.toRGBA(theme.blue)
    const xterm = this.tab.xterm
    const marker = xterm.registerMarker()
    const decoration = xterm.registerDecoration({
      marker,
      overviewRulerOptions: {
        color: commas.helper.toCSSHEX({ ...rgba, a: 0.5 }),
        position: 'left',
      },
    })!
    this.markMarkers.push(marker)
    this.markMarkers.sort((a, b) => a.line - b.line)
    this.recentMarkMarker = undefined
    decoration.onRender(el => {
      el.classList.add('iterm2-mark')
      el.style.setProperty('--color', `${rgba.r} ${rgba.g} ${rgba.b}`)
    })
  }

  _activateHighlight() {
    const { xterm } = this.tab
    if (this.highlightMarker) return false
    this.highlightMarker = xterm.registerMarker()!
    const highlightDecoration = xterm.registerDecoration({
      marker: this.highlightMarker,
      width: xterm.cols,
    })!
    highlightDecoration.onRender(el => {
      el.classList.add('iterm2-cursor-highlight-line')
    })
    this.highlightMarker.onDispose(() => {
      highlightDecoration.dispose()
    })
  }

  _deactivateHighlight() {
    if (!this.highlightMarker) return false
    this.highlightMarker.dispose()
    this.highlightMarker = undefined
    return true
  }

  scrollToMark(offset: number) {
    if (!this.markMarkers.length) return
    const index = this.recentMarkMarker
      // @ts-expect-error also find undefined
      ? this.markMarkers.indexOf(this.recentMarkMarker.deref())
      : this.markMarkers.length
    let targetIndex = index + offset
    if (targetIndex < 0) {
      targetIndex = this.markMarkers.length - 1
    }
    if (targetIndex > this.markMarkers.length - 1) {
      targetIndex = 0
    }
    const targetMarker = this.markMarkers[targetIndex]
    if (targetMarker.isDisposed) {
      this.markMarkers.splice(targetIndex, 1)
      return this.scrollToMark(offset)
    }
    this.recentMarkMarker = new WeakRef(targetMarker)
    commas.workspace.scrollToMarker(this.tab.xterm, targetMarker)
  }

}

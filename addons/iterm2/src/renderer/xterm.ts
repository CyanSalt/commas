import * as commas from 'commas:api/renderer'
import { clipboard, ipcRenderer, shell } from 'electron'
import { findLast } from 'lodash-es'
import { nextTick } from 'vue'
import type { IDisposable, ITerminalAddon, Terminal } from 'xterm'
import type { TerminalTab, XtermBufferPosition, XtermLink } from '../../../../typings/terminal'
import { addFirework } from './fireworks'
import { calculateDOM, loadingElement, parseITerm2EscapeSequence } from './utils'

export class ITerm2Addon implements ITerminalAddon {

  tab: TerminalTab
  disposables: IDisposable[]

  constructor(tab: TerminalTab) {
    this.tab = tab
    this.disposables = []
  }

  activate(xterm: Terminal) {
    const settings = $(commas.remote.useSettings())
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
            // TODO: add jumping logics
            const marker = xterm.registerMarker()!
            const decoration = xterm.registerDecoration({
              marker,
              x: xterm.buffer.active.cursorX,
            })!
            const dimensions = xterm['_core']._renderService.dimensions
            decoration.onRender(() => {
              const el = decoration.element!
              el.style.setProperty('--width', `${dimensions.actualCellWidth}px`)
              el.style.setProperty('--height', `${dimensions.actualCellHeight}px`)
              el.classList.add('terminal-marker')
            })
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
                  const dimensions = xterm['_core']._renderService.dimensions
                  const { cursorX, cursorY } = xterm.buffer.active
                  addFirework({
                    x: bounds.x + (cursorX + 0.5) * dimensions.actualCellWidth,
                    y: bounds.y + (cursorY + 0.5) * dimensions.actualCellHeight,
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
          case 'File': {
            const blob = new Blob([sequence.body])
            const url = URL.createObjectURL(blob)
            const image = new Image()
            image.src = url
            await loadingElement(image)
            const dimensions = xterm['_core']._renderService.dimensions
            const getImageDimension = (
              targetImage: HTMLImageElement,
              fn: (el: HTMLImageElement, dimension: string) => number,
              value: string,
              scale: number,
            ) => {
              const numeric = Number(value)
              return isNaN(numeric)
                ? Math.ceil(calculateDOM(el => fn(el, value), targetImage) / scale)
                : numeric
            }
            const width = getImageDimension(image, (el, dimension) => {
              el.style.width = dimension
              return el.clientWidth
            }, sequence.args.width, dimensions.actualCellWidth)
            const height = getImageDimension(image, (el, dimension) => {
              el.style.height = dimension
              return el.clientHeight
            }, sequence.args.height, dimensions.actualCellHeight)
            const marker = xterm.registerMarker()!
            const decoration = xterm.registerDecoration({
              marker,
              width,
              height,
            })!
            xterm.write('\r\n'.repeat(height - 1))
            decoration.onRender(() => {
              decoration.element!.style.background = `url('${url}') no-repeat center/${sequence.args.preserveAspectRatio === '0' ? '100%' : 'contain'}`
            })
          }
        }
        return true
      }),
      // iTerm2 style link
      xterm.parser.registerOscHandler(8, data => {
        const args = data.split(';')
        if (args.length !== 2) return false
        const point: XtermBufferPosition = {
          x: xterm.buffer.active.cursorX + 1,
          y: xterm.buffer.active.cursorY + 1,
        }
        if (args[1]) {
          this.tab.links.push({ start: point, uri: args[1] })
        } else {
          const activeLink = findLast(this.tab.links, item => !item.end)
          if (activeLink) {
            point.x -= 1
            activeLink.end = point
          }
        }
        return true
      }),
      xterm.registerLinkProvider({
        provideLinks: (y, callback) => {
          const links = this.tab.links
            .filter((link): link is Required<XtermLink> => {
              return Boolean(link.end && link.start.y <= y && link.end.y >= y)
            })
            .map(link => ({
              range: {
                start: link.start,
                end: link.end,
              },
              text: xterm.buffer.active.getLine(y)!.translateToString(
                false,
                link.start.y < y ? undefined : link.start.x,
                link.end.y > y ? undefined : link.end.x,
              ),
              activate(event) {
                const shouldOpen = settings['terminal.link.modifier'] === 'Alt' ? event.altKey
                  : (process.platform === 'darwin' ? event.metaKey : event.ctrlKey)
                if (shouldOpen) {
                  shell.openExternal(link.uri)
                }
              },
            }))
          callback(links)
        },
      }),
      // iTerm2 style notification
      xterm.parser.registerOscHandler(9, data => {
        ipcRenderer.invoke('notify', {
          title: commas.workspace.getTerminalTabTitle(this.tab),
          body: data,
        })
        return true
      }),
    )
  }

  dispose() {
    this.disposables.forEach(disposable => {
      disposable.dispose()
    })
    this.disposables = []
  }

}

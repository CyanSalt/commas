import type { IDecoration, IDisposable, IMarker, ITerminalAddon, Terminal } from 'xterm'
import { toCSSHEX, toRGBA } from '../../shared/color'
import type { TerminalTab } from '../../typings/terminal'
import { useTheme } from '../compositions/theme'

interface IntegratedShellCommand {
  command?: string,
  exitCode?: number,
  marker: IMarker,
  decoration: IDecoration,
}

function updateDecorationElement(decoration: IDecoration, callback: (el: HTMLElement) => void) {
  if (decoration.element) {
    callback(decoration.element)
  } else {
    decoration.onRender(() => {
      callback(decoration.element!)
    })
  }
}

export class ShellIntegrationAddon implements ITerminalAddon {

  tab: TerminalTab
  disposables: IDisposable[]
  commands: IntegratedShellCommand[]
  currentCommand?: IntegratedShellCommand
  recentMarker?: WeakRef<IMarker>

  constructor(tab: TerminalTab) {
    this.tab = tab
    this.tab.idle = true
    this.disposables = []
    this.commands = []
  }

  activate(xterm: Terminal) {
    this.disposables.push(
      xterm.parser.registerOscHandler(633, data => {
        const [command, ...args] = data.split(';')
        switch (command) {
          case 'A':
            // PromptStart
            return true
          case 'B': {
            // CommandStart
            const marker = xterm.registerMarker()!
            const theme = useTheme()
            const decoration = this._createCommandDecoration(
              xterm,
              marker,
              theme.foreground,
              false,
            )
            if (this.currentCommand) {
              this.currentCommand.marker.dispose()
              this.currentCommand.marker = marker
              this.currentCommand.decoration = decoration
            } else {
              this.currentCommand = {
                marker,
                decoration,
              }
              this.commands.push(this.currentCommand)
              this.recentMarker = undefined
            }
            return true
          }
          case 'C':
            // CommandExecuted
            this.tab.idle = false
            return true
          case 'D':
            // CommandFinished
            this.tab.idle = true
            if (this.currentCommand) {
              const exitCode = args[0] ? Number(args[0]) : undefined
              if (typeof exitCode === 'number') {
                this.currentCommand.exitCode = exitCode
                if (!this.currentCommand.marker.isDisposed) {
                  const theme = useTheme()
                  const color = exitCode ? theme.red : theme.green
                  this.currentCommand.decoration.dispose()
                  this.currentCommand.decoration = this._createCommandDecoration(
                    xterm,
                    this.currentCommand.marker,
                    color,
                    true,
                  )
                }
              }
              this.currentCommand = undefined
            }
            return true
          case 'E':
            // CommandLine
            if (this.currentCommand) {
              const executedCommand = args[0]
              this.currentCommand.command = executedCommand
              if (!this.currentCommand.marker.isDisposed) {
                updateDecorationElement(this.currentCommand.decoration, el => {
                  el.dataset.command = executedCommand
                })
              }
            }
            return true
          case 'F':
            // ContinuationStart
            return true
          case 'G':
            // ContinuationEnd
            return true
          case 'H':
            // RightPromptStart
            return true
          case 'I':
            // RightPromptEnd
            return true
          case 'P':
            // Property
            for (const arg of args) {
              const [key, value] = arg.split('=')
              switch (key) {
                case 'Cwd':
                  this.tab.cwd = value
                  break
              }
            }
            return true
          default:
            return false
        }
      }),
    )
  }

  dispose() {
    delete this.tab.idle
    const disposables = [
      ...this.disposables,
      ...this.commands.map(command => command.marker),
    ]
    disposables.forEach(disposable => {
      disposable.dispose()
    })
    this.disposables = []
    this.commands = []
    this.recentMarker = undefined
  }

  _createCommandDecoration(xterm: Terminal, marker: IMarker, color: string, finished: boolean) {
    const rgba = toRGBA(color)
    const decoration = xterm.registerDecoration({
      marker,
      overviewRulerOptions: finished ? {
        color: toCSSHEX({ ...rgba, a: 0.5 }),
        position: 'right',
      } : undefined,
    })!
    const dimensions = xterm['_core']._renderService.dimensions
    decoration.onRender(() => {
      const el = decoration.element!
      el.style.setProperty('--cell-width', `${dimensions.actualCellWidth}px`)
      el.style.setProperty('--cell-height', `${dimensions.actualCellHeight}px`)
      el.style.setProperty('--color', `${rgba.r} ${rgba.g} ${rgba.b}`)
      el.style.setProperty('--opacity', finished ? '1' : '0.25')
      el.classList.add('terminal-command-mark')
    })
    return decoration
  }

  scrollToMarker(marker: IMarker) {
    const { xterm } = this.tab
    xterm.scrollLines(marker.line - xterm.buffer.active.viewportY)
    const decoration = xterm.registerDecoration({
      marker,
      width: xterm.cols,
    })!
    decoration.onRender(() => {
      const el = decoration.element!
      el.classList.add('terminal-marker-highlight-line')
      el.addEventListener('animationend', () => {
        decoration.dispose()
      })
    })
  }

  scrollToCommand(offset: number) {
    const markers = this.commands
      .map(item => item.marker)
      .filter(marker => !marker.isDisposed)
      .sort((a, b) => a.line - b.line)
    if (!markers.length) return
    const index = this.recentMarker
      // @ts-expect-error also find undefined
      ? markers.indexOf(this.recentMarker.deref())
      : markers.length
    let targetIndex = index + offset
    if (targetIndex < 0) {
      targetIndex = markers.length - 1
    }
    if (targetIndex > markers.length - 1) {
      targetIndex = 0
    }
    const targetMarker = markers[targetIndex]
    this.recentMarker = new WeakRef(targetMarker)
    this.scrollToMarker(targetMarker)
  }

}

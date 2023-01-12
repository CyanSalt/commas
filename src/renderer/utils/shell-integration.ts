import { ipcRenderer } from 'electron'
import { isEqual } from 'lodash'
import { toRaw } from 'vue'
import type { IDecoration, IDisposable, IMarker, ITerminalAddon, Terminal } from 'xterm'
import { toCSSHEX, toRGBA } from '../../shared/color'
import type { CommandCompletion, TerminalTab } from '../../typings/terminal'
import { useSettings } from '../compositions/settings'
import { scrollToMarker } from '../compositions/terminal'
import { useTheme } from '../compositions/theme'
import { openContextMenu } from './frame'

interface IntegratedShellCommandAction {
  command: string,
}

interface IntegratedShellCommand {
  command?: string,
  exitCode?: number,
  marker: IMarker,
  decoration: IDecoration,
  cursorX: number,
  actions?: IntegratedShellCommandAction[],
}

interface IntegratedShellCompletion {
  marker: IMarker,
  decoration: IDecoration,
  position: {
    x: number,
    y: number,
  },
}

function updateDecorationElement(decoration: IDecoration, callback: (el: HTMLElement) => void) {
  if (decoration.element) {
    callback(decoration.element)
  } else {
    const disposable = decoration.onRender(el => {
      callback(el)
      disposable.dispose()
    })
  }
}

export class ShellIntegrationAddon implements ITerminalAddon {

  tab: TerminalTab
  disposables: IDisposable[]
  commands: IntegratedShellCommand[]
  currentCommand?: IntegratedShellCommand
  recentMarker?: WeakRef<IMarker>
  completion?: IntegratedShellCompletion
  completionKey?: symbol

  constructor(tab: TerminalTab) {
    this.tab = tab
    this.tab.idle = true
    this.disposables = []
    this.commands = []
  }

  activate(xterm: Terminal) {
    const settings = useSettings()
    this.disposables.push(
      xterm.parser.registerOscHandler(633, data => {
        const [command, ...args] = data.split(';')
        switch (command) {
          case 'A':
            // PromptStart
            return true
          case 'B': {
            // PromptEnd
            const marker = xterm.registerMarker()!
            const actions = this.currentCommand
              ? this.currentCommand.actions
              : this._generateQuickFixActions(marker)
            const theme = useTheme()
            const decoration = this._createCommandDecoration(
              xterm,
              marker,
              actions ? theme.yellow : theme.foreground,
              { actions },
            )
            if (this.currentCommand) {
              this.currentCommand.marker.dispose()
              this.currentCommand.marker = marker
              this.currentCommand.decoration = decoration
            } else {
              this.currentCommand = {
                marker,
                decoration,
                cursorX: xterm.buffer.active.cursorX,
                actions,
              }
              this.commands.push(this.currentCommand)
              this.recentMarker = undefined
            }
            return true
          }
          case 'C':
            // OutputStart
            this.tab.idle = false
            return true
          case 'D':
            // CommandComplete
            this.tab.idle = true
            if (this.currentCommand) {
              const exitCode = args[0] ? Number(args[0]) : undefined
              if (typeof exitCode === 'number' && exitCode < 128) {
                this.currentCommand.exitCode = exitCode
                if (!this.currentCommand.marker.isDisposed) {
                  const theme = useTheme()
                  this.currentCommand.decoration.dispose()
                  this.currentCommand.decoration = this._createCommandDecoration(
                    xterm,
                    this.currentCommand.marker,
                    exitCode ? theme.red : theme.green,
                    {
                      isFinished: true,
                    },
                  )
                  if (exitCode && settings['terminal.shell.highlightErrors']) {
                    this._createHighlightDecoration(
                      xterm,
                      this.currentCommand.marker,
                      theme.red,
                      xterm.buffer.active.baseY + xterm.buffer.active.cursorY - this.currentCommand.marker.line,
                    )
                  }
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
      xterm.onCursorMove(() => {
        this.clearCompletion()
        if (settings['terminal.shell.autoCompletion']) {
          this.triggerCompletion(true)
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

  _createCommandDecoration(
    xterm: Terminal,
    marker: IMarker,
    color: string,
    extra: { actions?: IntegratedShellCommandAction[], isFinished?: boolean },
  ) {
    const { actions, isFinished } = extra
    const rgba = toRGBA(color)
    const decoration = xterm.registerDecoration({
      marker,
      overviewRulerOptions: isFinished ? {
        color: toCSSHEX({ ...rgba, a: 0.5 }),
        position: 'right',
      } : undefined,
    })!
    updateDecorationElement(decoration, el => {
      el.style.setProperty('--color', `${rgba.r} ${rgba.g} ${rgba.b}`)
      el.style.setProperty('--opacity', isFinished || actions ? '1' : '0.25')
      el.classList.add('terminal-command-mark')
      if (actions) {
        el.classList.add('is-interactive')
        el.addEventListener('click', event => {
          openContextMenu(actions.map(action => ({
            label: action.command,
            command: 'execute-command',
            args: [action.command],
          })), event)
        })
      }
    })
    return decoration
  }

  _createHighlightDecoration(
    xterm: Terminal,
    marker: IMarker,
    color: string,
    height: number,
  ) {
    const rgba = toRGBA(color)
    const decoration = xterm.registerDecoration({
      marker,
      width: xterm.cols,
      height,
    })!
    decoration.onRender(el => {
      el.style.setProperty('--color', `${rgba.r} ${rgba.g} ${rgba.b}`)
      el.classList.add('terminal-highlight-block')
    })
    return decoration
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
    scrollToMarker(this.tab.xterm, targetMarker)
  }

  _getQuickFixActionsByOutput(command: string, output: string) {
    // Git push for upstream
    const gitUpstreamMatches = output.match(/git push --set-upstream origin (\S+)/)
    if (gitUpstreamMatches && /\bgit\b/.test(command)) {
      return [{ command: gitUpstreamMatches[0] }]
    }
    // Free port
    const portMatches = output.match(/address already in use (?:0\.0\.0\.0|127\.0\.0\.1|localhost|::):(\d{4,5})|Unable to bind \S*:(\d{4,5})|can't listen on port (\d{4,5})|listen EADDRINUSE \S*:(\d{4,5})/)
    if (portMatches) {
      return [{ command: `commas free ${portMatches[1]}` }]
    }
    // Git style recommendations
    const gitMessages = [
      'most similar command is',
      'most similar commands are',
      '最相似的命令是',
    ]
    const gitMatches = output.match(new RegExp(`(?:${gitMessages.join('|')})((?:\\n\\s*\\S+)+)`))
    if (gitMatches) {
      const name = output.match(/^[^\s:]+(?=:|\uff1a)/)?.[0] ?? 'git'
      const subcommands = gitMatches[1].split('\n').map(line => line.trim()).filter(Boolean)
      const actions = subcommands.map(subcommand => {
        return { command: `${name} ${subcommand}` }
      })
      return actions
    }
    // NPM style recommendations
    const npmMatches = output.match(/Did you mean (?:this|one of these)\?((?:\n\s*.+)+)(?=\n+[A-Z])/)
    if (npmMatches) {
      const commands = npmMatches[1].split('\n').map(line => {
        const subcommand = line.trim()
        const index = subcommand.indexOf(' # ')
        return index === -1 ? subcommand : subcommand.slice(0, index)
      }).filter(Boolean)
      const actions = commands.map(subcommand => {
        return { command: `${subcommand}` }
      })
      return actions
    }
  }

  _generateQuickFixActions(marker: IMarker) {
    const { xterm } = this.tab
    const lastCommand = this.commands.length
      ? this.commands[this.commands.length - 1]
      : undefined
    if (lastCommand?.command && lastCommand.exitCode) {
      const lastCommandLine = lastCommand.marker.line
      let lastOutput = ''
      // TODO: use actual command start
      for (let line = lastCommandLine + 1; line < marker.line; line += 1) {
        const bufferLine = xterm.buffer.active.getLine(line)
        if (bufferLine) {
          lastOutput += (bufferLine.isWrapped || !lastOutput ? '' : '\n')
            + bufferLine.translateToString(true)
        }
      }
      return this._getQuickFixActionsByOutput(lastCommand.command, lastOutput)
    }
  }

  getQuickFixActions() {
    return this.currentCommand?.actions
  }

  triggerQuickFixMenu() {
    if (!this.currentCommand?.actions) return
    const el = this.currentCommand.decoration.element
    if (!el) return
    const rect = el.getBoundingClientRect()
    const event = new MouseEvent('click', {
      clientX: rect.left,
      clientY: rect.top,
    })
    el.dispatchEvent(event)
  }

  async _getCompletions(input: string | undefined) {
    if (!input) return []
    return ipcRenderer.invoke('get-completions', input, this.tab.cwd) as Promise<CommandCompletion[]>
  }

  _createCompletionDecoration(height: number): IntegratedShellCompletion {
    const { xterm } = this.tab
    const marker = xterm.registerMarker()!
    const decoration = xterm.registerDecoration({
      marker,
      width: Math.floor(xterm.cols / 2),
      height: Math.min(height, Math.floor(xterm.rows / 2)),
    })!
    let renderedCompletions: CommandCompletion[] | undefined
    decoration.onRender(el => {
      const renderingCompletions = toRaw(this.tab.completions)
      if (renderingCompletions === renderedCompletions) return
      renderedCompletions = renderingCompletions
      el.classList.add('terminal-completion')
      el.classList.add(xterm.buffer.active.cursorY < xterm.rows / 2 ? 'is-bottom' : 'is-top')
      el.classList.add(xterm.buffer.active.cursorX < xterm.cols / 2 ? 'is-left' : 'is-right')
      el.style.setProperty('--column', `${xterm.buffer.active.cursorX}`)
      const source = document.getElementById('terminal-completion-source')
      if (source) {
        el.replaceChildren(...[...source.children].map(node => node.cloneNode(true)))
      }
    })
    return {
      marker,
      decoration,
      position: this._getCurrentPosition(),
    }
  }

  _getCurrentPosition() {
    const { xterm } = this.tab
    return {
      x: xterm.buffer.active.cursorX,
      y: xterm.buffer.active.baseY + xterm.buffer.active.cursorY,
    }
  }

  async triggerCompletion(autofocus?: boolean) {
    if (this.completion) {
      if (isEqual(this.completion.position, this._getCurrentPosition())) {
        if (autofocus) {
          this.activateCompletion()
        }
        return
      } else {
        this.clearCompletion()
      }
    }
    const { xterm } = this.tab
    const activeBuffer = xterm.buffer.active
    let line: string | undefined
    if (
      this.currentCommand && !this.currentCommand.command
      && activeBuffer.baseY + activeBuffer.cursorY === this.currentCommand.marker.line
      && activeBuffer.cursorX > this.currentCommand.cursorX
    ) {
      line = xterm.buffer.active.getLine(this.currentCommand.marker.line)
        ?.translateToString(true, this.currentCommand.cursorX, activeBuffer.cursorX)
    }
    const key = Symbol('COMPLETION_SESSION')
    this.completionKey = key
    const completions = await this._getCompletions(line)
    if (!completions.length) return
    if (this.completionKey === key) {
      const result = this._createCompletionDecoration(completions.length)
      this.completion = result
      this.tab.completions = completions
      if (autofocus) {
        this.activateCompletion()
      }
    }
  }

  async clearCompletion() {
    const completion = this.completion
    if (completion) {
      completion.marker.dispose()
      this.completion = undefined
    }
  }

  activateCompletion() {
    const completion = this.completion
    if (completion) {
      updateDecorationElement(completion.decoration, el => {
        const item = el.querySelector<HTMLElement>('.terminal-completion-item')
        if (item) {
          item.focus()
        }
      })
    }
  }

}

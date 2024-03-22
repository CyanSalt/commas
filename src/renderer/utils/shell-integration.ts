import type { IDecoration, IDisposable, IMarker, ITerminalAddon, Terminal } from '@xterm/xterm'
import { ipcRenderer } from 'electron'
import fuzzaldrin from 'fuzzaldrin-plus'
import { isEqual } from 'lodash'
import { nextTick, reactive, toRaw } from 'vue'
import { toCSSHEX, toRGBA } from '../../shared/color'
import type { MenuItem } from '../../typings/menu'
import type { CommandCompletion, TerminalTab } from '../../typings/terminal'
import { useSettings } from '../compositions/settings'
import { scrollToMarker } from '../compositions/terminal'
import { useTheme } from '../compositions/theme'
import { openContextMenu } from './frame'
import { translate } from './i18n'
import { getReadableSignal } from './terminal'

interface IntegratedShellCommandAction {
  command: string,
}

interface IntegratedShellCommand {
  command?: string,
  exitCode?: number,
  marker: IMarker,
  decoration: IDecoration,
  commandStartX: number,
  commandStartY: number,
  outputStartY: number,
  startedAt?: Date,
  endedAt?: Date,
  actions?: IntegratedShellCommandAction[],
}

interface IntegratedShellPosition {
  x: number,
  y: number,
}

interface IntegratedShellCompletion {
  marker: IMarker,
  decoration: IDecoration,
  renderer: IDisposable,
  position: IntegratedShellPosition,
}

interface RenderableIntegratedShellCompletion {
  items: CommandCompletion[],
  index: number,
  element?: HTMLElement,
  mounted: Map<CommandCompletion['value'], HTMLElement>,
}

interface RenderableIntegratedStickyCommand {
  rows: number,
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

function filterAndSortCompletions(completions: CommandCompletion[]) {
  const duplicatedTimes: (Pick<CommandCompletion, 'value' | 'query'> & { times: number })[] = []
  const deduplicatedCompletions: CommandCompletion[] = []
  for (const completion of completions) {
    const isPassthrough = completion.value === completion.query
    const existingIndex = deduplicatedCompletions.findIndex(item => {
      return isPassthrough
        ? item.value === item.query
        : item.value === completion.value && item.query === completion.query
    })
    if (existingIndex === -1) {
      deduplicatedCompletions.push(completion)
    } else {
      const duplicatedTimesItem = duplicatedTimes.find(item => {
        return item.value === completion.value
          && item.query === completion.query
      })
      if (duplicatedTimesItem) {
        duplicatedTimesItem.times += 1
      } else {
        duplicatedTimes.push({
          value: completion.value,
          query: completion.query,
          times: 2,
        })
      }
      const existingItem = deduplicatedCompletions[existingIndex]
      const replacement: CommandCompletion = {
        ...existingItem,
        type: 'default',
        description: existingItem.description || completion.description,
      }
      deduplicatedCompletions.splice(existingIndex, 1, replacement)
    }
  }
  const sortedCompletions = deduplicatedCompletions
    .map(item => {
      const duplicatedTimesItem = duplicatedTimes.find(record => {
        return record.value === item.value
          && record.query === item.query
      })
      const scale = duplicatedTimesItem ? duplicatedTimesItem.times : 1
      let score: number
      if (item.value === item.query) {
        score = Infinity
      } else if (item.query) {
        score = fuzzaldrin.score(item.value, item.query)
      } else {
        score = 1
      }
      return [item, score * scale] as const
    })
    .filter(([item, score]) => score > 0)
    .sort(([itemA, scoreA], [itemB, scoreB]) => scoreB - scoreA)
    .map(([item]) => item)
  // Always make history second at most
  if (sortedCompletions.length && sortedCompletions[0].type === 'history') {
    sortedCompletions.unshift({
      type: 'recommendation',
      query: '',
      value: '',
    })
  }
  return sortedCompletions
}

export class ShellIntegrationAddon implements ITerminalAddon {

  tab: TerminalTab
  disposables: IDisposable[]
  commands: IntegratedShellCommand[]
  currentCommand?: IntegratedShellCommand
  recentMarker?: WeakRef<IMarker>
  highlightMarkers: IMarker[]
  completion?: IntegratedShellCompletion
  completionKey?: symbol
  recentCompletionAppliedPosition?: true | IntegratedShellCompletion['position']
  renderableCompletion: RenderableIntegratedShellCompletion
  stickyMarker?: WeakRef<IMarker>
  renderableStickyCommand: RenderableIntegratedStickyCommand

  constructor(tab: TerminalTab) {
    this.tab = tab
    this.tab.idle = true
    this.disposables = []
    this.commands = []
    this.highlightMarkers = []
    this.renderableCompletion = reactive({
      items: [],
      index: 0,
      mounted: new Map(),
    })
    this.renderableStickyCommand = reactive({
      rows: 0,
    })
  }

  activate(xterm: Terminal) {
    const settings = useSettings()
    this.disposables.push(
      xterm.parser.registerOscHandler(633, data => {
        const [command, ...args] = data.split(';')
        switch (command) {
          case 'A': {
            // PromptStart
            const marker = this._createCompletionMarker(xterm)
            const actions = this.currentCommand
              ? this.currentCommand.actions
              : this._generateQuickFixActions(marker)
            const theme = useTheme()
            let currentCommand = this.currentCommand
            const decoration = this._createCommandDecoration(
              xterm,
              marker,
              actions ? theme.yellow : theme.foreground,
              actions ? 'strong' : undefined,
            )
            if (this.currentCommand) {
              this.currentCommand.marker.dispose()
              this.currentCommand.marker = marker
              this.currentCommand.decoration = decoration
            } else {
              this.tab.command = ''
              const position = this._getCurrentPosition()
              currentCommand = {
                marker,
                decoration,
                commandStartX: position.x,
                commandStartY: position.y,
                outputStartY: position.y + 1,
                actions,
              }
              this.commands.push(currentCommand)
              this.currentCommand = currentCommand
              this.recentMarker = undefined
            }
            return true
          }
          case 'B': {
            // PromptEnd
            ipcRenderer.send('terminal-prompt-end')
            if (this.currentCommand) {
              const position = this._getCurrentPosition()
              this.currentCommand.commandStartX = position.x
              this.currentCommand.commandStartY = position.y
            }
            return true
          }
          case 'C':
            // OutputStart
            this.tab.idle = false
            if (this.currentCommand) {
              this.currentCommand.outputStartY = xterm.buffer.active.cursorY
              this.currentCommand.startedAt = new Date()
            }
            return true
          case 'D':
            // CommandComplete
            this.tab.idle = true
            if (this.currentCommand) {
              this.currentCommand.endedAt = new Date()
              const exitCode = args[0] ? Number(args[0]) : undefined
              if (typeof exitCode === 'number') {
                this.currentCommand.exitCode = exitCode
                if (!this.currentCommand.marker.isDisposed) {
                  const theme = useTheme()
                  this.currentCommand.decoration.dispose()
                  const shouldHighlight = exitCode > 0 && exitCode < 128 && settings['terminal.shell.highlightErrors']
                  if (shouldHighlight) {
                    this._createHighlightDecoration(
                      xterm,
                      this.currentCommand.marker.line,
                      xterm.buffer.active.baseY + xterm.buffer.active.cursorY - 1,
                      theme.red,
                    )
                  }
                  const currentCommand = this.currentCommand
                  this.currentCommand.decoration = this._createCommandDecoration(
                    xterm,
                    currentCommand.marker,
                    exitCode > 0 ? theme.red : theme.green,
                    shouldHighlight ? 'stroked' : 'strong',
                    currentCommand,
                  )
                }
              }
              this.tab.command = ''
              this.currentCommand = undefined
            }
            return true
          case 'E':
            // CommandLine
            if (this.currentCommand) {
              const executedCommand = args[0]
              this.tab.command = executedCommand
              this.currentCommand.command = executedCommand
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
        if (settings['terminal.shell.autoCompletion']) {
          this.triggerCompletion()
        } else {
          this.clearCompletion()
        }
      }),
    )
    this.tab.deferred.open.promise.then(() => {
      this.disposables.push(
        xterm['_core'].viewport.onRequestScrollLines(() => {
          this._renderStickyLines()
        }),
      )
    })
  }

  dispose() {
    delete this.tab.idle
    const disposables = [
      ...this.disposables,
      ...this.commands.map(command => command.marker),
      ...this.highlightMarkers,
    ]
    disposables.forEach(disposable => {
      disposable.dispose()
    })
    this.disposables = []
    this.commands = []
    this.recentMarker = undefined
    this.clearCompletion()
    this.recentCompletionAppliedPosition = undefined
  }

  _getSortedCommands() {
    return this.commands
      .filter(item => !item.marker.isDisposed)
      .sort((a, b) => a.marker.line - b.marker.line)
  }

  _renderStickyLines() {
    const stickyXterm = this.tab.stickyXterm
    if (!stickyXterm) return
    const sortedCommands = this._getSortedCommands()
    if (!sortedCommands.length) return
    const viewportY = this.tab.xterm.buffer.active.viewportY
    const target = sortedCommands.findLast(command => command.marker.line <= viewportY)
    if (!target || target.marker.line === viewportY) {
      this.renderableStickyCommand.rows = 0
      this.stickyMarker = undefined
      return
    }
    if (this.stickyMarker && target.marker === this.stickyMarker.deref()) return
    const range = {
      start: target.marker.line,
      end: target.outputStartY - 1,
    }
    stickyXterm.reset()
    stickyXterm.write(this.tab.addons.serialize.serialize({ range }))
    stickyXterm.scrollToTop()
    this.renderableStickyCommand.rows = range.end - range.start + 1
    this.stickyMarker = new WeakRef(target.marker)
  }

  _createCompletionMarker(xterm: Terminal) {
    const marker = xterm.registerMarker()
    marker.onDispose(() => {
      const index = this.commands.findIndex(item => item.marker === marker)
      if (index !== -1) {
        this.commands.splice(index, 1)
      }
    })
    return marker
  }

  _createCommandMenu(command: IntegratedShellCommand) {
    const menu: MenuItem[] = []
    if (command.exitCode) {
      const signal = getReadableSignal(command.exitCode)
      menu.push({
        label: translate('Exit Code: ${code}#!terminal.7', {
          code: `${command.exitCode}${signal ? ` (${signal})` : ''}`,
        }),
        enabled: false,
      })
    }
    const timeFormat = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    if (command.startedAt) {
      const startedAt = timeFormat.format(command.startedAt)
      menu.push({
        label: translate('Started At: ${time}#!terminal.8', {
          time: startedAt,
        }),
        enabled: false,
      })
    }
    if (command.startedAt && command.endedAt) {
      const duration = command.endedAt.getTime() - command.startedAt.getTime()
      menu.push({
        label: translate('Time taken: ${duration}#!terminal.9', {
          duration: duration > 1000 ? `${duration / 1000}s` : `${duration}ms`,
        }),
        enabled: false,
      })
    }
    if (command.command) {
      if (menu.length) {
        menu.push({ type: 'separator' })
      }
      menu.push(
        {
          label: translate('Rerun Command#!terminal.10'),
          command: 'execute-terminal',
          args: [command.command, true],
        },
        {
          label: translate('Copy Command#!terminal.11'),
          command: 'copy',
          args: [command.command],
        },
      )
    }
    return menu
  }

  _createCommandDecoration(
    xterm: Terminal,
    marker: IMarker,
    color: string,
    style?: 'strong' | 'stroked' | undefined,
    command?: IntegratedShellCommand,
  ) {
    const rgba = toRGBA(color)
    const decoration = xterm.registerDecoration({
      marker,
      overviewRulerOptions: style === 'strong' ? {
        color: toCSSHEX({ ...rgba, a: 0.5 }),
        position: 'right',
      } : undefined,
    })!
    updateDecorationElement(decoration, el => {
      el.style.setProperty('--color', `${rgba.r} ${rgba.g} ${rgba.b}`)
      el.style.setProperty('--opacity', style ? '1' : '0.25')
      el.classList.add('terminal-command-mark')
      if (style === 'stroked') {
        el.classList.add('is-stroked')
      }
      if (command) {
        el.classList.add('is-interactive')
        el.addEventListener('click', event => {
          openContextMenu(this._createCommandMenu(command), event)
        })
      }
    })
    return decoration
  }

  _createHighlightMarker(xterm: Terminal, offset: number) {
    const marker = xterm.registerMarker(offset)
    marker.onDispose(() => {
      const index = this.highlightMarkers.indexOf(marker)
      if (index !== -1) {
        this.highlightMarkers.splice(index, 1)
      }
    })
    return marker
  }

  _createHighlightDecoration(
    xterm: Terminal,
    from: number,
    to: number,
    color: string,
  ) {
    const line = xterm.buffer.active.baseY + xterm.buffer.active.cursorY
    const rgba = toRGBA(color)
    for (let offset = from - line; offset <= to - line; offset += 1) {
      const highlightMarker = this._createHighlightMarker(xterm, offset)
      const decoration = xterm.registerDecoration({
        marker: highlightMarker,
        width: xterm.cols,
        height: 1,
        layer: 'bottom',
        overviewRulerOptions: offset === from - line ? {
          color: toCSSHEX({ ...rgba, a: 0.5 }),
          position: 'right',
        } : undefined,
      })!
      decoration.onRender(el => {
        el.style.setProperty('--color', `${rgba.r} ${rgba.g} ${rgba.b}`)
        el.classList.add('terminal-highlight-block')
      })
      this.highlightMarkers.push(highlightMarker)
    }
  }

  scrollToCommand(offset: number) {
    const markers = this._getSortedCommands()
      .map(item => item.marker)
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
      const lastCommandLine = lastCommand.outputStartY
      let lastOutput = ''
      for (let line = lastCommandLine; line < marker.line; line += 1) {
        const bufferLine = xterm.buffer.active.getLine(line)
        if (bufferLine) {
          lastOutput += (bufferLine.isWrapped || !lastOutput ? '' : '\n')
            + bufferLine.translateToString(true)
        }
      }
      return this._getQuickFixActionsByOutput(lastCommand.command, lastOutput)
    }
  }

  _createCompletionDecoration(
    height: number,
    reusingCompletion?: IntegratedShellCompletion,
  ): IntegratedShellCompletion {
    const { xterm } = this.tab
    let marker: IMarker
    let decoration: IDecoration
    if (reusingCompletion) {
      marker = reusingCompletion.marker
      decoration = reusingCompletion.decoration
    } else {
      marker = xterm.registerMarker()
      decoration = xterm.registerDecoration({
        marker,
        width: Math.floor(xterm.cols / 2),
        height: Math.floor(xterm.rows / 2),
      })!
    }
    if (reusingCompletion) {
      reusingCompletion.renderer.dispose()
    }
    let renderedCompletions: CommandCompletion[] | undefined
    const renderer = decoration.onRender(el => {
      const renderingCompletions = toRaw(this.renderableCompletion.items)
      if (renderingCompletions === renderedCompletions) return
      renderedCompletions = renderingCompletions
      el.classList.add('terminal-completion')
      el.classList.add(xterm.buffer.active.cursorY < xterm.rows / 2 ? 'is-bottom' : 'is-top')
      el.classList.add(xterm.buffer.active.cursorX < xterm.cols / 2 ? 'is-left' : 'is-right')
      el.style.setProperty('--column', `${xterm.buffer.active.cursorX}`)
      el.style.setProperty('--row-span', `${height}`)
      this.renderableCompletion.element = el
    })
    return Object.assign(reusingCompletion ?? {}, {
      marker,
      decoration,
      renderer,
      position: this._getCurrentPosition(),
    })
  }

  _getCurrentPosition(): IntegratedShellPosition {
    const { xterm } = this.tab
    return {
      x: xterm.buffer.active.cursorX,
      y: xterm.buffer.active.baseY + xterm.buffer.active.cursorY,
    }
  }

  _getCurrentCommandInput(position: IntegratedShellPosition) {
    const { xterm } = this.tab
    if (!this.currentCommand || this.currentCommand.command) return ''
    const commandStartX = this.currentCommand.commandStartX
    const commandLine = Math.max(this.currentCommand.commandStartY, 0)
    if (
      position.y > commandLine
      || position.y === commandLine && position.x >= commandStartX
    ) {
      const rowspan = position.y - commandLine + 1
      return Array.from(
        { length: rowspan },
        (_, index) => {
          const trimRight = rowspan <= 1 || index !== rowspan - 1
          const startColumn = index === 0 ? commandStartX : 0
          const endColumn = index === rowspan - 1 ? position.x : undefined
          return xterm.buffer.active.getLine(commandLine + index)
            ?.translateToString(trimRight, startColumn, endColumn)
            ?? ''
        },
      ).join('')
    }
    return ''
  }

  async _getRealtimeCompletions(input: string) {
    if (!input) return []
    return ipcRenderer.invoke('get-completions', input, this.tab.cwd) as Promise<CommandCompletion[]>
  }

  async _getCompletions(input: string) {
    let completions: CommandCompletion[] = []
    if (this.currentCommand?.actions) {
      const actionCompletions: CommandCompletion[] = this.currentCommand.actions.map(action => ({
        type: 'recommendation',
        query: input,
        value: action.command,
      }))
      completions = completions.concat(actionCompletions)
    }
    const realtimeCompletions = await this._getRealtimeCompletions(input)
    completions = completions.concat(realtimeCompletions)
    return filterAndSortCompletions(completions)
  }

  async triggerCompletion() {
    const currentPosition = this._getCurrentPosition()
    const input = this._getCurrentCommandInput(currentPosition)
    let shouldReuseDecoration = false
    if (this.completion) {
      if (isEqual(this.completion.position, currentPosition)) {
        return
      } else if (this.completion.marker.line === currentPosition.y) {
        shouldReuseDecoration = true
      } else {
        this.clearCompletion()
      }
    }
    const key = Symbol('COMPLETION_SESSION')
    this.completionKey = key
    const completions = await this._getCompletions(input)
    if (!completions.length) {
      if (shouldReuseDecoration) {
        this.clearCompletion()
      }
      return
    }
    if (
      this.recentCompletionAppliedPosition === true || (
        isEqual(this.recentCompletionAppliedPosition, currentPosition)
        && completions.some(item => item.query && item.value === item.query)
      )
    ) {
      this.recentCompletionAppliedPosition = undefined
      if (shouldReuseDecoration) {
        this.clearCompletion()
      }
      return
    }
    if (this.completionKey === key) {
      const result = this._createCompletionDecoration(
        completions.length,
        shouldReuseDecoration ? this.completion : undefined,
      )
      this.completion = result
      this.renderableCompletion.items = completions
      this.renderableCompletion.index = 0
      // Refresh immediately
      if (shouldReuseDecoration && result.decoration.element) {
        await nextTick()
        result.decoration['onRenderEmitter'].fire(result.decoration.element)
      }
    }
  }

  clearCompletion() {
    this.completionKey = undefined
    const completion = this.completion
    if (completion) {
      completion.marker.dispose()
      // FIXME: I don't know why
      if (!completion.decoration.isDisposed) {
        completion.decoration.dispose()
        this.tab.xterm['_core']._decorationService._onDecorationRemoved.fire(completion.decoration)
      }
      this.completion = undefined
    }
  }

  _applyCompletion(value: string, back = 0) {
    const { xterm } = this.tab
    const position = this._getCurrentPosition()
    const input = this._getCurrentCommandInput(position)
    position.x += value.length - back
    while (position.x > xterm.cols) {
      position.x -= xterm.cols
    }
    this.skipCompletion(position)
    this.tab.xterm.input('\x7F'.repeat(back))
    this.tab.xterm.paste(value)
    // Preload completions
    this._getRealtimeCompletions(input.slice(0, -back) + value + ' ')
  }

  skipCompletion(position?: IntegratedShellCompletion['position']) {
    this.recentCompletionAppliedPosition = position ?? true
  }

  applyCompletion(index: number, isEnterPressing?: boolean) {
    const item = this.renderableCompletion.items[index]
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (item) {
      const back = item.query.length
      if (isEnterPressing && item.value.length === back) return false
      this._applyCompletion(item.value, back)
      return true
    }
    return false
  }

  applySelectedCompletion(isEnterPressing?: boolean) {
    return this.applyCompletion(this.renderableCompletion.index, isEnterPressing)
  }

  selectCompletion(index: number) {
    const item = this.renderableCompletion.items[index]
    // FIXME: may not be found since using virtual scrolling
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (item && this.renderableCompletion.mounted.has(item.value)) {
      const element = this.renderableCompletion.mounted.get(item.value)!
      element.scrollIntoView({ block: 'nearest' })
      // Select only if element found
      this.renderableCompletion.index = index
    }
  }

  selectPreviousCompletion() {
    const target = this.renderableCompletion.index === 0
      ? this.renderableCompletion.items.length - 1
      : this.renderableCompletion.index - 1
    this.selectCompletion(target)
  }

  selectNextCompletion() {
    const target = this.renderableCompletion.index === this.renderableCompletion.items.length - 1
      ? 0
      : this.renderableCompletion.index + 1
    this.selectCompletion(target)
  }

  scrollToStickyCommand() {
    const stickyMarker = this.stickyMarker?.deref()
    if (stickyMarker) {
      scrollToMarker(this.tab.xterm, stickyMarker)
    }
  }

  handleCustomKeyEvent(event: KeyboardEvent): boolean | void {
    if (this.completion) {
      switch (event.key) {
        case 'Enter':
        case 'Tab':
          event.preventDefault()
          if (event.type === 'keydown') {
            return !this.applySelectedCompletion(event.key === 'Enter')
          }
          return false
        case 'Escape':
          if (event.type === 'keydown') {
            this.clearCompletion()
          }
          return false
        case 'ArrowUp':
          if (event.type === 'keydown') {
            this.selectPreviousCompletion()
          }
          return false
        case 'ArrowDown':
          if (event.type === 'keydown') {
            this.selectNextCompletion()
          }
          return false
      }
    } else {
      if (['ArrowUp', 'ArrowDown'].includes(event.key) && event.type === 'keydown') {
        this.skipCompletion()
        return true
      }
    }
  }

}

import { ipcRenderer } from 'electron'
import { unref, watch } from 'vue'
import { Terminal } from 'xterm'
import type { TerminalTab } from '../../../typings/terminal'
import { loadTerminalAddons, useTerminalOptions } from '../../hooks/terminal'

export function initializeShellTerminal(tab: TerminalTab) {
  const terminalOptionsRef = useTerminalOptions()
  const xterm = new Terminal(unref(terminalOptionsRef))
  const context = {
    buffer: '',
    feed: '',
  }
  xterm.onData(data => {
    context.buffer += data
    xterm.write(data)
  })
  xterm.attachCustomKeyEventHandler(event => {
    if (event.type !== 'keydown') {
      return true
    }
    if (event.key === 'Backspace') {
      if (context.buffer.length) {
        context.buffer = context.buffer.slice(0, -1)
        xterm.write('\b \b')
      }
      return false
    }
    if (event.key === 'Enter') {
      context.feed = 'enter'
      xterm.write('\r\n')
      return false
    }
    if (event.key === 'ArrowUp') {
      // TODO
      return false
    }
    if (event.key === 'ArrowDown') {
      // TODO
      return false
    }
    if (event.key === 'c' && event.ctrlKey) {
      context.feed = 'cancel'
      xterm.write('\r\n')
      return false
    }
    return true
  })
  xterm.onTitleChange(title => {
    tab.title = title
  })
  xterm.onLineFeed(async () => {
    if (!context.feed) return
    const { buffer, feed } = context
    context.buffer = ''
    context.feed = ''
    if (feed === 'enter') {
      const lines = buffer.trim().split(/;|[\r\n]+/).filter(Boolean)
      for (const line of lines) {
        const output = await ipcRenderer.invoke('execute-shell-command', line.trim())
        if (output.code) {
          xterm.writeln(output.stderr)
        } else if (output.stdout) {
          xterm.writeln(output.stdout)
        }
      }
    }
    xterm.write('> ')
  })
  watch(terminalOptionsRef, (terminalOptions) => {
    const latestXterm = tab.xterm
    for (const [key, value] of Object.entries(terminalOptions)) {
      latestXterm.setOption(key, value)
    }
    loadTerminalAddons(tab)
  })
  xterm.write('> ')
  tab.addons = {}
  tab.xterm = xterm
}

import type { IDisposable, ITerminalAddon, Terminal } from 'xterm'
import type { TerminalTab } from '../../typings/terminal'

export class ShellIntegrationAddon implements ITerminalAddon {

  tab: TerminalTab
  disposables: IDisposable[]

  constructor(tab: TerminalTab) {
    this.tab = tab
    this.disposables = []
  }

  activate(xterm: Terminal) {
    this.disposables.push(
      xterm.parser.registerOscHandler(633, data => {
        const [command, ...args] = data.split(';')
        switch (command) {
          case 'A':
            // PromptStart
            return true
          case 'B':
            // CommandStart
            return true
          case 'C':
            // CommandExecuted
            return true
          case 'D':
            // CommandFinished
            return true
          case 'E':
            // CommandLine
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
    this.disposables.forEach(disposable => {
      disposable.dispose()
    })
    this.disposables = []
  }

}

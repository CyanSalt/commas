import {spawn} from 'node-pty'
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as ligatures from 'xterm-addon-ligatures'
import {remote} from 'electron'

Terminal.applyAddon(fit)
Terminal.applyAddon(ligatures)

const variables = {
  LANG: remote.app.getLocale().replace('-', '_') + '.UTF-8',
  TERM_PROGRAM: remote.app.getName(),
  TERM_PROGRAM_VERSION: remote.app.getVersion(),
}

export default {
  states: {
    resizer: null,
    tabs: [],
    active: -1,
  },
  accessors: {
    current({state}) {
      const active = state.get([this, 'active'])
      if (active === -1) return null
      const tabs = state.get([this, 'tabs'])
      return tabs[active]
    },
  },
  actions: {
    // eslint-disable-next-line max-lines-per-function
    spawn({state, accessor}) {
      const settings = state.get('settings.user')
      const shell = settings['terminal.shell.path'] || (
        process.platform === 'win32' ? process.env.COMSPEC : process.env.SHELL)
      const env = {
        ...process.env,
        ...settings['terminal.shell.env'],
        ...variables,
      }
      // Fix NVM `npm_config_prefix` error
      if (env.npm_config_prefix) delete env.npm_config_prefix
      // Initialize node-pty process
      const pty = spawn(shell, settings['terminal.shell.args'], {
        name: 'xterm-256color',
        encoding: 'utf8',
        cwd: env.HOME,
        env,
      })
      const tab = {
        pty, title: '',
        id: pty.pid,
        process: pty.process,
      }
      const {theme, allowTransparency} = accessor.get('theme.xterm')
      // Initialize xterm.js and attach it to the DOM
      const xterm = new Terminal({
        fontSize: settings['terminal.style.fontSize'],
        fontFamily: settings['terminal.style.fontFamily'],
        allowTransparency,
        theme,
      })
      // Setup communication between xterm.js and node-pty
      xterm.on('data', data => {
        pty.write(data)
      })
      pty.on('data', data => {
        xterm.write(data)
        // TODO: performance review
        const process = pty.process
        if (tab.process !== process) {
          state.update([this, 'tabs'], () => {tab.process = pty.process})
        }
      })
      pty.on('exit', () => {
        state.update([this, 'tabs'], tabs => {
          const index = tabs.indexOf(tab)
          if (index !== -1) {
            tabs.splice(index, 1)
            if (!tabs.length) {
              remote.getCurrentWindow().close()
            }
          }
        })
      })
      xterm.on('resize', ({cols, rows}) => {
        pty.resize(cols, rows)
      })
      xterm.on('title', title => {
        state.update([this, 'tabs'], () => {tab.title = title})
        if (tab === state.get([this, 'current'])) {
          document.title = title
        }
      })
      tab.xterm = xterm
      state.update([this, 'tabs'], tabs => {
        const length = tabs.push(tab)
        state.set([this, 'active'], length - 1)
      })
    },
    mount({state}, {tab, element}) {
      const settings = state.get('settings.user')
      const {xterm} = tab
      requestIdleCallback(() => {
        if (xterm.element) {
          element.appendChild(xterm.element)
        } else {
          xterm.open(element)
          if (settings['terminal.style.fontLigatures']) {
            xterm.enableLigatures()
          }
        }
        xterm.fit()
        xterm.focus()
      })
    },
    resize({state, accessor}) {
      if (state.get([this, 'resizer'])) return
      const resizer = requestAnimationFrame(() => {
        const current = accessor.get([this, 'current'])
        if (!current) return
        if (current.xterm) current.xterm.fit()
        state.set([this, 'resizer'], null)
      })
      state.set([this, 'resizer'], resizer)
    },
    input(Maye, {tab, data}) {
      tab.pty.write(data)
    },
  }
}

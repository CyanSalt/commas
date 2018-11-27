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
    element: null,
    resizer: null,
    tabs: [],
    current: null,
  },
  accessors: {
    title({state}) {
      const current = state.get([this, 'current'])
      if (!current) return ''
      return current.title
    },
  },
  actions: {
    // eslint-disable-next-line max-lines-per-function
    spawn({state, accessor}) {
      const settings = state.get('settings.user')
      const tab = {
        id: Symbol('terminal'),
        title: '',
      }
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
      })
      pty.on('exit', () => {
        // TODO: support multiple tabs
        remote.getCurrentWindow().close()
      })
      xterm.on('resize', ({cols, rows}) => {
        pty.resize(cols, rows)
      })
      xterm.on('title', title => {
        state.update([this, 'tabs'], () => {tab.title = title})
        document.title = title
      })
      Object.assign(tab, {pty, xterm})
      state.update([this, 'tabs'], tabs => {tabs.push(tab)})
      state.set([this, 'current'], tab)
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
    resize({state}) {
      if (state.get([this, 'resizer'])) return
      const current = state.get([this, 'tabs'])
      if (!current) return
      const resizer = requestAnimationFrame(() => {
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

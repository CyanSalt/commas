import {spawn} from 'node-pty'
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as ligatures from 'xterm-addon-ligatures'

Terminal.applyAddon(fit)
Terminal.applyAddon(ligatures)

export default {
  states: {
    pty: null,
    xterm: null,
    element: null,
    resizer: null,
  },
  actions: {
    load({state, accessor, action}) {
      const settings = state.get('settings.user')
      const shell = settings['terminal.shell.path'] || (
        process.platform === 'win32' ? process.env.COMSPEC : process.env.SHELL)
      // Fix NVM `npm_config_prefix` error
      const env = {...process.env, ...settings['terminal.shell.env']}
      delete env.npm_config_prefix
      // Initialize node-pty process
      const pty = spawn(shell, settings['terminal.shell.args'], {
        name: 'xterm-color',
        cwd: process.cwd(),
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
      xterm.on('resize', ({cols, rows}) => {
        pty.resize(cols, rows)
      })
      state.set([this, 'pty'], pty)
      state.set([this, 'xterm'], xterm)
      action.dispatch([this, 'mount'])
    },
    mount({state, action}) {
      const xterm = state.get([this, 'xterm'])
      const element = state.get([this, 'element'])
      const settings = state.get('settings.user')
      if (!xterm || !element) return
      requestIdleCallback(() => {
        xterm.open(element)
        xterm.fit()
        if (settings['terminal.style.fontLigatures']) {
          xterm.enableLigatures()
        }
      })
      window.addEventListener('resize', () => {
        action.dispatch([this, 'resize'])
      }, false)
    },
    specify({state, action}, element) {
      state.set([this, 'element'], element)
      action.dispatch([this, 'mount'])
    },
    resize({state}) {
      if (state.get([this, 'resizer'])) return
      const xterm = state.get([this, 'xterm'])
      const resizer = requestAnimationFrame(() => {
        if (xterm) xterm.fit()
        state.set([this, 'resizer'], null)
      })
      state.set([this, 'resizer'], resizer)
    },
    input({state}, data) {
      const pty = state.get([this, 'pty'])
      pty.write(data)
    },
  }
}

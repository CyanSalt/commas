import {spawn} from 'node-pty'
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
Terminal.applyAddon(fit)

export default {
  states: {
    pty: null,
    xterm: null,
    element: null,
    resizer: null,
  },
  actions: {
    async load({state, accessor}) {
      const settings = await state.get('settings.user')
      const shell = settings['terminal.shell.path'] || (
        process.platform === 'win32' ? process.env.COMSPEC : process.env.SHELL)
      // Fix NVM `npm_config_prefix` error
      const env = {...process.env, ...settings['terminal.shell.env']}
      delete env.npm_config_prefix
      // Initialize node-pty process
      const pty = spawn(shell, settings['terminal.shell.args'], {
        name: 'xterm-color',
        cols: settings['terminal.shell.cols'],
        rows: settings['terminal.shell.rows'],
        cwd: process.cwd(),
        env,
      })
      const {theme, allowTransparency} = accessor.get('theme.xterm')
      // Initialize xterm.js and attach it to the DOM
      const xterm = new Terminal({
        cols: settings['terminal.shell.cols'],
        rows: settings['terminal.shell.rows'],
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
      // Bind xterm element
      const element = state.get([this, 'element'])
      if (element) {
        requestIdleCallback(() => xterm.open(element))
      }
      state.set([this, 'pty'], pty)
      state.set([this, 'xterm'], xterm)
    },
    mount({state, action}, element) {
      state.set([this, 'element'], element)
      const xterm = state.get([this, 'xterm'])
      if (xterm) xterm.open(element)
      window.addEventListener('resize', () => {
        action.dispatch([this, 'resize'])
      }, false)
    },
    resize({state}) {
      const xterm = state.get([this, 'xterm'])
      let resizer = state.get([this, 'resizer'])
      if (resizer) {
        cancelAnimationFrame(resizer)
        state.set([this, 'resizer'], null)
      }
      resizer = requestAnimationFrame(() => {
        if (xterm) xterm.fit()
        state.set([this, 'resizer'], null)
      })
      state.set([this, 'resizer'], resizer)
    },
  }
}

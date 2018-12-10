import {spawn} from 'node-pty'
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as search from 'xterm/lib/addons/search/search'
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
import * as ligatures from 'xterm-addon-ligatures'
import {remote} from 'electron'

Terminal.applyAddon(fit)
Terminal.applyAddon(search)
Terminal.applyAddon(webLinks)
Terminal.applyAddon(ligatures)

const variables = {
  LANG: remote.app.getLocale().replace('-', '_') + '.UTF-8',
  TERM_PROGRAM: remote.app.getName(),
  TERM_PROGRAM_VERSION: remote.app.getVersion(),
}

export default {
  states: {
    observer: null,
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
    spawn({state, accessor}, path) {
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
        cwd: path || env.HOME,
        env,
      })
      const tab = {
        pty, title: '',
        id: pty.pid,
        process: pty.process,
      }
      // Apply transparency background color and selection
      let theme = state.get('theme.user')
      theme = {...theme, background: 'transparent'}
      // Initialize xterm.js and attach it to the DOM
      const xterm = new Terminal({
        fontSize: settings['terminal.style.fontSize'],
        fontFamily: settings['terminal.style.fontFamily'],
        allowTransparency: true,
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
        const active = state.get([this, 'active'])
        const observer = state.get([this, 'observer'])
        if (xterm.element) {
          observer.unobserve(xterm.element)
        }
        xterm.destroy()
        state.update([this, 'tabs'], tabs => {
          const index = tabs.indexOf(tab)
          if (index !== -1) {
            tabs.splice(index, 1)
            if (!tabs.length) {
              remote.getCurrentWindow().close()
            } else if (active === index) {
              state.set([this, 'active'], Math.min(index, tabs.length - 1))
            }
          }
          if (tab.launcher) {
            state.update('launcher.all', () => {
              tab.launcher.tab = null
            })
          }
        })
      })
      xterm.on('resize', ({cols, rows}) => {
        pty.resize(cols, rows)
      })
      xterm.on('title', title => {
        state.update([this, 'tabs'], () => {tab.title = title})
        if (tab === accessor.get([this, 'current'])) {
          document.title = title
        }
      })
      tab.xterm = xterm
      state.update([this, 'tabs'], tabs => {
        const length = tabs.push(tab)
        state.set([this, 'active'], length - 1)
      })
      return tab
    },
    mount({state, action}, {tab, element}) {
      let observer = state.get([this, 'observer'])
      if (!observer) {
        observer = new ResizeObserver(() => {
          action.dispatch([this, 'resize'])
        })
        state.set([this, 'observer'], observer)
      }
      const settings = state.get('settings.user')
      const {xterm} = tab
      requestIdleCallback(() => {
        if (xterm.element) {
          element.appendChild(xterm.element)
        } else {
          xterm.open(element)
          observer.observe(element)
          xterm.webLinksInit((event, uri) => {
            if (event.altKey) action.dispatch('shell.open', uri)
          })
          if (settings['terminal.style.fontLigatures']) {
            xterm.enableLigatures()
          }
        }
        xterm.fit()
        xterm.focus()
      })
    },
    resize({accessor}) {
      const current = accessor.get([this, 'current'])
      if (current && current.xterm && current.xterm.element) {
        current.xterm.fit()
      }
    },
    input(Maye, {tab, data}) {
      tab.pty.write(data)
    },
    activite({state}, tab) {
      const tabs = state.get([this, 'tabs'])
      const index = tabs.indexOf(tab)
      if (index !== -1) {
        state.set([this, 'active'], index)
      }
    },
    close(Maye, tab) {
      tab.pty.kill()
    },
    find({accessor}, {keyword, options, back}) {
      const current = accessor.get([this, 'current'])
      if (back) {
        current.xterm.findPrevious(keyword, options)
      } else {
        current.xterm.findNext(keyword, options)
      }
    },
  }
}

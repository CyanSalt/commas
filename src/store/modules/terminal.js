import {spawn} from 'node-pty'
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as search from 'xterm/lib/addons/search/search'
import * as webLinks from 'xterm/lib/addons/webLinks/webLinks'
import * as ligatures from 'xterm-addon-ligatures'
import {remote} from 'electron'
import {updateItem, removeIndex} from '@/utils/array'

Terminal.applyAddon(fit)
Terminal.applyAddon(search)
Terminal.applyAddon(webLinks)
Terminal.applyAddon(ligatures)

const variables = {
  LANG: remote.app.getLocale().replace('-', '_') + '.UTF-8',
  TERM_PROGRAM: remote.app.getName(),
  TERM_PROGRAM_VERSION: remote.app.getVersion(),
}

const isPackaged = remote.app.isPackaged

export default {
  namespaced: true,
  state: {
    tabs: [],
    poll: new Map(),
    active: -1,
    observer: null,
  },
  getters: {
    current(state) {
      const active = state.active
      if (active === -1) return null
      const tabs = state.tabs
      return tabs[active]
    },
  },
  mutations: {
    setTabs(state, value) {
      state.tabs = value
    },
    setActive(state, value) {
      state.active = value
    },
    setObserver(state, value) {
      state.observer = value
    },
  },
  actions: {
    spawn({state, getters, commit, rootState}, path) {
      const settings = rootState.settings.settings
      const shell = settings['terminal.shell.path'] || (
        process.platform === 'win32' ? process.env.COMSPEC : process.env.SHELL
      )
      const env = {
        ...process.env,
        ...settings['terminal.shell.env'],
        ...variables,
      }
      // Fix NVM `npm_config_prefix` error in development environment
      if (!isPackaged && env.npm_config_prefix) delete env.npm_config_prefix
      // Initialize node-pty process
      const pty = spawn(shell, settings['terminal.shell.args'], {
        name: 'xterm-256color',
        encoding: 'utf8',
        cwd: path || env.HOME,
        env,
      })
      const id = pty.pid
      // issue@xterm: apply transparency background color and selection
      const theme = {
        ...rootState.theme.theme,
        background: 'transparent',
      }
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
        const tab = state.tabs.find(tab => tab.id === id)
        const process = pty.process
        if (tab.process !== process) {
          commit('setTabs', updateItem(state.tabs, tab, {process}))
        }
      })
      pty.on('exit', () => {
        if (xterm.element) {
          state.observer.unobserve(xterm.element)
        }
        xterm.destroy()
        const index = state.tabs.findIndex(tab => tab.id === id)
        if (index !== -1) {
          state.poll.delete(id)
          const tabs = removeIndex(state.tabs, index)
          commit('setTabs', tabs)
          if (!tabs.length) {
            remote.getCurrentWindow().close()
          } else if (state.active === index) {
            commit('setActive', Math.min(index, tabs.length - 1))
          }
        }
      })
      xterm.on('resize', ({cols, rows}) => {
        pty.resize(cols, rows)
      })
      xterm.on('title', title => {
        const tab = state.tabs.find(tab => tab.id === id)
        if (tab.title !== title) {
          commit('setTabs', updateItem(state.tabs, tab, {title}))
        }
        if (getters.current.id === id) {
          document.title = title
        }
      })
      // Create new tab for current terminal
      // TODO: put this before pty and xterm created
      const tab = {
        id,
        title: '',
        process: pty.process,
      }
      state.poll.set(id, {pty, xterm})
      commit('setTabs', [...state.tabs, tab])
      commit('setActive', state.tabs.length - 1)
    },
    mount({state, commit, dispatch, rootState}, {tab, element}) {
      let observer = state.observer
      if (!observer) {
        observer = new ResizeObserver(() => {
          dispatch('resize')
        })
        commit('setObserver', observer)
      }
      const settings = rootState.settings.settings
      const {xterm} = state.poll.get(tab.id)
      requestIdleCallback(() => {
        if (xterm.element) {
          element.appendChild(xterm.element)
        } else {
          xterm.open(element)
          observer.observe(element)
          xterm.webLinksInit((event, uri) => {
            if (event.altKey) dispatch('shell/open', uri, {root: true})
          })
          if (settings['terminal.style.fontLigatures']) {
            xterm.enableLigatures()
          }
        }
        xterm.fit()
        xterm.focus()
      }, {timeout: 1000})
    },
    resize({getters}) {
      const current = getters.current
      if (current && current.xterm && current.xterm.element) {
        current.xterm.fit()
      }
    },
    input({state}, {tab, data}) {
      state.poll.get(tab.id).pty.write(data)
    },
    activite({state, commit}, tab) {
      const tabs = state.tabs
      const index = tabs.indexOf(tab)
      if (index !== -1) {
        commit('setActive', index)
      }
    },
    close({state}, tab) {
      state.poll.get(tab.id).pty.kill()
    },
    find({getters}, {keyword, options, back}) {
      const current = getters.current
      if (back) {
        current.xterm.findPrevious(keyword, options)
      } else {
        current.xterm.findNext(keyword, options)
      }
    },
    refresh({state, rootState}) {
      const tabs = state.tabs
      const settings = rootState.settings.settings
      let theme = rootState.theme.theme
      theme = {...theme, background: 'transparent'}
      // TODO: performance review
      for (const tab of tabs) {
        const {xterm} = state.poll.get(tab.id)
        xterm.setOption('fontSize', settings['terminal.style.fontSize'])
        xterm.setOption('fontFamily', settings['terminal.style.fontFamily'])
        xterm.setOption('theme', theme)
        if (settings['terminal.style.fontLigatures']) {
          xterm.enableLigatures()
        }
      }
    },
  },
}
